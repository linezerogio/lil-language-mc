'use client'

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Header from '../Header';
import ScoreGauge from '../ScoreGauge';
import ScoreBreakdownView from '../ScoreBreakdownView';
import ModeSelector from '../ModeSelector';
import DifficultyBottomSheet from '../BottomSheets/DifficultyBottomSheet';
import ModeBottomSheet from '../BottomSheets/ModeBottomSheet';
import ScoreDetailsBottomSheet from '../BottomSheets/ScoreDetailsBottomSheet';
import ScoreBreakdown from '@/types/breakdown';
import { Difficulty } from '@/types/difficulty';

type Option = {
    value: string;
    name: string;
    icon: string;
    description: string;
    disabled?: boolean;
    iconProps: {
        width: number;
        height: number;
        mdWidth: number;
        mdHeight: number;
        className: string;
    }
};

type ScoreProps = {
    word: string;
    score: number;
    scoreBreakdown: ScoreBreakdown;
    difficulty: Difficulty; // original difficulty for display/metrics
    newDifficulty: Difficulty; // currently selected difficulty in UI
    lines: string[];
    inputRefs: React.MutableRefObject<(HTMLTextAreaElement | null)[]>;
    mode?: '4-Bar Mode' | 'Rapid Fire Mode' | 'Endless Mode'; // mode for display
    showDifficulty?: boolean;

    // Difficulty menu state/handlers
    difficultyOptions: Option[];
    difficultyMenuOpen: boolean;
    onDifficultySelect: (mode: string) => void;
    onDifficultyButtonClick: (mode: string) => void;
    onDifficultyMenuClose: () => void;

    // Game mode menu state/handlers
    gameModeOptions: Option[];
    newGameMode: '4-Bar Mode' | 'Rapid Fire Mode' | 'Endless Mode';
    gameModeMenuOpen: boolean;
    onGameModeSelect: (mode: string) => void;
    onGameModeButtonClick: (mode: string) => void;
    onGameModeMenuClose: () => void;

    // Bottom sheets
    difficultyBottomSheetOpen: boolean;
    onDifficultyBottomSheetClose: () => void;
    onDifficultyBottomSheetSelect: (difficulty: Difficulty) => void;
    gameModeBottomSheetOpen: boolean;
    onGameModeBottomSheetClose: () => void;
    onGameModeBottomSheetSelect: (mode: '4-Bar Mode' | 'Rapid Fire Mode' | 'Endless Mode') => void;

    // Score details sheet
    scoreDetailsBottomSheetOpen: boolean;
    onScoreDetailsBottomSheetClose: () => void;
    onScoreBreakdownClick: () => void;

    // Header easter egg handler
    onEasterEggDifficultyChange: (difficulty: Difficulty) => void;

    // Reset handler
    onPlayAgain: () => void;
    primaryActionLabel?: string;
    primaryActionDisabled?: boolean;
};

