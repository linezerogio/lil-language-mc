'use client';

import { useEffect, useMemo, useState } from 'react';
import { getOrCreateDailyPlayerId } from '@/util/dailyIdentity';
import {
  getDailyPrimaryAction,
  type DailyOverview,
  type SelectableGameMode,
} from '@/util/dailyActions';

type UseDailyPrimaryActionOptions = {
  enabled: boolean;
  selectedMode: SelectableGameMode;
  expectedChallengeNumber?: number;
  completedModeBehavior: 'view-submission' | 'play-other';
};

export function useDailyPrimaryAction({
  enabled,
  selectedMode,
  expectedChallengeNumber,
  completedModeBehavior,
}: UseDailyPrimaryActionOptions) {
  const [overview, setOverview] = useState<DailyOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function loadDailyStatus() {
      try {
        setLoading(true);
        setError(null);
        const playerId = getOrCreateDailyPlayerId();
        const response = await fetch(`/api/daily?playerId=${encodeURIComponent(playerId)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Daily is unavailable');
        }

        const data: DailyOverview = await response.json();
        if (!cancelled) {
          setOverview(data);
          setLoading(false);
        }
      } catch (dailyError: any) {
        if (!cancelled) {
          setError(dailyError?.message ?? 'Daily is unavailable');
          setLoading(false);
        }
      }
    }

    loadDailyStatus();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const action = useMemo(() => {
    if (!enabled) {
      return null;
    }

    return getDailyPrimaryAction({
      selectedMode,
      overview,
      loading,
      error,
      expectedChallengeNumber,
      completedModeBehavior,
    });
  }, [
    completedModeBehavior,
    enabled,
    error,
    expectedChallengeNumber,
    loading,
    overview,
    selectedMode,
  ]);

  return {
    action,
    overview,
    loading,
    error,
  };
}
