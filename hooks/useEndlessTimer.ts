'use client'

import { useEffect, useMemo, useState, useCallback } from 'react';
import { ENDLESS_STARTING_TIME, ENDLESS_MAX_TIME } from '@/util/settings';

export default function useEndlessTimer(isActive: boolean, onTimeout: () => void) {
    const [timeLeft, setTimeLeft] = useState<number>(ENDLESS_STARTING_TIME);
    const timePercentageLeft = useMemo(() => (timeLeft / ENDLESS_STARTING_TIME) * 100, [timeLeft]);

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
        setTimeLeft(ENDLESS_STARTING_TIME);
    }, []);

    const reset = useCallback(() => {
        setTimeLeft(ENDLESS_STARTING_TIME);
    }, []);

    return { timeLeft, timePercentageLeft, refreshTimer, fullRefresh, reset } as const;
}

