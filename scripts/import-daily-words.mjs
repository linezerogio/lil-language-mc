import {
  WORD_FREQ_URL,
  createSql,
  fetchJsonWithRetry,
  getBaseExclusionReason,
  normalizeWord,
} from './daily-common.mjs';

const limitArg = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1]);
const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : 25000;
const batchSize = 500;

function mergeSource(existingSource, source) {
  if (!existingSource) {
    return source;
  }
  return existingSource.split(',').includes(source)
    ? existingSource
    : `${existingSource},${source}`;
}

const sql = createSql();

try {
  console.log(`Downloading wordfreq candidates from ${WORD_FREQ_URL}`);
  const wordfreqRows = await fetchJsonWithRetry(WORD_FREQ_URL);
  const candidates = new Map();

  for (const [index, row] of wordfreqRows.slice(0, limit).entries()) {
    const word = normalizeWord(row[0]);
    if (!word || candidates.has(word)) {
      continue;
    }

    candidates.set(word, {
      word,
      daily_source: 'wordfreq',
      daily_frequency_rank: index + 1,
      daily_exclusion_reason: getBaseExclusionReason(word),
    });
  }

  const existingRows = await sql`select word, daily_source, daily_frequency_rank from words`;
  for (const row of existingRows) {
    const word = normalizeWord(row.word);
    if (!word) {
      continue;
    }

    const existingCandidate = candidates.get(word);
    if (existingCandidate) {
      existingCandidate.daily_source = mergeSource(existingCandidate.daily_source, 'existing-db');
      continue;
    }

    candidates.set(word, {
      word,
      daily_source: mergeSource(row.daily_source, 'existing-db'),
      daily_frequency_rank: row.daily_frequency_rank,
      daily_exclusion_reason: getBaseExclusionReason(word),
    });
  }

  const candidateRows = [...candidates.values()];
  let upserted = 0;

  for (let offset = 0; offset < candidateRows.length; offset += batchSize) {
    const batch = candidateRows.slice(offset, offset + batchSize);
    const insertRows = batch.map((row) => ({
      word: row.word,
      pronunciation: '',
      rhymescore: 0,
      daily_source: row.daily_source,
      daily_frequency_rank: row.daily_frequency_rank,
      daily_exclusion_reason: row.daily_exclusion_reason,
      eligible_for_daily: false,
    }));

    await sql`
      insert into words ${sql(
        insertRows,
        'word',
        'pronunciation',
        'rhymescore',
        'daily_source',
        'daily_frequency_rank',
        'daily_exclusion_reason',
        'eligible_for_daily',
      )}
      on conflict (word) do update set
        daily_source = excluded.daily_source,
        daily_frequency_rank = coalesce(words.daily_frequency_rank, excluded.daily_frequency_rank),
        daily_exclusion_reason = excluded.daily_exclusion_reason,
        eligible_for_daily = false
    `;
    upserted += batch.length;
    console.log(`upserted=${upserted}/${candidateRows.length}`);
  }

  const summary = await sql.unsafe(`
    select
      count(*)::int as total_candidates,
      count(*) filter (where daily_source is not null and daily_exclusion_reason is null)::int as ready_for_enrichment,
      count(*) filter (where daily_source is not null and daily_exclusion_reason is not null)::int as excluded_before_enrichment
    from words
    where daily_source is not null
  `);
  const reasons = await sql.unsafe(`
    select daily_exclusion_reason, count(*)::int as count
    from words
    where daily_source is not null and daily_exclusion_reason is not null
    group by daily_exclusion_reason
    order by count desc, daily_exclusion_reason
  `);

  console.log(JSON.stringify({ summary: summary[0], reasons }, null, 2));
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
