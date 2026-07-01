import fs from 'node:fs';
import path from 'node:path';
import nlp from 'compromise';
import { createSql } from './daily-common.mjs';
import { getDailySchedulePool } from './daily-schedule-pool.mjs';

const outputDir = path.resolve('daily-risk-review');
const sql = createSql();

const EXACT_REVIEW_WORDS = new Set([
  'abc',
  'app',
  'apps',
  'bbc',
  'cbs',
  'cnn',
  'css',
  'docs',
  'dvd',
  'eu',
  'gps',
  'html',
  'http',
  'https',
  'ios',
  'mlb',
  'nasa',
  'nba',
  'nbc',
  'nfl',
  'nhl',
  'pc',
  'pdf',
  'seo',
  'sql',
  'tv',
  'uk',
  'usa',
  'www',
]);

const MORPHOLOGY_SUFFIXES = [
  'ization',
  'ations',
  'itions',
  'ively',
  'arily',
  'ality',
  'ating',
  'ising',
  'ized',
  'izes',
  'tion',
  'sion',
];

const SHORT_WORD_ALLOWLIST = new Set([
  'act',
  'add',
  'age',
  'aim',
  'air',
  'arm',
  'art',
  'ash',
  'ask',
  'bag',
  'bar',
  'bat',
  'bay',
  'bed',
  'bee',
  'bet',
  'big',
  'bin',
  'bit',
  'box',
  'boy',
  'bus',
  'buy',
  'cab',
  'can',
  'cap',
  'car',
  'cat',
  'cop',
  'cow',
  'cry',
  'cup',
  'cut',
  'dad',
  'day',
  'den',
  'die',
  'dig',
  'dog',
  'dot',
  'dry',
  'ear',
  'eat',
  'egg',
  'end',
  'eye',
  'fan',
  'far',
  'fat',
  'fee',
  'few',
  'fig',
  'fit',
  'fix',
  'fly',
  'fog',
  'fox',
  'fun',
  'fur',
  'gas',
  'gem',
  'get',
  'god',
  'gum',
  'gun',
  'gut',
  'gym',
  'hat',
  'hay',
  'hen',
  'hit',
  'hot',
  'ice',
  'ink',
  'jam',
  'jar',
  'jet',
  'job',
  'joy',
  'key',
  'kid',
  'kit',
  'lab',
  'lap',
  'law',
  'leg',
  'let',
  'lid',
  'lie',
  'lip',
  'log',
  'lot',
  'mad',
  'man',
  'map',
  'mat',
  'mix',
  'mom',
  'mud',
  'net',
  'new',
  'nod',
  'nut',
  'oak',
  'odd',
  'oil',
  'old',
  'one',
  'owl',
  'pad',
  'pan',
  'pat',
  'pay',
  'pen',
  'pet',
  'pie',
  'pig',
  'pin',
  'pop',
  'pot',
  'red',
  'rib',
  'rid',
  'rim',
  'rip',
  'rod',
  'row',
  'rug',
  'run',
  'sad',
  'sea',
  'see',
  'set',
  'sip',
  'sit',
  'six',
  'ski',
  'sky',
  'son',
  'sun',
  'tag',
  'tap',
  'tax',
  'tea',
  'ten',
  'tie',
  'tin',
  'tip',
  'toe',
  'top',
  'toy',
  'try',
  'tub',
  'two',
  'van',
  'vet',
  'war',
  'wax',
  'web',
  'wet',
  'win',
  'yes',
  'yet',
  'zip',
]);

function escapeCell(value) {
  return String(value ?? '').replaceAll('|', '\\|');
}

function getMorphologySuffix(word) {
  return MORPHOLOGY_SUFFIXES.find((suffix) => word.endsWith(suffix));
}

