import { dictionary } from 'cmu-pronouncing-dictionary';
import {
  DAILY_MIN_STRONG_RHYMES,
  DAILY_MIN_TOTAL_USABLE_RHYMES,
  DAILY_STRONG_RHYME_CELL_CAP,
  createSql,
  hasStressMarker,
} from './daily-common.mjs';

const limitArg = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1]);
const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : 25000;

const RECOMPUTABLE_REASONS = new Set([
  'missing-pronunciation',
  'missing-stress-marker',
  'not-enough-rhymes',
]);

const VOWEL_RE = /^(AA|AE|AH|AO|AW|AY|EH|ER|EY|IH|IY|OW|OY|UH|UW)[012]$/;
const UPDATE_CHUNK_SIZE = 1000;

function normalizeDictionaryWord(word) {
  return String(word).toLowerCase().replace(/\(\d+\)$/, '');
}

function splitPronunciation(pronunciation) {
  return String(pronunciation).trim().split(/\s+/).filter(Boolean);
}

function isVowel(phoneme) {
  return VOWEL_RE.test(phoneme);
}

function stripStress(phoneme) {
  return phoneme.replace(/[012]$/, '');
}

function getLastStressedVowelIndex(phonemes) {
  for (let index = phonemes.length - 1; index >= 0; index--) {
    if (isVowel(phonemes[index]) && /[12]$/.test(phonemes[index])) {
      return index;
    }
  }

  for (let index = phonemes.length - 1; index >= 0; index--) {
    if (isVowel(phonemes[index])) {
      return index;
    }
  }

  return -1;
}

function getPerfectRhymeKey(phonemes) {
  const lastStressedVowelIndex = getLastStressedVowelIndex(phonemes);
  return lastStressedVowelIndex === -1
    ? ''
    : phonemes.slice(lastStressedVowelIndex).join(' ');
}

function getNearRhymeKey(phonemes) {
  const lastStressedVowelIndex = getLastStressedVowelIndex(phonemes);
  if (lastStressedVowelIndex === -1) {
    return '';
  }

  const suffix = phonemes.slice(lastStressedVowelIndex);
  const vowelSequence = suffix.filter(isVowel).map(stripStress).join(' ');
  const finalSound = stripStress(suffix.at(-1));
  return `${vowelSequence}|${finalSound}`;
}

function addToSetMap(map, key, value) {
  if (!key) {
    return;
  }

  if (!map.has(key)) {
    map.set(key, new Set());
  }

  map.get(key).add(value);
}

function shouldRecompute(row) {
  return (
    !row.daily_exclusion_reason ||
    RECOMPUTABLE_REASONS.has(row.daily_exclusion_reason) ||
    row.daily_exclusion_reason.startsWith('enrichment-error:')
  );
}

function buildPronunciationIndex(candidateWords) {
  const pronunciationsByWord = new Map();
  const perfectRhymeWordsByKey = new Map();
  const nearRhymeWordsByKey = new Map();

  for (const [rawWord, pronunciation] of Object.entries(dictionary)) {
    const word = normalizeDictionaryWord(rawWord);
    if (!candidateWords.has(word)) {
      continue;
    }

    if (!pronunciationsByWord.has(word)) {
      pronunciationsByWord.set(word, new Set());
    }
    pronunciationsByWord.get(word).add(pronunciation);

    const phonemes = splitPronunciation(pronunciation);
    addToSetMap(perfectRhymeWordsByKey, getPerfectRhymeKey(phonemes), word);
    addToSetMap(nearRhymeWordsByKey, getNearRhymeKey(phonemes), word);
  }

  return { pronunciationsByWord, perfectRhymeWordsByKey, nearRhymeWordsByKey };
}