export default function Score({
    word,
    score,
    scoreBreakdown,
    difficulty,
    newDifficulty,
    lines,
    inputRefs,
    mode = '4-Bar Mode',
    showDifficulty = true,
    difficultyOptions,
    difficultyMenuOpen,
    onDifficultySelect,
    onDifficultyButtonClick,
    onDifficultyMenuClose,
    gameModeOptions,
    newGameMode,
    gameModeMenuOpen,
    onGameModeSelect,
    onGameModeButtonClick,
    onGameModeMenuClose,
    difficultyBottomSheetOpen,
    onDifficultyBottomSheetClose,
    onDifficultyBottomSheetSelect,
    gameModeBottomSheetOpen,
    onGameModeBottomSheetClose,
    onGameModeBottomSheetSelect,
    scoreDetailsBottomSheetOpen,
    onScoreDetailsBottomSheetClose,
    onScoreBreakdownClick,
    onEasterEggDifficultyChange,
    onPlayAgain,
    primaryActionLabel = 'PLAY AGAIN',
    primaryActionDisabled = false
}: ScoreProps) {
    const difficultyLabel = showDifficulty
        ? difficulty[0].toUpperCase() + difficulty.slice(1)
        : 'Daily';
    const primaryActionTextClass = primaryActionLabel.length > 10
        ? 'text-[16px] lg:text-[18px]'
        : 'text-[18px] lg:text-[25px]';

    return (
        <div className="max-w-[2560px] w-full h-full px-[30px] lg:px-[100px] pt-[30px] lg:pt-[50px] mx-auto text-center flex flex-col">
            <Header 
                difficulty={newDifficulty} 
                onDifficultyChange={onEasterEggDifficultyChange}
            />
            <div className='flex flex-col lg:flex-row items-center mt-5'>
                <ScoreGauge
                    score={score}
                    word={word}
                    scoreBreakdown={scoreBreakdown}
                    difficulty={difficulty}
                    showDifficulty={showDifficulty}
                    mode={mode}
                    lines={lines}
                    onScoreBreakdownClick={onScoreBreakdownClick}
                />
                <div className="lg:hidden text-[14px] text-[#565757] dark:text-[#B2B2B2] -translate-y-[20px]">
                    {mode} | {difficultyLabel} &quot;{word.charAt(0).toUpperCase() + word.slice(1)}&quot;
                </div>
                <div className="hidden lg:flex flex-1 min-w-0">
                    <ScoreBreakdownView 
                        scoreBreakdown={scoreBreakdown} 
                        lines={lines.filter(line => line.trim() !== '')}
                        mode={mode}
                        difficulty={difficulty}
                        showDifficulty={showDifficulty}
                        targetWord={word}
                    />
                </div>
            </div>

            <div className='lg:w-full flex flex-col flex-1 relative overflow-y-auto rounded-[12px] lg:rounded-[25px]'>
                {lines.map((line, index) => (
                    <div key={index} className={'p-0 m-0 flex flex-col relative'}>
                        <span className='rounded-full bg-[#5DE3C8] absolute w-6 h-6 text-center pt-[1.5px] mt-[15px] lg:mt-[26px] ml-[15px] lg:ml-[25px] dark:text-black'>{index + 1}</span>
                        <TextareaAutosize
                            key={index}
                            ref={el => {
                                if (el) inputRefs.current[index] = el;
                            }}
                            onChange={() => {}}
                            value={line}
                            className={"text-start text-[14px] lg:text-2xl py-[15px] lg:pt-[24px] pr-[15px] lg:pr-[40px] text-black dark:text-[#E1E3E3] dark:bg-[#1C1E1E] lg:leading-snug pl-[50px] lg:pl-[60px] " + (index === lines.length - 1 && index === 0 ? "rounded-[12px] lg:rounded-[25px]" : (index === lines.length - 1 ? "rounded-b-[12px] lg:rounded-b-[25px]" : (index === 0 ? "rounded-t-[12px] lg:rounded-t-[25px] border-b-2 border-[#F5F5F5] dark:border-[#343737]" : "border-b-2 border-[#F5F5F5] dark:border-[#343737]")))}
                            readOnly={true}
                        />
                    </div>
                ))}
            </div>

            <div className='flex lg:mt-[30px] justify-center h-[43px] lg:h-[73px] w-full lg:w-auto gap-2.5 mb-[15px] lg:mb-0'>
                {showDifficulty ? (
                    <ModeSelector
                        options={difficultyOptions}
                        selectedMode={newDifficulty}
                        onModeSelect={onDifficultySelect}
                        onButtonClick={onDifficultyButtonClick}
                        onClose={onDifficultyMenuClose}
                        isMenuOpen={difficultyMenuOpen}
                    />
                ) : (
                    <div className="hidden lg:block lg:w-[286px]" />
                )}
                <button className={`bg-[#5CE2C7] h-[73px] mx-[25px] rounded-[12px] lg:rounded-[25px] text-black ${primaryActionTextClass} font-bold font-[termina] hidden lg:block w-full lg:w-[286px] whitespace-nowrap disabled:opacity-50 disabled:cursor-default`} onClick={onPlayAgain} disabled={primaryActionDisabled}>{primaryActionLabel}</button>
                <ModeSelector
                    options={gameModeOptions}
                    selectedMode={newGameMode}
                    onModeSelect={onGameModeSelect}
                    onButtonClick={onGameModeButtonClick}
                    onClose={onGameModeMenuClose}
                    isMenuOpen={gameModeMenuOpen}
                />
            </div>
            <button className={`bg-[#5CE2C7] py-[10px] px-[20px] mb-[30px] rounded-[12px] text-black dark:text-white ${primaryActionTextClass} font-bold font-[termina] block lg:hidden w-full whitespace-nowrap disabled:opacity-50 disabled:cursor-default`} onClick={onPlayAgain} disabled={primaryActionDisabled}>{primaryActionLabel}</button>

            <footer className="w-full mx-auto text-center pb-[20px] pt-[40px] opacity-50 font-[neulis-sans] font-bold text-[#565757] hidden lg:block">
                ©{new Date().getFullYear()} LineZero Studio. All rights reserved.
            </footer>

            {/* Bottom Sheets for Mobile */}
            {showDifficulty && (
                <DifficultyBottomSheet
                    isOpen={difficultyBottomSheetOpen}
                    onClose={onDifficultyBottomSheetClose}
                    difficulty={newDifficulty}
                    onDifficultySelect={onDifficultyBottomSheetSelect}
                />
            )}
            
            <ModeBottomSheet
                isOpen={gameModeBottomSheetOpen}
                onClose={onGameModeBottomSheetClose}
                gameMode={newGameMode}
                onGameModeSelect={onGameModeBottomSheetSelect}
            />

            <ScoreDetailsBottomSheet
                isOpen={scoreDetailsBottomSheetOpen}
                onClose={onScoreDetailsBottomSheetClose}
                scoreBreakdown={scoreBreakdown}
                lines={lines.filter(line => line.trim() !== '')}
                mode={mode}
                difficulty={difficulty}
                showDifficulty={showDifficulty}
                targetWord={word}
            />
        </div>
    );
}


