'use client'

import { useEffect, useMemo, useState, useCallback } from 'react';
import { ENDLESS_STARTING_TIME, ENDLESS_MAX_TIME, DIFFICULTY_SETTINGS } from '@/util/settings';
import { Difficulty } from '@/types/difficulty';

export default function useEndlessTimer(isActive: boolean, onTimeout: () => void, difficulty: Difficulty) {
    const [timeLeft, setTimeLeft] = useState<number>(ENDLESS_STARTING_TIME * DIFFICULTY_SETTINGS[difficulty].timeMultiplier);
    const timePercentageLeft = useMemo(() => (timeLeft / ENDLESS_STARTING_TIME * DIFFICULTY_SETTINGS[difficulty].timeMultiplier) * 100, [timeLeft, difficulty]);

    useEffect(() => {
        if (!isActive) return;
        if (timeLeft > 0) {
            const id = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(id);
        }
        onTimeout();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, timeLeft]);

    const refreshTimer = useCallback((amount: number) => {
        setTimeLeft(prev => Math.min(prev + amount, ENDLESS_MAX_TIME));
    }, []);

    const fullRefresh = useCallback(() => {
        setTimeLeft(ENDLESS_STARTING_TIME * DIFFICULTY_SETTINGS[difficulty].timeMultiplier);
    }, [ difficulty ]);

    const reset = useCallback(() => {
        setTimeLeft(ENDLESS_STARTING_TIME * DIFFICULTY_SETTINGS[difficulty].timeMultiplier);
    }, [ difficulty ]);

    return { timeLeft, timePercentageLeft, refreshTimer, fullRefresh, reset } as const;
}

