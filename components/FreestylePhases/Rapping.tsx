'use client'

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Difficulty } from '@/types/difficulty';
import TimeProgressBar from '../TimeProgressBar';
import QuitConfirmationModal from '../QuitConfirmationModal';

// timer color handled in TimeProgressBar

type RappingProps = {
    word: string;
    difficulty: Difficulty;
    lines: string[];
    inputRefs: React.MutableRefObject<(HTMLTextAreaElement | null)[]>;
    timePercentageLeft: number;
    updateLines: (index: number, newValue: string) => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => void;
    showQuitConfirmation: boolean;
    onQuitConfirm: () => void;
    onQuitCancel: () => void;
};

export default function Rapping({
    word,
    difficulty,
    lines,
    inputRefs,
    timePercentageLeft,
    updateLines,
    handleKeyPress,
    showQuitConfirmation,
    onQuitConfirm,
    onQuitCancel
}: RappingProps) {
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
                            Write 4 sentences that rhyme with the keyword
                        </h2>
                        <h3 className='flex-1 text-center text-[12px] lg:text-[1.3vw] lg:px-[100px] pt-[20px] leading-none tracking-[0.06em] text-[#8F8F8F]'>
                            4-Bar Mode | {difficulty[0].toUpperCase() + difficulty.slice(1)}
                        </h3>
                    </div>
                </div>

                <div className='lg:w-full flex flex-col flex-1 h-full relative overflow-y-auto rounded-[12px] lg:rounded-[25px]'>
                    {lines.map((line, index) => {
                        return (
                            <div key={index} className={'p-0 m-0 flex flex-col relative ' + (index === lines.length - 1 ? "flex-1" : "")}>
                                {index !== lines.length - 1 && <span className='rounded-full bg-[#5DE3C8] absolute w-6 h-6 text-center pt-[1.5px] mt-[15px] lg:mt-[26px] ml-[15px] lg:ml-[40px] dark:text-black'>{index + 1}</span>}
                                <TextareaAutosize
                                    placeholder='Type your bars...'
                                    ref={el => {
                                        if (el) inputRefs.current[index] = el;
                                    }}
                                    onChange={e => {
                                        updateLines(index, e.currentTarget.value);
                                    }}
                                    onKeyPress={(e) => {
                                        handleKeyPress(e, index);
                                    }}
                                    value={line}
                                    draggable={false}
                                    className={"text-start text-[16px] lg:text-2xl py-[15px] lg:pt-[24px] pr-[15px] lg:pr-[40px] dark:text-[#E1E3E3] dark:bg-[#1C1E1E] lg:leading-snug " + (index === lines.length - 1 && index === 0 ? "rounded-[12px] lg:rounded-[25px] pl-8 flex-1" : (index === lines.length - 1 ? "rounded-b-[12px] lg:rounded-b-[25px] pl-8 flex-1" : (index === 0 ? "rounded-t-[12px] lg:rounded-t-[25px] border-b-2 border-[#F5F5F5] dark:border-[#343737] pl-[50px] lg:pl-[84.5px]" : "border-b-2 border-[#F5F5F5] dark:border-[#343737] pl-[50px] lg:pl-[84.5px]")))}
                                ></TextareaAutosize>
                            </div>
                        )
                    })}
                </div>
            </div>

            <QuitConfirmationModal isOpen={showQuitConfirmation} onConfirm={onQuitConfirm} onCancel={onQuitCancel} />
        </>
    );
}


