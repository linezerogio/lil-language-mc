'use client'

import { useEffect, useMemo, useState } from 'react';

export default function useRappingTimer(totalTime: number, isActive: boolean, onTimeout: () => void) {
    const [timeLeft, setTimeLeft] = useState<number>(totalTime);
    const timePercentageLeft = useMemo(() => (timeLeft / totalTime) * 100, [timeLeft, totalTime]);

    useEffect(() => {
        if (!isActive) return;
        if (timeLeft > 0) {
            const id = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(id);
        }
        onTimeout();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, timeLeft]);

    const reset = () => setTimeLeft(totalTime);

    return { timeLeft, timePercentageLeft, reset } as const;
}


