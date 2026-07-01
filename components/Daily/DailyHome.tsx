'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getOrCreateDailyPlayerId } from '@/util/dailyIdentity';
import type { DailyAttemptStatus, DailyChallenge } from '@/util/daily';

type DailyOverview = {
  challenge: DailyChallenge;
  attemptStatus?: DailyAttemptStatus;
};

const dailyModes = [
  {
    key: 'freestyle',
    title: 'Daily 4-Bar',
    path: '/daily/freestyle',
  },
  {
    key: 'endless',
    title: 'Daily Endless',
    path: '/daily/endless',
  },
] as const;

function formatDailyDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

export default function DailyHome() {
  const router = useRouter();
  const [overview, setOverview] = useState<DailyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDaily() {
      try {
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

    loadDaily();

    return () => {
      cancelled = true;
    };
  }, []);

  const formattedDate = useMemo(() => {
    if (!overview) {
      return '';
    }

    return formatDailyDate(overview.challenge.challengeDate);
  }, [overview]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-[30px] lg:px-[100px] pt-[50px]">
        <Header />
      </div>

      <div className="flex-1 flex items-center justify-center px-[30px] lg:px-[100px]">
        <div className="w-full max-w-[920px] flex flex-col gap-8">
          <div className="text-center">
            <div className="font-[termina] font-extrabold text-[34px] lg:text-[78px] leading-none">
              DAILY
            </div>
            {overview && (
              <div className="mt-4 font-[neulis-sans] text-[16px] lg:text-[24px] text-[#565757] dark:text-[#B2B2B2]">
                #{overview.challenge.challengeNumber} | {formattedDate}
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center text-[#565757] dark:text-[#B2B2B2]">Loading...</div>
          )}

          {!loading && error && (
            <div className="text-center text-[#FF273A]">{error}</div>
          )}

          {!loading && overview && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dailyModes.map((dailyMode) => {
                const modeStatus = overview.attemptStatus?.modes[dailyMode.key];
                const completedSubmissionId = modeStatus?.submissionId;

                return (
                  <button
                    key={dailyMode.key}
                    type="button"
                    onClick={() => {
                      if (completedSubmissionId) {
                        router.push(`/submissions/${completedSubmissionId}`);
                        return;
                      }

                      router.push(dailyMode.path);
                    }}
                    className="bg-white dark:bg-[#1C1E1E] text-left rounded-[12px] lg:rounded-[25px] px-6 py-6 border border-[#F5F5F5] dark:border-[#343737] hover:border-[#5CE2C7] transition-colors"
                  >
                    <div className="font-[termina] font-bold text-[20px] lg:text-[28px]">
                      {dailyMode.title}
                    </div>
                    <div className="mt-4 inline-flex bg-[#5CE2C7] rounded-[12px] px-5 py-3 text-black font-[termina] font-bold text-[14px] lg:text-[18px]">
                      {completedSubmissionId ? 'VIEW SUBMISSION' : 'START'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <footer className="w-full mx-auto text-center pb-[20px] opacity-50 font-[neulis-sans] font-bold text-[#565757] hidden lg:block">
        &copy;{new Date().getFullYear()} LineZero Studio. All rights reserved.
      </footer>
    </div>
  );
}
