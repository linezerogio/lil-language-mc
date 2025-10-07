'use client'

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Difficulty } from '@/types/difficulty';
import TimeProgressBar from '../TimeProgressBar';
import QuitConfirmationModal from '../QuitConfirmationModal';
import { CompletedLine } from '@/hooks/useEndlessLines';

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
    onQuitCancel
}: EndlessRappingProps) {
    const getRhymeIndicator = (rhymeQuality: 'perfect' | 'near' | 'bad') => {
        if (rhymeQuality === 'bad') return null;
        const color = rhymeQuality === 'perfect' ? '#5CE2C7' : '#5DE36A';
        return (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* circular checkmark */}
                <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill={color} d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20zm-1.2 13.2l-3.5-3.5l1.4-1.4l2.1 2.1l4.9-4.9l1.4 1.4l-6.3 6.3z"/>
                </svg>
                <span className="font-bold" style={{ color }}>{rhymeQuality === 'perfect' ? 'Perfect' : 'Near'}</span>
            </div>
        );
    };

    return (
        <>
            <div className="w-full px-[30px] lg:px-[100px] pb-[30px] lg:pb-[100px] pt-[25px] mx-auto flex flex-col h-[100vh]">
                <TimeProgressBar percentage={timePercentageLeft} />
                <div className="flex flex-col w-auto pb-[36px] lg:pb-[220px] pt-[36px] lg:pt-[100px] mx-auto">
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
                    </div>
                </div>

                <div className='lg:w-full flex flex-col flex-1 h-full relative overflow-y-auto rounded-[12px] lg:rounded-[25px]'>
                    {completedLines.map((line, index) => {
                        return (
                            <div key={index} className={'p-0 m-0 flex flex-col relative mb-[10px] rounded-[12px] lg:rounded-[25px] border-2 border-[#F5F5F5] dark:border-[#343737] overflow-hidden'}>
                                <div className='flex items-center relative'>
                                    <div className='flex-1 text-start text-[16px] lg:text-2xl py-[15px] lg:pt-[24px] pl-[15px] lg:pl-[40px] pr-[80px] lg:pr-[120px] dark:text-[#E1E3E3] dark:bg-[#1C1E1E] lg:leading-snug'>
                                        {line.text}
                                    </div>
                                    {getRhymeIndicator(line.rhymeQuality)}
                                </div>
                            </div>
                        )
                    })}
                    
                    <div className={'p-0 m-0 flex flex-col relative flex-1'}>
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

