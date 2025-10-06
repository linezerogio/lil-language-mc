'use client'

import Image from 'next/image'
import { useState, useEffect, KeyboardEvent, useRef, use, useMemo } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { arraysEqual, getLastWord, getTimePercentageClass } from '@/util';
import { getRhymeData } from '@/util/rhymes';
import { getScore, perfectRhymeScore, nearRhymeScore, maybeRhymeScore, getSyllableMatch, getBonusPoints, getComplexity, getPenalty, getWordCountPenalty, getRepeatPenalty, getSyllableMatchCount, getSentenceLengthInfo } from '@/util/score';
import { Difficulty } from '@/types/difficulty';
import TextareaAutosize from 'react-textarea-autosize';
import { totalTime } from '@/util/constants';
import ScoreGauge from './ScoreGauge';
import ScoreBreakdownView from './ScoreBreakdownView';
import ScoreBreakdown from '@/types/breakdown';
import Header from './Header';
import useIsMobile from '../hooks/useIsMobile';
import DifficultyBottomSheet from './BottomSheets/DifficultyBottomSheet';
import ModeBottomSheet from './BottomSheets/ModeBottomSheet';
import ScoreDetailsBottomSheet from './BottomSheets/ScoreDetailsBottomSheet';
import ModeSelector from './ModeSelector';

const calculateColor = (percentage: number) => {
    return (percentage > 75 ? "bg-[#5DE3C8]" : (percentage > 50 ? "bg-[#5DE36A]" : (percentage > 25 ? "bg-[#E0E35D]" : (percentage > 10 ? "bg-[#FF7B01]" : "bg-[#FF0101]"))));
}

// Simple cn utility for conditional classNames
function cn(...args: any[]) {
    return args
        .flat()
        .filter(Boolean)
        .join(' ');
}

