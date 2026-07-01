import postgres from 'postgres';
import { DAILY_INTERNAL_DIFFICULTY, getNewYorkDate } from '@/util/daily';
import type { DailyAttemptStatus, DailyChallenge, DailyMode } from '@/util/daily';

type DailyChallengeRow = {
  id: number;
  challenge_date: string | Date;
  word_id: number;
  word: string;
};

type DailyAttemptRow = {
  mode: DailyMode;
  submission_id: number;
};

function createSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
  }

  return postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1 });
}

function toDateString(value: string | Date) {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

function mapDailyChallenge(row: DailyChallengeRow): DailyChallenge {
  return {
    id: row.id,
    challengeDate: toDateString(row.challenge_date),
    challengeNumber: row.id,
    wordId: row.word_id,
    word: row.word,
  };
}

function emptyAttemptStatus(playerId: string, challengeId: number): DailyAttemptStatus {
  return {
    challengeId,
    playerId,
    modes: {
      freestyle: {
        completed: false,
      },
      endless: {
        completed: false,
      },
    },
  };
}

export async function getTodayDailyChallenge(date = getNewYorkDate()) {
  const sql = createSql();

  try {
    const rows = await sql<DailyChallengeRow[]>`
      select id, challenge_date, word_id, word
      from daily_challenges
      where challenge_date = ${date}
      limit 1
    `;

    return rows[0] ? mapDailyChallenge(rows[0]) : null;
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

export async function getDailyAttemptStatus(playerId: string, challengeId: number) {
  const sql = createSql();

  try {
    const status = emptyAttemptStatus(playerId, challengeId);
    const rows = await sql<DailyAttemptRow[]>`
      select mode, submission_id
      from daily_attempts
      where player_id = ${playerId}
        and daily_challenge_id = ${challengeId}
    `;

    for (const row of rows) {
      if (row.mode === '4-Bar Mode') {
        status.modes.freestyle = {
          completed: true,
          submissionId: row.submission_id,
        };
      } else if (row.mode === 'Endless Mode') {
        status.modes.endless = {
          completed: true,
          submissionId: row.submission_id,
        };
      }
    }

    return status;
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

export async function getDailyOverview(playerId?: string) {
  const challenge = await getTodayDailyChallenge();
  if (!challenge) {
    return null;
  }

  if (!playerId) {
    return { challenge };
  }

  const attemptStatus = await getDailyAttemptStatus(playerId, challenge.id);
  return { challenge, attemptStatus };
}

async function getExistingDailySubmissionId(
  sql: ReturnType<typeof createSql>,
  playerId: string,
  challengeId: number,
  mode: DailyMode,
) {
  const rows = await sql<{ submission_id: number }[]>`
    select submission_id
    from daily_attempts
    where player_id = ${playerId}
      and daily_challenge_id = ${challengeId}
      and mode = ${mode}
    limit 1
  `;

  return rows[0]?.submission_id;
}

export async function saveDailySubmission({
  playerId,
  mode,
  lines,
  score,
}: {
  playerId: string;
  mode: DailyMode;
  lines: string[];
  score: number;
}): Promise<
  | { ok: true; submissionId: number }
  | { ok: false; error: 'already_played'; submissionId?: number }
  | { ok: false; error: 'missing_challenge' | 'save_failed' }
> {
  const today = getNewYorkDate();
  const sql = createSql();

  try {
    return await sql.begin(async (transaction) => {
      const challengeRows = await transaction<DailyChallengeRow[]>`
        select id, challenge_date, word_id, word
        from daily_challenges
        where challenge_date = ${today}
        limit 1
      `;
      const challenge = challengeRows[0];

      if (!challenge) {
        return { ok: false, error: 'missing_challenge' };
      }

      const existingSubmissionId = await getExistingDailySubmissionId(
        transaction,
        playerId,
        challenge.id,
        mode,
      );

      if (existingSubmissionId) {
        return {
          ok: false,
          error: 'already_played',
          submissionId: existingSubmissionId,
        };
      }

      const submissionRows = await transaction<{ id: number }[]>`
        insert into submissions (lines, score, keyword, mode, difficulty)
        values (${lines}, ${score}, ${challenge.word}, ${mode}, ${DAILY_INTERNAL_DIFFICULTY})
        returning id
      `;
      const submissionId = submissionRows[0]?.id;

      if (!submissionId) {
        return { ok: false, error: 'save_failed' };
      }

      await transaction`
        insert into daily_attempts (daily_challenge_id, player_id, mode, submission_id)
        values (${challenge.id}, ${playerId}, ${mode}, ${submissionId})
      `;

      return { ok: true, submissionId };
    });
  } catch (error: any) {
    if (error?.code === '23505') {
      const challenge = await getTodayDailyChallenge(today);
      if (challenge) {
        const submissionId = await getExistingDailySubmissionId(
          sql,
          playerId,
          challenge.id,
          mode,
        );
        return { ok: false, error: 'already_played', submissionId };
      }
    }

    console.error('Error saving Daily submission:', error);
    return { ok: false, error: 'save_failed' };
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

export async function getDailyContextForSubmission(submissionId: number) {
  const sql = createSql();

  try {
    const rows = await sql<
      {
        challenge_date: string | Date;
        challenge_number: number;
        daily_mode: DailyMode;
      }[]
    >`
      select
        daily_challenges.challenge_date,
        daily_challenges.id as challenge_number,
        daily_attempts.mode as daily_mode
      from daily_attempts
      join daily_challenges on daily_challenges.id = daily_attempts.daily_challenge_id
      where daily_attempts.submission_id = ${submissionId}
      limit 1
    `;
    const row = rows[0];

    if (!row) {
      return null;
    }

    return {
      challengeDate: toDateString(row.challenge_date),
      challengeNumber: row.challenge_number,
      dailyMode: row.daily_mode,
    };
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}
