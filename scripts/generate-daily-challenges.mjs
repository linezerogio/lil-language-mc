import crypto from 'node:crypto';
import {
  DAILY_INTERNAL_DIFFICULTY,
  DAILY_START_DATE,
  DAILY_STRONG_RHYME_CELL_CAP,
  DAILY_TARGET_COUNT,
  createSql,
} from './daily-common.mjs';
import { getDailySchedulePool } from './daily-schedule-pool.mjs';

const dryRun = process.argv.includes('--dry-run');
const batchSize = 500;
const seed = 'daily-schedule-v1';

function deterministicHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function addDays(dateString, offset) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}

function sortDeterministically(rows) {
  return [...rows].sort((left, right) => {
    const leftHash = deterministicHash(`${seed}:${left.word}`);
    const rightHash = deterministicHash(`${seed}:${right.word}`);
    return (
      leftHash.localeCompare(rightHash) ||
      Number(left.id) - Number(right.id) ||
      left.word.localeCompare(right.word)
    );
  });
}

function buildScheduleRows(poolRows) {
  const rows = sortDeterministically(poolRows);

  return Array.from({ length: DAILY_TARGET_COUNT }, (_, index) => {
    const row = rows[index];
    if (!row) {
      throw new Error(`Ran out of Daily pool rows at schedule index ${index}.`);
    }

    return {
      challenge_date: addDays(DAILY_START_DATE, index),
      word_id: row.id,
      word: row.word,
      difficulty: DAILY_INTERNAL_DIFFICULTY,
    };
  });
}

const sql = createSql();

try {
  const poolRows = await getDailySchedulePool(sql);
  if (poolRows.length !== DAILY_TARGET_COUNT) {
    throw new Error(`Expected ${DAILY_TARGET_COUNT} schedule pool rows, found ${poolRows.length}.`);
  }

  const scheduleRows = buildScheduleRows(poolRows);
  const uniqueWords = new Set(scheduleRows.map((row) => row.word_id));
  const uniqueDates = new Set(scheduleRows.map((row) => row.challenge_date));
  if (uniqueWords.size !== DAILY_TARGET_COUNT) {
    throw new Error(`Expected ${DAILY_TARGET_COUNT} unique words, found ${uniqueWords.size}.`);
  }
  if (uniqueDates.size !== DAILY_TARGET_COUNT) {
    throw new Error(`Expected ${DAILY_TARGET_COUNT} unique dates, found ${uniqueDates.size}.`);
  }

  const existing = await sql`
    select
      count(*)::int as challenge_count,
      (select count(*)::int from daily_attempts) as attempt_count
    from daily_challenges
  `;

  if (existing[0].challenge_count > 0) {
    throw new Error(
      `daily_challenges already has ${existing[0].challenge_count} rows. Refusing to overwrite an existing schedule.`,
    );
  }

  const preview = {
    dryRun,
    rows: scheduleRows.length,
    startDate: scheduleRows[0].challenge_date,
    endDate: scheduleRows.at(-1).challenge_date,
    firstFive: scheduleRows.slice(0, 5),
    internalDifficulty: DAILY_INTERNAL_DIFFICULTY,
    existingBeforeInsert: existing[0],
  };

  if (dryRun) {
    console.log(JSON.stringify(preview, null, 2));
  } else {
    await sql.begin(async (transaction) => {
      await transaction`alter sequence daily_challenges_id_seq restart with 1`;
      for (let index = 0; index < scheduleRows.length; index += batchSize) {
        const chunk = scheduleRows.slice(index, index + batchSize);
        await transaction`
          insert into daily_challenges ${transaction(
            chunk,
            'challenge_date',
            'word_id',
            'word',
            'difficulty',
          )}
        `;
      }
    });

    const verification = await sql.unsafe(`
      with chronological as (
        select
          id,
          challenge_date,
          row_number() over (order by challenge_date) as chronological_rank
        from daily_challenges
      ),
      duplicate_dates as (
        select challenge_date
        from daily_challenges
        group by challenge_date
        having count(*) > 1
      ),
      duplicate_words as (
        select word_id
        from daily_challenges
        group by word_id
        having count(*) > 1
      ),
      strong_cells as (
        select words.strong_rhyme_key, count(*)::int as scheduled_count
        from daily_challenges
        join words on words.id = daily_challenges.word_id
        group by words.strong_rhyme_key
      )
      select
        (select count(*)::int from daily_challenges) as total_rows,
        (select min(id)::int from daily_challenges) as min_id,
        (select max(id)::int from daily_challenges) as max_id,
        (select min(challenge_date)::text from daily_challenges) as min_date,
        (select max(challenge_date)::text from daily_challenges) as max_date,
        (select count(*)::int from duplicate_dates) as duplicate_date_count,
        (select count(*)::int from duplicate_words) as duplicate_word_count,
        (select count(*)::int from chronological where id <> chronological_rank) as non_chronological_id_count,
        (select max(scheduled_count)::int from strong_cells) as max_strong_cell_count
    `);
    const internalDifficultyCounts = await sql`
      select difficulty, count(*)::int as count
      from daily_challenges
      group by difficulty
      order by difficulty
    `;

    console.log(
      JSON.stringify(
        {
          inserted: preview,
          verification: verification[0],
          internalDifficultyCounts,
          strongCellCap: DAILY_STRONG_RHYME_CELL_CAP,
        },
        null,
        2,
      ),
    );
  }
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
