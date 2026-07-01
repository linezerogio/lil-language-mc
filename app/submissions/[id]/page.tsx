"use client";

import React, { useEffect, useState } from 'react';
import ViewScore from '@/components/ViewScore';
import { useRouter } from 'next/navigation';
import ScoreBreakdown from '@/types/breakdown';
import { evaluateSubmission } from '@/util/rhyming/evaluate';

type SubmissionResponse = {
    id: number;
    lines: string[];
    score: number;
    played_on: string;
    keyword: string;
    mode: '4-Bar Mode' | 'Rapid Fire Mode' | 'Endless Mode';
    difficulty: 'easy' | 'medium' | 'hard' | 'zbra-easy' | 'zbra-hard';
    daily?: {
        challengeDate: string;
        challengeNumber: number;
        dailyMode: '4-Bar Mode' | 'Endless Mode';
    } | null;
};

function formatDailyDate(date: string) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
}

export default function SubmissionPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);

    useEffect(() => {
        const idNum = parseInt(params.id);
        if (Number.isNaN(idNum)) {
            router.replace('/404');
            return;
        }

        let isCancelled = false;
        const fetchSubmission = async () => {
            try {
                const res = await fetch(`/api/submissions/${idNum}`, { cache: 'no-store' });
                if (!res.ok) {
                    if (res.status === 404) {
                        router.replace('/404');
                        return;
                    }
                    throw new Error('Failed to fetch');
                }
                const data: SubmissionResponse = await res.json();
                if (!isCancelled) {
                    setSubmission(data);
                    setLoading(false);
                }
            } catch (e: any) {
                if (!isCancelled) {
                    setError(e?.message ?? 'Error');
                    setLoading(false);
                }
            }
        };
        fetchSubmission();
        return () => {
            isCancelled = true;
        };
    }, [params.id, router]);

    useEffect(() => {
        const evaluateScoreBreakdown = async () => {
            if (submission) {
                const { scoreBreakdown } = await evaluateSubmission(submission.lines, submission.keyword, 0, 0);
                setScoreBreakdown(scoreBreakdown);
            }
        };
        evaluateScoreBreakdown();
    }, [submission]);

    if (loading) {
        return (
            <main className='w-full max-w-[2560px] lg:mx-auto h-full flex items-center justify-center'>
                <div className='text-[#565757] dark:text-[#B2B2B2]'>Loading…</div>
            </main>
        );
    }

    if (error || !submission) {
        return (
            <main className='w-full max-w-[2560px] lg:mx-auto h-full flex items-center justify-center'>
                <div className='text-[#FF273A]'>Failed to load submission</div>
            </main>
        );
    }

    return (
        <main className='w-full max-w-[2560px] lg:mx-auto h-full relative'>
            {submission.daily && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white dark:bg-[#1C1E1E] border border-[#F5F5F5] dark:border-[#343737] px-4 py-2 font-[neulis-sans] font-bold text-[12px] lg:text-[14px] text-[#565757] dark:text-[#B2B2B2] whitespace-nowrap">
                    Daily #{submission.daily.challengeNumber} | {submission.daily.dailyMode} | {formatDailyDate(submission.daily.challengeDate)}
                </div>
            )}
            <ViewScore
                lines={submission.lines}
                score={submission.score}
                keyword={submission.keyword}
                mode={submission.mode}
                difficulty={submission.difficulty}
                scoreBreakdown={scoreBreakdown ?? new ScoreBreakdown()}
                showDifficulty={!submission.daily}
                daily={submission.daily}
            />
        </main>
    );
}