function getRhymeStats(word, pronunciation, perfectRhymeWordsByKey, nearRhymeWordsByKey) {
  const phonemes = splitPronunciation(pronunciation);
  const perfectKey = getPerfectRhymeKey(phonemes);
  const nearKey = getNearRhymeKey(phonemes);
  const perfectWords = new Set(perfectRhymeWordsByKey.get(perfectKey) ?? []);
  const nearWords = new Set(nearRhymeWordsByKey.get(nearKey) ?? []);

  perfectWords.delete(word);
  nearWords.delete(word);

  for (const perfectWord of perfectWords) {
    nearWords.delete(perfectWord);
  }

  const totalUsableWords = new Set([...perfectWords, ...nearWords]);
  const perfect_rhyme_count = perfectWords.size;
  const near_rhyme_count = nearWords.size;
  const total_usable_rhyme_count = totalUsableWords.size;
  const rhymescore = perfect_rhyme_count * 2 + near_rhyme_count;

  return {
    pronunciation,
    rhymescore,
    has_stress_marker: hasStressMarker(pronunciation),
    strong_rhyme_key: perfectKey || null,
    strong_rhyme_cell_size: perfectRhymeWordsByKey.get(perfectKey)?.size ?? 0,
    perfect_rhyme_count,
    near_rhyme_count,
    total_usable_rhyme_count,
  };
}

function chooseBestPronunciationStats(row, pronunciationIndex) {
  const pronunciations = pronunciationIndex.pronunciationsByWord.get(row.word);

  if (!pronunciations || pronunciations.size === 0) {
    return {
      id: row.id,
      word: row.word,
      pronunciation: null,
      rhymescore: 0,
      has_stress_marker: false,
      strong_rhyme_key: null,
      strong_rhyme_cell_size: 0,
      perfect_rhyme_count: 0,
      near_rhyme_count: 0,
      total_usable_rhyme_count: 0,
      daily_exclusion_reason: 'missing-pronunciation',
      eligible_for_daily: false,
    };
  }

  const stats = [...pronunciations].map((pronunciation) =>
    getRhymeStats(
      row.word,
      pronunciation,
      pronunciationIndex.perfectRhymeWordsByKey,
      pronunciationIndex.nearRhymeWordsByKey,
    ),
  );
  const best = stats.sort((left, right) => {
    if (right.rhymescore !== left.rhymescore) {
      return right.rhymescore - left.rhymescore;
    }

    if (right.perfect_rhyme_count !== left.perfect_rhyme_count) {
      return right.perfect_rhyme_count - left.perfect_rhyme_count;
    }

    return right.total_usable_rhyme_count - left.total_usable_rhyme_count;
  })[0];

  const missingReason = !best.has_stress_marker ? 'missing-stress-marker' : null;
  const weakReason =
    best.perfect_rhyme_count >= DAILY_MIN_STRONG_RHYMES &&
    best.total_usable_rhyme_count >= DAILY_MIN_TOTAL_USABLE_RHYMES
      ? null
      : 'not-enough-rhymes';
  const daily_exclusion_reason = missingReason ?? weakReason;

  return {
    id: row.id,
    word: row.word,
    ...best,
    daily_exclusion_reason,
    eligible_for_daily: !daily_exclusion_reason,
  };
}

const sql = createSql();

