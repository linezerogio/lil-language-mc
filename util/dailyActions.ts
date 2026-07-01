import type { DailyAttemptStatus, DailyChallenge, DailyMode } from './daily';

export type SelectableGameMode = DailyMode | 'Rapid Fire Mode';

export type DailyOverview = {
  challenge: DailyChallenge;
  attemptStatus?: DailyAttemptStatus;
};

export type DailyPrimaryAction = {
  label: 'PLAY DAILY' | 'VIEW SUBMISSION' | 'LOADING' | 'UNAVAILABLE';
  disabled: boolean;
  mode: SelectableGameMode;
  path: string | null;
};

type DailyPrimaryActionOptions = {
  selectedMode: SelectableGameMode;
  overview: DailyOverview | null;
  loading: boolean;
  error: string | null;
  expectedChallengeNumber?: number;
  completedModeBehavior: 'view-submission' | 'play-other';
};

export function isDailyGameMode(mode: SelectableGameMode): mode is DailyMode {
  return mode === '4-Bar Mode' || mode === 'Endless Mode';
}

export function getDailyModePath(mode: DailyMode) {
  return mode === 'Endless Mode' ? '/daily/endless' : '/daily/freestyle';
}

export function getOtherDailyMode(mode: DailyMode): DailyMode {
  return mode === 'Endless Mode' ? '4-Bar Mode' : 'Endless Mode';
}

export function getDailyModeStatus(
  attemptStatus: DailyAttemptStatus | undefined,
  mode: DailyMode,
) {
  return mode === 'Endless Mode'
    ? attemptStatus?.modes.endless
    : attemptStatus?.modes.freestyle;
}

export function getDailyPrimaryAction({
  selectedMode,
  overview,
  loading,
  error,
  expectedChallengeNumber,
  completedModeBehavior,
}: DailyPrimaryActionOptions): DailyPrimaryAction {
  if (!isDailyGameMode(selectedMode)) {
    return {
      label: 'UNAVAILABLE',
      disabled: true,
      mode: selectedMode,
      path: null,
    };
  }

  if (loading || (!overview && !error)) {
    return {
      label: 'LOADING',
      disabled: true,
      mode: selectedMode,
      path: null,
    };
  }

  if (
    error ||
    !overview ||
    (expectedChallengeNumber !== undefined && overview.challenge.id !== expectedChallengeNumber)
  ) {
    return {
      label: 'UNAVAILABLE',
      disabled: true,
      mode: selectedMode,
      path: null,
    };
  }

  const selectedStatus = getDailyModeStatus(overview.attemptStatus, selectedMode);

  if (!selectedStatus?.completed) {
    return {
      label: 'PLAY DAILY',
      disabled: false,
      mode: selectedMode,
      path: getDailyModePath(selectedMode),
    };
  }

  if (completedModeBehavior === 'view-submission' && selectedStatus.submissionId) {
    return {
      label: 'VIEW SUBMISSION',
      disabled: false,
      mode: selectedMode,
      path: `/submissions/${selectedStatus.submissionId}`,
    };
  }

  const otherMode = getOtherDailyMode(selectedMode);
  const otherStatus = getDailyModeStatus(overview.attemptStatus, otherMode);

  if (!otherStatus?.completed) {
    return {
      label: 'PLAY DAILY',
      disabled: false,
      mode: otherMode,
      path: getDailyModePath(otherMode),
    };
  }

  return {
    label: 'VIEW SUBMISSION',
    disabled: true,
    mode: selectedMode,
    path: null,
  };
}
