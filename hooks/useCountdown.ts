'use client'

import { useEffect, useState } from 'react';

export default function useCountdown(startSeconds: number, isActive: boolean, onComplete: () => void) {
    const [secondsLeft, setSecondsLeft] = useState<number>(startSeconds);

    useEffect(() => {
        if (!isActive) return;
        if (secondsLeft > 0) {
            const id = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
            return () => clearTimeout(id);
        }
        onComplete();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, secondsLeft]);

    const reset = (newStart?: number) => {
        setSecondsLeft(newStart ?? startSeconds);
    };

    return { secondsLeft, reset } as const;
}


