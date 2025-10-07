'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { RhymeQuality } from '@/util/evaluateRhyme';

export type CompletedLine = {
    text: string;
    rhymeQuality: RhymeQuality;
};

export default function useEndlessLines() {
    const [currentLine, setCurrentLine] = useState<string>('');
    const [completedLines, setCompletedLines] = useState<CompletedLine[]>([]);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [completedLines.length]);

    const updateCurrentLine = useCallback((value: string) => {
        setCurrentLine(value);
    }, []);

    const submitLine = useCallback((rhymeQuality: RhymeQuality) => {
        if (currentLine.trim()) {
            setCompletedLines(prev => [...prev, { text: currentLine, rhymeQuality }]);
            setCurrentLine('');
        }
    }, [currentLine]);

    const reset = useCallback(() => {
        setCompletedLines([]);
        setCurrentLine('');
    }, []);

    return { 
        currentLine, 
        completedLines, 
        inputRef,
        updateCurrentLine, 
        submitLine, 
        reset
    } as const;
}

