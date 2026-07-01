'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FreestyleForm from '@/components/FreestyleForm';
import EndlessForm from '@/components/EndlessForm';
import { getOrCreateDailyPlayerId } from '@/util/dailyIdentity';
import { DAILY_INTERNAL_DIFFICULTY } from '@/util/daily';
import type { DailyAttemptStatus, DailyChallenge, DailyMode } from '@/util/daily';

type DailyOverview = {
  challenge: DailyChallenge;
  attemptStatus?: DailyAttemptStatus;
};

type DailyPlayProps = {
  challenge: DailyChallenge;
  mode: DailyMode;
};

function getModeStatus(attemptStatus: DailyAttemptStatus | undefined, mode: DailyMode) {
  return mode === '4-Bar Mode'
    ? attemptStatus?.modes.freestyle
    : attemptStatus?.modes.endless;
}

export default function DailyPlay({ challenge, mode }: DailyPlayProps) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState('');
  const [attemptStatus, setAttemptStatus] = useState<DailyAttemptStatus | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const dailyPlayerId = getOrCreateDailyPlayerId();
        setPlayerId(dailyPlayerId);

        const response = await fetch(`/api/daily?playerId=${encodeURIComponent(dailyPlayerId)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Daily is unavailable');
        }

        const overview: DailyOverview = await response.json();
        if (!cancelled) {
          if (overview.challenge.id !== challenge.id) {
            router.replace('/daily');
            return;
          }

          setAttemptStatus(overview.attemptStatus);
          setLoading(false);
        }
      } catch (dailyError: any) {
        if (!cancelled) {
          setError(dailyError?.message ?? 'Daily is unavailable');
          setLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, [challenge.id, router]);

  const modeStatus = getModeStatus(attemptStatus, mode);
  const completedSubmissionId = modeStatus?.submissionId;

  if (loading || error || completedSubmissionId) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-[30px] lg:px-[100px] pt-[50px]">
          <Header />
        </div>

        <div className="flex-1 flex items-center justify-center px-[30px] lg:px-[100px]">
          <div className="text-center flex flex-col items-center gap-5">
            <div className="font-[termina] font-extrabold text-[28px] lg:text-[64px] leading-none">
              Daily #{challenge.challengeNumber}
            </div>

            {loading && (
              <div className="text-[#565757] dark:text-[#B2B2B2]">Loading...</div>
            )}

            {!loading && error && (
              <div className="text-[#FF273A]">{error}</div>
            )}

            {completedSubmissionId && (
              <>
                <div className="font-[neulis-sans] text-[16px] lg:text-[22px] text-[#565757] dark:text-[#B2B2B2]">
                  {mode} complete
                </div>
                <button
                  type="button"
                  className="bg-[#5CE2C7] rounded-[12px] lg:rounded-[25px] px-8 py-4 text-black font-[termina] font-bold text-[16px] lg:text-[18px] whitespace-nowrap"
                  onClick={() => router.replace(`/submissions/${completedSubmissionId}`)}
                >
                  VIEW SUBMISSION
                </button>
              </>
            )}

            <button
              type="button"
              className="font-[neulis-sans] font-bold text-[#565757] dark:text-[#B2B2B2]"
              onClick={() => router.replace('/')}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === '4-Bar Mode') {
    return (
      <FreestyleForm
        word={challenge.word}
        difficulty={DAILY_INTERNAL_DIFFICULTY}
        dailySubmit={{ playerId, mode }}
      />
    );
  }

  return (
    <EndlessForm
      word={challenge.word}
      difficulty={DAILY_INTERNAL_DIFFICULTY}
      dailySubmit={{ playerId, mode }}
    />
  );
}
