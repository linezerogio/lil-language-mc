import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createSql } from './daily-common.mjs';
import { getDailySchedulePool } from './daily-schedule-pool.mjs';

const outputDir = path.resolve('daily-review-samples');
const sampleSize = 100;
const sql = createSql();

function deterministicHash(value) {
  return crypto.createHash('md5').update(value).digest('hex');
}

function toMarkdown(title, rows) {
  const lines = [
    `# ${title}`,
    '',
    '| Word | Pronunciation | Strong Rhymes | Near Rhymes | Total Usable | Strong Cell Size | Strong Cell Rank | Rhyme Score |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.word} | ${row.pronunciation ?? ''} | ${row.perfect_rhyme_count} | ${row.near_rhyme_count} | ${row.total_usable_rhyme_count} | ${row.strong_rhyme_cell_size} | ${row.strong_cell_rank} | ${row.rhymability_score} |`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

try {
  fs.mkdirSync(outputDir, { recursive: true });
  const rows = await getDailySchedulePool(sql);
  const sampleRows = rows
    .sort((left, right) =>
      deterministicHash(`${left.word}:daily-review-v2`).localeCompare(
        deterministicHash(`${right.word}:daily-review-v2`),
      ),
    )
    .slice(0, sampleSize);
  const outputPath = path.join(outputDir, 'daily.md');
  fs.writeFileSync(outputPath, toMarkdown('Daily review sample', sampleRows), 'utf8');
  console.log(`${path.relative(process.cwd(), outputPath)} rows=${sampleRows.length}`);
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
