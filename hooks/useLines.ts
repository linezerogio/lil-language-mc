'use client'

import { useEffect, useRef, useState } from 'react';
import type React from 'react';

export default function useLines(onSubmit?: () => void) {
    const [lines, setLines] = useState<string[]>(['']);
    const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

    useEffect(() => {
        const lastIndex = lines.length - 1;
        if (inputRefs.current[lastIndex]) {
            inputRefs.current[lastIndex]!.focus();
        }
    }, [lines.length]);

    const updateLines = (index: number, newValue: string) => {
        const newLines = [...lines];
        newLines[index] = newValue;
        setLines(newLines);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index === lines.length - 1 && index < 3) {
                setLines([...lines, '']);
            } else if (index === 3) {
                onSubmit && onSubmit();
            } else if (index < lines.length) {
                if (lines[lines.length - 1] !== '' && lines.length < 4) {
                    setLines([...lines, '']);
                } else {
                    const lastInputIndex = lines.length - 1;
                    if (inputRefs.current[lastInputIndex]) {
                        inputRefs.current[lastInputIndex]!.focus();
                    }
                }
            }
        }
    };

    const reset = () => setLines(['']);

    return { lines, setLines, inputRefs, updateLines, handleKeyPress, reset } as const;
}