export default function FreestyleForm({ word, difficulty }: { word: string, difficulty: Difficulty }) {
    const router = useRouter();
    const isMobile = useIsMobile();

    const [countdownTimeLeft, setCountdownTimeLeft] = useState(3);
    const [countdownActive, setCountdownActive] = useState<boolean>(true);

    const [pageState, setPageState] = useState<'intro' | 'rapping' | 'score'>('intro');

    const [scoreDetailsBottomSheetOpen, setScoreDetailsBottomSheetOpen] = useState<boolean>(false);
    const [showQuitConfirmation, setShowQuitConfirmation] = useState<boolean>(false);

    // Handle browser back button for quit confirmation
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (pageState === 'rapping') {
                event.preventDefault();
                setShowQuitConfirmation(true);
                // Push the current state back to prevent actual navigation
                window.history.pushState(null, '', window.location.href);
            }
        };

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (pageState === 'rapping') {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        if (pageState === 'rapping') {
            // Add a history entry to catch back button
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', handlePopState);
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [pageState]);

    const handleQuitConfirm = () => {
        setShowQuitConfirmation(false);
        router.replace('/');
    };

    const handleQuitCancel = () => {
        setShowQuitConfirmation(false);
    };

    useEffect(() => {
        if (countdownActive) {
            countdownTimeLeft > 0 && setTimeout(() => setCountdownTimeLeft(countdownTimeLeft - 1), 1000);
            countdownTimeLeft == 1 && setTimeout(() => {
                setPageState('rapping');
                setCountdownActive(false);
            }, 1000)
        }
    }, [countdownTimeLeft, countdownActive]);

    const [timePercentageLeft, setTimePercentageLeft] = useState(100);
    const [timeLeft, setTimeLeft] = useState(totalTime);

    useEffect(() => {
        timeLeft > 0 && pageState === "rapping" && setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        timePercentageLeft > 0 && pageState === "rapping" && setTimeout(() => setTimePercentageLeft(timeLeft / totalTime * 100), 1000)
        timeLeft < 1 && setTimeout(() => submit(), 1000)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, pageState, timePercentageLeft]);

    const [lines, setLines] = useState<string[]>(['']);
    const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

    const [score, setScore] = useState<number>(0);
    const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown>(new ScoreBreakdown());

    const [newDifficulty, setNewDifficulty] = useState<Difficulty>(difficulty);
    const [difficultyMenuOpen, setDifficultyMenuOpen] = useState<boolean>(false);
    const [difficultyBottomSheetOpen, setDifficultyBottomSheetOpen] = useState<boolean>(false);

    const handleDifficultyButton = (difficulty: Difficulty) => {
        if (isMobile) {
            setDifficultyBottomSheetOpen(true);
        } else {
            if (difficultyMenuOpen) {
                setNewDifficulty(difficulty)
            }
            setDifficultyMenuOpen(!difficultyMenuOpen)
        }
    }

    const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
        setNewDifficulty(selectedDifficulty);
    }

    // Handle easter egg difficulty change from Header
    const handleEasterEggDifficultyChange = (newDifficulty: Difficulty) => {
        setNewDifficulty(newDifficulty);
    };

    // Map ZBRA difficulties to base difficulties for routing
    const getRouteDifficulty = (difficulty: Difficulty): string => {
        switch (difficulty) {
            case 'zbra-easy':
                return 'zbra-easy';
            case 'zbra-hard':
                return 'zbra-hard';
            default:
                return difficulty;
        }
    };

    const [newGameMode, setNewGameMode] = useState<"4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode">("4-Bar Mode");
    const [gameModeMenuOpen, setGameModeMenuOpen] = useState<boolean>(false);
    const [gameModeBottomSheetOpen, setGameModeBottomSheetOpen] = useState<boolean>(false);

    const handleGameModeButton = (gameMode: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode") => {
        if (isMobile) {
            setGameModeBottomSheetOpen(true);
        } else {
            if (gameModeMenuOpen) {
                setNewGameMode(gameMode)
            }
            setGameModeMenuOpen(!gameModeMenuOpen)
        }
    }

    const handleGameModeSelect = (selectedMode: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode") => {
        setNewGameMode(selectedMode);
    }

    // Difficulty options configuration - dynamically include ZBRA modes only if selected
    const difficultyOptions = useMemo(() => {
        const baseOptions = [
            {
                value: "easy" as Difficulty,
                name: "Easy",
                icon: "/Easy.svg",
                description: "Good for beginners or for maximizing rhymes.",
                iconProps: {
                    width: 24,
                    height: 14.744,
                    mdWidth: 40,
                    mdHeight: 24.57,
                    className: "mr-[10px]"
                }
            },
            {
                value: "medium" as Difficulty,
                name: "Medium", 
                icon: "/Medium.svg",
                description: "Little bit of a challenge to push your limit.",
                iconProps: {
                    width: 24,
                    height: 14.406,
                    mdWidth: 40,
                    mdHeight: 24.01,
                    className: "mr-[10px]"
                }
            },
            {
                value: "hard" as Difficulty,
                name: "Hard",
                icon: "/Hard.svg", 
                description: "Some of the most difficult words to rhyme with.",
                iconProps: {
                    width: 24,
                    height: 15.78,
                    mdWidth: 40,
                    mdHeight: 26.3,
                    className: "mr-[10px]"
                }
            }
        ];

        // Add ZBRA modes only if currently selected
        if (newDifficulty === "zbra-easy") {
            baseOptions.push({
                value: "zbra-easy" as Difficulty,
                name: "ZBRA Easy",
                icon: "/icons/ZBRAEasy.svg",
                description: "Good for beginner Zbra's so they can finally reach 500 pts maybe.",
                iconProps: {
                    width: 24,
                    height: 14.744,
                    mdWidth: 40,
                    mdHeight: 24.57,
                    className: "mr-[10px]"
                }
            });
        }

        if (newDifficulty === "zbra-hard") {
            baseOptions.push({
                value: "zbra-hard" as Difficulty,
                name: "ZBRA Hard",
                icon: "/icons/ZBRAHard.svg",
                description: "Very difficult, only for the trained zbra's, not just any zbra.",
                iconProps: {
                    width: 24,
                    height: 15.78,
                    mdWidth: 40,
                    mdHeight: 26.3,
                    className: "mr-[10px]"
                }
            });
        }

        return baseOptions;
    }, [newDifficulty]);

    // Game mode options configuration
    const gameModeOptions = [
        {
            value: "4-Bar Mode",
            name: "4-Bar Mode",
            icon: "/icons/FourBarMode.svg",
            description: "Write 4 sentences that rhyme with the keyword within the time limit.",
            iconProps: {
                width: 16,
                height: 16,
                mdWidth: 23,
                mdHeight: 24,
                className: "mr-[10px]"
            }
        },
        {
            value: "Rapid Fire Mode",
            name: "Rapid Fire Mode",
            icon: "/icons/RapidFireMode.svg",
            description: "Write 2 sentences that rhyme with each keyword. Complete as many keywords as you can within the time limit.",
            disabled: true,
            iconProps: {
                width: 16,
                height: 16,
                mdWidth: 21.6,
                mdHeight: 27,
                className: "mr-[10px]"
            }
        },
        {
            value: "Endless Mode",
            name: "Endless Mode",
            icon: "/icons/EndlessMode.svg",
            description: "Write as many sentences as possible that rhyme until you run out of lives.",
            disabled: true,
            iconProps: {
                width: 16,
                height: 16,
                mdWidth: 25.15,
                mdHeight: 12.15,
                className: "mr-[10px]"
            }
        }
    ];

    // Wrapper functions for type safety
    const handleDifficultySelectWrapper = (mode: string) => {
        handleDifficultySelect(mode as Difficulty);
    };

    const handleDifficultyButtonWrapper = (mode: string) => {
        handleDifficultyButton(mode as Difficulty);
    };

    const handleGameModeSelectWrapper = (mode: string) => {
        handleGameModeSelect(mode as "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode");
    };

    const handleGameModeButtonWrapper = (mode: string) => {
        handleGameModeButton(mode as "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode");
    };

    const reset = () => {
        setPageState('intro');
        setCountdownTimeLeft(3);
        setCountdownActive(true);
        setTimeLeft(totalTime);
        setTimePercentageLeft(100);
        setLines(['']);
        setScore(0);
        router.replace('/freestyle/' + getRouteDifficulty(newDifficulty));
    };

    useEffect(() => {
        // Focus the last input element when lines are updated
        const lastInputIndex = lines.length - 1;
        if (inputRefs.current[lastInputIndex]) {
            inputRefs.current[lastInputIndex]!.focus();
        }
    }, [lines.length]); // Depend on lines

    const updateLines = (index: number, newValue: string) => {
        const newLines = [...lines];
        newLines[index] = newValue;
        setLines(newLines);
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index === lines.length - 1 && index < 3) {
                setLines([...lines, '']);
            } else if (index === 3) {
                submit();
            } else if (index < lines.length) {
                if (lines[lines.length - 1] !== "" && lines.length < 4) {
                    setLines([...lines, '']);
                } else {
                    const lastInputIndex = lines.length - 1;
                    if (inputRefs.current[lastInputIndex]) {
                        inputRefs.current[lastInputIndex]!.focus();
                    }
                }
            }
        }
    }

    const submit = () => {
        getRhymeData(lines, word).then(result => {
            const { mappedLines, linePronunciations, targetWordPronunciation } = result;

            // SECTION Rhymes

            const phonemesToTarget = targetWordPronunciation.substring(
                targetWordPronunciation.lastIndexOf(' ',
                    targetWordPronunciation.lastIndexOf('1')
                )
            );

            const perfectRhymes = linePronunciations.map(linePronunciation => {
                return linePronunciation.endsWith(phonemesToTarget);
            }).reduce((acc, val) => acc + (val ? 1 : 0), 0);

            console.log(perfectRhymes);

            const nearRhymes = linePronunciations.map(linePronunciation => {
                const phonemesToCheck = linePronunciation.substring(linePronunciation.lastIndexOf(' ', linePronunciation.lastIndexOf('1')));
                const vowelPhonemesToCheck = phonemesToCheck.split(' ').filter(phoneme => phoneme.includes('1') || phoneme.includes('0') || phoneme.includes('2'));
                const vowelPhonemesToTarget = phonemesToTarget.split(' ').filter(phoneme => phoneme.includes('1') || phoneme.includes('0') || phoneme.includes('2'));
                return arraysEqual(vowelPhonemesToCheck, vowelPhonemesToTarget);
            }).reduce((acc, val) => acc + (val ? 1 : 0), 0) - perfectRhymes;

            console.log(nearRhymes);

            const maybeRhymes = Math.max((linePronunciations.map(linePronunciation => {
                const phonemesToCheck = linePronunciation.substring(linePronunciation.lastIndexOf(' ', linePronunciation.lastIndexOf('1')));
                return phonemesToCheck[0] == phonemesToTarget[0] && phonemesToCheck.length == phonemesToTarget.length;
            }).reduce((acc, val) => acc + (val ? 1 : 0), 0) - perfectRhymes - nearRhymes), 0);

            console.log(maybeRhymes);

            //!SECTION Rhymes

            const syllableMatch = getSyllableMatch(lines);

            const complexity = getComplexity(lines);

            const bonusPoints = getBonusPoints(timePercentageLeft, getLastWord(lines) === word);

            const penalty = getPenalty(timePercentageLeft, lines);

            const wordCountPenalty = getWordCountPenalty(lines);

            const score = getScore({
                rhymeQuality: perfectRhymes * perfectRhymeScore + nearRhymes * nearRhymeScore + maybeRhymes * maybeRhymeScore,
                syllableMatch,
                complexity,
                bonusPoints,
                penalty,
                wordCountPenalty
            });

            let newScoreBreakdown = new ScoreBreakdown();
            newScoreBreakdown.rhymeBreakdown = {
                perfectRhymes,
                endedWithPunchline: getLastWord(lines) === word,
                nearRhymes: nearRhymes + maybeRhymes,
                typos: 0,
                repeatedWords: getRepeatPenalty(lines) > 0 ? 1 : 0,
                percentage: (perfectRhymes * perfectRhymeScore + nearRhymes * nearRhymeScore + maybeRhymes * maybeRhymeScore) / 4
            };

            const syllableMatchCount = getSyllableMatchCount(lines);

            newScoreBreakdown.flowBreakdown = {
                syllableMatch: syllableMatchCount,
                rhymePlacement: 0,
                syllableDifference: lines.length / 2 - syllableMatchCount,
                percentage: syllableMatch
            };

            newScoreBreakdown.lengthBreakdown = {
                ...getSentenceLengthInfo(lines),
                percentage: wordCountPenalty < 1 ? 0.1 : (complexity / 0.3)
            };

            newScoreBreakdown.speedBreakdown = {
                timeRemaining: timeLeft,
                ranOutOfTime: timeLeft < 1,
                percentage: Math.min(timePercentageLeft / 100, 10)
            };

            setScoreBreakdown(newScoreBreakdown);

            // @ts-ignore
            setScore(score !== NaN && score > 0 ? score : 0);
            setPageState("score");
        });
    }

    if (pageState === "intro") {
        return (
            <div className="absolute top-[90px] left-0 right-0 flex justify-center items-center max-w-[1920px] px-[100px] mx-auto">
                <div className="flex-col justify-center items-center gap-10 flex">
                    <div className="flex-col justify-center items-center flex">
                        <div className="text-center">
                            <span className="text-[211px] font-bold tracking-[3.05px]">{countdownTimeLeft}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else if (pageState === "rapping") {
        return (
            <>
                <div className="w-full px-[30px] lg:px-[100px] pb-[30px] lg:pb-[100px] pt-[25px] mx-auto flex flex-col h-[100vh]">
                    <div className={"absolute left-0 top-0 h-5 lg:h-8 w-full"}>
                        <div className={`h-full transition-width ease-linear duration-[990ms] ` + calculateColor(timePercentageLeft)} style={{ "width": timePercentageLeft + "%" }}></div>
                    </div>
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

                {/* Quit Confirmation Modal */}
                {showQuitConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1B1C1D] rounded-[25px] p-6 max-w-sm w-full">
                            <h3 className="text-xl font-bold text-center mb-4 text-black dark:text-white">
                                Quit Session?
                            </h3>
                            <p className="text-center text-[#565757] dark:text-[#B2B2B2] mb-6">
                                Are you sure you want to quit? Your progress will be lost.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleQuitCancel}
                                    className="flex-1 py-3 px-4 bg-[#F5F5F5] dark:bg-[#343737] rounded-[12px] text-black dark:text-white font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleQuitConfirm}
                                    className="flex-1 py-3 px-4 bg-[#FF4444] rounded-[12px] text-white font-semibold"
                                >
                                    Quit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    } else if (pageState === "score") {
        return (
            <div className="max-w-[2560px] w-full h-full px-[30px] lg:px-[100px] pt-[30px] lg:pt-[50px] mx-auto text-center flex flex-col">
                <Header 
                    difficulty={newDifficulty} 
                    onDifficultyChange={handleEasterEggDifficultyChange}
                />
                <div className='flex flex-col lg:flex-row items-center mt-5'>
                    <ScoreGauge
                        score={score}
                        max={536}
                        word={word}
                        scoreBreakdown={scoreBreakdown}
                        difficulty={difficulty}
                        lines={lines}
                        onScoreBreakdownClick={() => setScoreDetailsBottomSheetOpen(true)}
                    />
                    <div className="lg:hidden text-[14px] text-[#565757] dark:text-[#B2B2B2] -translate-y-[20px]">
                        4-Bar Mode | {difficulty[0].toUpperCase() + difficulty.slice(1)} &quot;{word.charAt(0).toUpperCase() + word.slice(1)}&quot;
                    </div>
                    <div className="hidden lg:flex flex-1 min-w-0">
                        <ScoreBreakdownView 
                            scoreBreakdown={scoreBreakdown} 
                            lines={lines.filter(line => line.trim() !== '')}
                            mode="4-Bar Mode"
                            difficulty={difficulty}
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
                                onChange={(e) => updateLines(index, e.currentTarget.value)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                value={line}
                                className={"text-start text-[14px] lg:text-2xl py-[15px] lg:pt-[24px] pr-[15px] lg:pr-[40px] text-black dark:text-[#E1E3E3] dark:bg-[#1C1E1E] lg:leading-snug pl-[50px] lg:pl-[60px] " + (index === lines.length - 1 && index === 0 ? "rounded-[12px] lg:rounded-[25px]" : (index === lines.length - 1 ? "rounded-b-[12px] lg:rounded-b-[25px]" : (index === 0 ? "rounded-t-[12px] lg:rounded-t-[25px] border-b-2 border-[#F5F5F5] dark:border-[#343737]" : "border-b-2 border-[#F5F5F5] dark:border-[#343737]")))}
                                readOnly={true}
                            />
                        </div>
                    ))}
                </div>

                <div className='flex lg:mt-[30px] justify-center h-[43px] lg:h-[73px] w-full lg:w-auto gap-2.5 mb-[15px] lg:mb-0'>
                    <ModeSelector
                        options={difficultyOptions}
                        selectedMode={newDifficulty}
                        onModeSelect={handleDifficultySelectWrapper}
                        onButtonClick={handleDifficultyButtonWrapper}
                        onClose={() => setDifficultyMenuOpen(false)}
                        isMenuOpen={difficultyMenuOpen}
                    />
                    <button className="bg-[#5CE2C7] h-[73px] mx-[25px] rounded-[12px] lg:rounded-[25px] text-black dark:text-white text-[18px] lg:text-[25px] font-bold font-[termina] hidden lg:block w-full lg:w-[286px]" onClick={() => reset()}>PLAY AGAIN</button>
                    <ModeSelector
                        options={gameModeOptions}
                        selectedMode={newGameMode}
                        onModeSelect={handleGameModeSelectWrapper}
                        onButtonClick={handleGameModeButtonWrapper}
                        onClose={() => setGameModeMenuOpen(false)}
                        isMenuOpen={gameModeMenuOpen}
                    />
                </div>
                <button className="bg-[#5CE2C7] py-[10px] px-[20px] mb-[30px] rounded-[12px] text-black dark:text-white text-[18px] lg:text-[25px] font-bold font-[termina] block lg:hidden w-full" onClick={() => reset()}>PLAY AGAIN</button>

                <footer className="w-full mx-auto text-center pb-[20px] pt-[40px] opacity-50 font-[neulis-sans] font-bold text-[#565757] hidden lg:block">
                    ©{new Date().getFullYear()} LineZero Studio. All rights reserved.
                </footer>

                {/* Bottom Sheets for Mobile */}
                <DifficultyBottomSheet
                    isOpen={difficultyBottomSheetOpen}
                    onClose={() => setDifficultyBottomSheetOpen(false)}
                    difficulty={newDifficulty}
                    onDifficultySelect={handleDifficultySelect}
                />
                
                <ModeBottomSheet
                    isOpen={gameModeBottomSheetOpen}
                    onClose={() => setGameModeBottomSheetOpen(false)}
                    gameMode={newGameMode}
                    onGameModeSelect={handleGameModeSelect}
                />

                
                <ScoreDetailsBottomSheet
                    isOpen={scoreDetailsBottomSheetOpen}
                    onClose={() => setScoreDetailsBottomSheetOpen(false)}
                    scoreBreakdown={scoreBreakdown}
                    lines={lines.filter(line => line.trim() !== '')}
                    mode="4-Bar Mode"
                    difficulty={difficulty}
                    targetWord={word}
                />
            </div>
        )
    }
}