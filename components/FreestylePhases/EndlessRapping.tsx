'use client'

import React, { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Difficulty } from '@/types/difficulty';
import TimeProgressBar from '../TimeProgressBar';
import QuitConfirmationModal from '../QuitConfirmationModal';
import { CompletedLine } from '@/hooks/useEndlessLines';
import { getFunnyMiss } from '@/util';

type EndlessRappingProps = {
    word: string;
    difficulty: Difficulty;
    currentLine: string;
    completedLines: CompletedLine[];
    inputRef: React.MutableRefObject<HTMLTextAreaElement | null>;
    timePercentageLeft: number;
    updateCurrentLine: (value: string) => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    showQuitConfirmation: boolean;
    onQuitConfirm: () => void;
    onQuitCancel: () => void;
    onEndEarly: () => void;
};

export default function EndlessRapping({
    word,
    difficulty,
    currentLine,
    completedLines,
    inputRef,
    timePercentageLeft,
    updateCurrentLine,
    handleKeyPress,
    showQuitConfirmation,
    onQuitConfirm,
    onQuitCancel,
    onEndEarly
}: EndlessRappingProps) {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to bottom when new lines are added
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [completedLines]);

    const getRhymeIndicator = (rhymeQuality: 'perfect' | 'near' | 'repeated' | 'short' | 'bad') => {
        const colorLight = rhymeQuality === 'perfect' ? '#5CE2C7' : rhymeQuality === 'near' ? '#7Fb304' : '#D70114';
        const colorDark = rhymeQuality === 'perfect' ? '#5CE2C7' : rhymeQuality === 'near' ? '#5DE36A' : '#D70114';
        
        return (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="font-bold leading-[18px] text-[var(--rhyme-color-light)] dark:text-[var(--rhyme-color-dark)]" style={{ '--rhyme-color-light': colorLight, '--rhyme-color-dark': colorDark } as React.CSSProperties}>
                    {rhymeQuality === 'perfect'
                        ? 'Perfect'
                        : rhymeQuality === 'near'
                        ? 'Near'
                        : rhymeQuality === 'repeated'
                        ? 'Repeat'
                        : rhymeQuality === 'short'
                        ? 'Too Short'
                        : 'Miss'
                    }
                </span>
                {/* Conditional render based on rhymeQuality */}
                {(rhymeQuality === 'perfect' || rhymeQuality === 'near') && (
                    <svg className="shrink-0 [&_path]:fill-[var(--rhyme-color-light)] dark:[&_path]:fill-[var(--rhyme-color-dark)]" style={{ '--rhyme-color-light': colorLight, '--rhyme-color-dark': colorDark } as React.CSSProperties} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20zm-1.2 13.2l-3.5-3.5l1.4-1.4l2.1 2.1l4.9-4.9l1.4 1.4l-6.3 6.3z"/>
                    </svg>
                )}
                {(rhymeQuality === 'repeated' || rhymeQuality === 'short' || rhymeQuality === 'bad') && (
                    <svg className="shrink-0 [&_circle]:stroke-[var(--rhyme-color-light)] dark:[&_circle]:stroke-[var(--rhyme-color-dark)] [&_line]:stroke-[var(--rhyme-color-light)] dark:[&_line]:stroke-[var(--rhyme-color-dark)]" style={{ '--rhyme-color-light': colorLight, '--rhyme-color-dark': colorDark } as React.CSSProperties} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2"/>
                        <line x1="8" y1="8" x2="16" y2="16" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="16" y1="8" x2="8" y2="16" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                )}
            </div>
        );
    };

    const getRhymeColor = (rhymeQuality: 'perfect' | 'near' | 'repeated' | 'short' | 'bad', isDark: boolean = false) => {
        if (rhymeQuality === 'perfect') return '#5CE2C7';
        if (rhymeQuality === 'near') return isDark ? '#5DE36A' : '#7Fb304';
        return '#D70114';
    };

    return (
        <>
            <div className="w-full px-[30px] lg:px-[100px] pb-[30px] lg:pb-[100px] pt-[25px] mx-auto flex flex-col h-[100vh]">
                <TimeProgressBar percentage={timePercentageLeft} />
                <div className="flex flex-col w-auto pb-[36px] lg:pb-[45px] pt-[36px] lg:pt-[100px] mx-auto">
                    <div className="flex w-auto content-center items-center">
                        <h1 className='flex-1 text-center pt-[20px] hidden lg:block leading-none font-bold tracking-[0.06em] font-display clamp-word'>
                            {word.toUpperCase()}
                        </h1>
                        <h1 className='flex-1 text-center text-[40px] lg:px-[100px] pt-[5px] lg:pt-[20px] h-[40px] leading-none font-bold tracking-[0.06em] lg:hidden font-display'>
                            {word.toUpperCase()}
                        </h1>
                    </div>
                    <div className="flex flex-col w-auto content-center items-center">
                        <h2 className='flex-1 text-center text-[14px] lg:text-[1.85vw] lg:px-[100px] pt-[15px] leading-none font-bold tracking-[0.06em]'>
                            Write as many sentences as you can that rhyme with the keyword
                        </h2>
                        <h3 className='flex-1 text-center text-[12px] lg:text-[1.3vw] lg:px-[100px] pt-[20px] leading-none tracking-[0.06em] text-[#8F8F8F]'>
                            Endless Mode | {difficulty[0].toUpperCase() + difficulty.slice(1)}
                        </h3>
                        <button 
                            className='text-[14px] lg:text-[16px] font-bold tracking-wider px-6 py-2 rounded-lg bg-[#F5F5F5] dark:bg-[#343737] hover:bg-[#E5E5E5] dark:hover:bg-[#404343] transition-colors mt-[20px]' 
                            onClick={() => {
                                onEndEarly();
                            }}
                        >
                            End Game
                        </button>
                    </div>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className='lg:w-full flex flex-col flex-1 h-full relative overflow-y-auto rounded-[12px] lg:rounded-[25px]'
                >
                    {completedLines.map((line, index) => {
                        const colorLight = getRhymeColor(line.rhymeQuality, false);
                        const colorDark = getRhymeColor(line.rhymeQuality, true);
                        
                        return (
                            <div 
                                key={index} 
                                className={'p-0 m-0 flex flex-col relative mb-[10px] rounded-[12px] lg:rounded-[25px] border-2 overflow-hidden min-h-[73px] border-[var(--border-color-light)] dark:border-[var(--border-color-dark)]'}
                                style={{ '--border-color-light': colorLight, '--border-color-dark': colorDark } as React.CSSProperties}
                            >
                                <div className='flex items-center relative'>
                                    <div className='flex items-center gap-3 flex-1 text-start text-[16px] lg:text-2xl py-[15px] lg:pt-[24px] pl-[15px] lg:pl-[30px] pr-[80px] lg:pr-[120px] lg:pb-[23px] bg-white dark:text-[#E1E3E3] dark:bg-[#1C1E1E] lg:leading-snug'>
                                        <div 
                                            className='flex-shrink-0 w-[25px] h-[25px] rounded-full flex items-center justify-center text-white text-[14px] font-bold bg-[var(--bg-color-light)] dark:bg-[var(--bg-color-dark)]'
                                            style={{ '--bg-color-light': colorLight, '--bg-color-dark': colorDark } as React.CSSProperties}
                                        >
                                            {index + 1}
                                        </div>
                                        <span className='flex-1 leading-[25px]'>
                                            {line.text}
                                        </span>
                                    </div>
                                    {getRhymeIndicator(line.rhymeQuality)}
                                </div>
                            </div>
                        )
                    })}
                    
                    <div className={'p-0 m-0 flex flex-col relative flex-1 min-h-[200px]'}>
                        <TextareaAutosize
                            placeholder='Type your bars...'
                            ref={inputRef}
                            onChange={e => {
                                updateCurrentLine(e.currentTarget.value);
                            }}
                            onKeyPress={(e) => {
                                handleKeyPress(e);
                            }}
                            value={currentLine}
                            draggable={false}
                            className={"text-start text-[16px] lg:text-2xl py-[15px] lg:pt-[24px] pr-[15px] lg:pr-[40px] dark:text-[#E1E3E3] dark:bg-[#1C1E1E] lg:leading-snug pl-8 flex-1 " + (completedLines.length === 0 ? "rounded-[12px] lg:rounded-[25px]" : "rounded-b-[12px] lg:rounded-b-[25px]")}
                        ></TextareaAutosize>
                    </div>
                </div>
            </div>

            <QuitConfirmationModal isOpen={showQuitConfirmation} onConfirm={onQuitConfirm} onCancel={onQuitCancel} />
        </>
    );
}