try {
  const rows = await sql`
    select
      id,
      word,
      daily_exclusion_reason
    from words
    where daily_source is not null
      and (
        daily_exclusion_reason is null
        or daily_exclusion_reason in ${sql([...RECOMPUTABLE_REASONS])}
        or daily_exclusion_reason like 'enrichment-error:%'
      )
    order by daily_frequency_rank nulls last, id
    limit ${limit}
  `;
  const recomputableRows = rows.filter(shouldRecompute);
  const candidateWords = new Set(recomputableRows.map((row) => row.word));

  if (recomputableRows.length === 0) {
    console.log('No recomputable daily candidates found.');
  } else {
    console.log(`Enriching ${recomputableRows.length} words from local CMU dictionary`);
  }

  const pronunciationIndex = buildPronunciationIndex(candidateWords);
  const enrichedRows = recomputableRows.map((row) =>
    chooseBestPronunciationStats(row, pronunciationIndex),
  );

  await sql`set client_min_messages to warning`;
  await sql`drop table if exists daily_word_enrichment_updates`;
  await sql`reset client_min_messages`;
  await sql`
    create temporary table daily_word_enrichment_updates (
      id integer primary key,
      pronunciation text,
      rhymescore integer not null,
      has_stress_marker boolean not null,
      strong_rhyme_key text,
      strong_rhyme_cell_size integer not null,
      perfect_rhyme_count integer not null,
      near_rhyme_count integer not null,
      total_usable_rhyme_count integer not null,
      daily_exclusion_reason text,
      eligible_for_daily boolean not null
    )
  `;

  for (let index = 0; index < enrichedRows.length; index += UPDATE_CHUNK_SIZE) {
    const chunk = enrichedRows.slice(index, index + UPDATE_CHUNK_SIZE);
    await sql`
      insert into daily_word_enrichment_updates ${sql(
        chunk,
        'id',
        'pronunciation',
        'rhymescore',
        'has_stress_marker',
        'strong_rhyme_key',
        'strong_rhyme_cell_size',
        'perfect_rhyme_count',
        'near_rhyme_count',
        'total_usable_rhyme_count',
        'daily_exclusion_reason',
        'eligible_for_daily',
      )}
    `;
  }

  const updatedRows = await sql`
    update words
    set
      pronunciation = updates.pronunciation,
      rhymescore = updates.rhymescore,
      has_stress_marker = updates.has_stress_marker,
      strong_rhyme_key = updates.strong_rhyme_key,
      strong_rhyme_cell_size = updates.strong_rhyme_cell_size,
      perfect_rhyme_count = updates.perfect_rhyme_count,
      near_rhyme_count = updates.near_rhyme_count,
      total_usable_rhyme_count = updates.total_usable_rhyme_count,
      daily_exclusion_reason = updates.daily_exclusion_reason,
      eligible_for_daily = updates.eligible_for_daily
    from daily_word_enrichment_updates updates
    where words.id = updates.id
    returning words.id
  `;
  console.log(`updated=${updatedRows.length}/${enrichedRows.length}`);

  const summary = await sql.unsafe(`
    select
      count(*) filter (where eligible_for_daily)::int as eligible,
      count(*) filter (
        where daily_source is not null
          and (
            daily_exclusion_reason is null
            or daily_exclusion_reason in ('missing-pronunciation', 'missing-stress-marker', 'not-enough-rhymes')
            or daily_exclusion_reason like 'enrichment-error:%'
          )
          and not eligible_for_daily
      )::int as remaining_ineligible,
      count(*) filter (where daily_source is not null and daily_exclusion_reason is not null)::int as excluded
    from words
  `);

  const buckets = await sql.unsafe(`
    with eligible as (
      select
        word,
        (
          least(perfect_rhyme_count, ${DAILY_STRONG_RHYME_CELL_CAP}) * 2
          + near_rhyme_count
          + floor(rhymescore / 1000.0)
        ) as rhymability_score,
        ntile(3) over (
          order by (
            least(perfect_rhyme_count, ${DAILY_STRONG_RHYME_CELL_CAP}) * 2
            + near_rhyme_count
            + floor(rhymescore / 1000.0)
          ) desc
        ) as bucket
      from words
      where eligible_for_daily
    )
    select
      case bucket when 1 then 'easy' when 2 then 'medium' else 'hard' end as difficulty,
      count(*)::int as count
    from eligible
    group by bucket
    order by bucket
  `);

  const exclusions = await sql.unsafe(`
    select daily_exclusion_reason, count(*)::int as count
    from words
    where daily_source is not null
      and daily_exclusion_reason is not null
    group by daily_exclusion_reason
    order by count desc, daily_exclusion_reason
    limit 20
  `);

  console.log(JSON.stringify({ summary: summary[0], buckets, exclusions }, null, 2));
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
