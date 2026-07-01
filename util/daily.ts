export const DAILY_TIME_ZONE = 'America/New_York';
export const DAILY_PLAYER_ID_STORAGE_KEY = 'llmc_daily_player_id';
export const DAILY_INTERNAL_DIFFICULTY = 'medium' as const;

export type DailyMode = '4-Bar Mode' | 'Endless Mode';

export type DailyChallenge = {
  id: number;
  challengeDate: string;
  challengeNumber: number;
  wordId: number;
  word: string;
};

export type DailyAttemptStatus = {
  challengeId: number;
  playerId: string;
  modes: {
    freestyle: {
      completed: boolean;
      submissionId?: number;
    };
    endless: {
      completed: boolean;
      submissionId?: number;
    };
  };
};

export function getNewYorkDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DAILY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Unable to compute Daily date.');
  }

  return `${year}-${month}-${day}`;
}

export function isDailyMode(mode: unknown): mode is DailyMode {
  return mode === '4-Bar Mode' || mode === 'Endless Mode';
}