function getNlpTags(word) {
  const titleCased = `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
  return new Set(nlp(titleCased).json()[0]?.terms?.[0]?.tags ?? []);
}

function getRiskReasons(row) {
  const reasons = [];
  if (EXACT_REVIEW_WORDS.has(row.word)) {
    reasons.push('exact-token-review');
  }

  if (row.word.length === 3 && !SHORT_WORD_ALLOWLIST.has(row.word)) {
    reasons.push('short-word-review');
  }

  const suffix = getMorphologySuffix(row.word);
  if (suffix) {
    reasons.push(`morphology:${suffix}`);
  }

  const tags = getNlpTags(row.word);
  if (tags.has('Person') || tags.has('FirstName')) {
    reasons.push('nlp-person-review');
  }
  if (tags.has('Place') || tags.has('Country')) {
    reasons.push('nlp-place-review');
  }
  if (tags.has('Organization')) {
    reasons.push('nlp-organization-review');
  }
  if (tags.has('Demonym')) {
    reasons.push('nlp-demonym-review');
  }
  if (tags.has('Month') || tags.has('WeekDay')) {
    reasons.push('nlp-calendar-review');
  }

  return reasons;
}

function toWordTable(rows) {
  const lines = [
    '| Word | Reasons | Strong | Near | Total | Strong Key | Strong Cell Rank | Rank |',
    '| --- | --- | ---: | ---: | ---: | --- | ---: | ---: |',
  ];

  for (const row of rows) {
    lines.push(
      `| ${escapeCell(row.word)} | ${escapeCell(row.reasons.join(', '))} | ${row.perfect_rhyme_count} | ${row.near_rhyme_count} | ${row.total_usable_rhyme_count} | ${escapeCell(row.strong_rhyme_key)} | ${row.strong_cell_rank} | ${row.schedule_rank} |`,
    );
  }

  return lines.join('\n');
}

function groupCounts(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
}

try {
  fs.mkdirSync(outputDir, { recursive: true });
  const rows = await getDailySchedulePool(sql);
  const flaggedRows = rows
    .map((row) => ({ ...row, reasons: getRiskReasons(row) }))
    .filter((row) => row.reasons.length > 0);
  const morphologyRows = flaggedRows.filter((row) =>
    row.reasons.some((reason) => reason.startsWith('morphology:')),
  );
  const shortRows = flaggedRows.filter((row) => row.reasons.includes('short-word-review'));
  const exactRows = flaggedRows.filter((row) => row.reasons.includes('exact-token-review'));
  const nlpRows = flaggedRows.filter((row) =>
    row.reasons.some((reason) => reason.startsWith('nlp-')),
  );
  const strongCellRows = groupCounts(rows, (row) => row.strong_rhyme_key)
    .filter(([, count]) => count >= 10)
    .map(([strongKey, count]) => {
      const examples = rows
        .filter((row) => row.strong_rhyme_key === strongKey)
        .slice(0, 12)
        .map((row) => row.word);
      return { strongKey, count, examples };
    });

  const reasonCounts = new Map();
  for (const row of flaggedRows) {
    for (const reason of row.reasons) {
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
    }
  }

  const morphologyCounts = groupCounts(morphologyRows, (row) =>
    row.reasons.find((reason) => reason.startsWith('morphology:')),
  );

  const summary = [
    '# Daily Risk Review',
    '',
    `Schedule-shaped pool rows: ${rows.length}`,
    `Flagged rows: ${flaggedRows.length}`,
    `Exact token/name/acronym review rows: ${exactRows.length}`,
    `Short word review rows: ${shortRows.length}`,
    `Morphology review rows: ${morphologyRows.length}`,
    `NLP proper-name/place/org/calendar rows: ${nlpRows.length}`,
    '',
    '## By Reason',
    '',
    '| Reason | Count |',
    '| --- | ---: |',
    ...[...reasonCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([reason, count]) => `| ${reason} | ${count} |`),
    '',
  ].join('\n');

  const morphologySummary = [
    '# Daily Morphology Review',
    '',
    '| Suffix | Count | Examples |',
    '| --- | ---: | --- |',
    ...morphologyCounts.map(([reason, count]) => {
      const examples = morphologyRows
        .filter((row) => row.reasons.includes(reason))
        .slice(0, 20)
        .map((row) => row.word)
        .join(', ');
      return `| ${reason.replace('morphology:', '')} | ${count} | ${escapeCell(examples)} |`;
    }),
    '',
  ].join('\n');

  const strongCells = [
    '# Daily Strong-Rhyme Cell Review',
    '',
    '| Strong Key | Scheduled Count | Examples |',
    '| --- | ---: | --- |',
    ...strongCellRows.map(
      (row) =>
        `| ${escapeCell(row.strongKey)} | ${row.count} | ${escapeCell(row.examples.join(', '))} |`,
    ),
    '',
  ].join('\n');

  fs.writeFileSync(path.join(outputDir, 'summary.md'), summary, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'flagged-words.md'), toWordTable(flaggedRows), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'short-words.md'), toWordTable(shortRows), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'exact-tokens.md'), toWordTable(exactRows), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'nlp-proper.md'), toWordTable(nlpRows), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'morphology.md'), morphologySummary, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'strong-cells.md'), strongCells, 'utf8');

  console.log(
    JSON.stringify(
      {
        poolRows: rows.length,
        flaggedRows: flaggedRows.length,
        exactRows: exactRows.length,
        shortRows: shortRows.length,
        morphologyRows: morphologyRows.length,
        nlpRows: nlpRows.length,
        outputDir: path.relative(process.cwd(), outputDir),
      },
      null,
      2,
    ),
  );
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
