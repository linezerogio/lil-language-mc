'use client'

import Image from 'next/image'
import { useState, useEffect, KeyboardEvent, useRef, use } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { arraysEqual, getLastWord, getTimePercentageClass } from '@/util';
import { getRhymeData } from '@/util/rhymes';
import { getScore, perfectRhymeScore, nearRhymeScore, maybeRhymeScore, getSyllableMatch, getBonusPoints, getComplexity, getPenalty, getWordCountPenalty, getRepeatPenalty, getSyllableMatchCount, getSentenceLengthInfo } from '@/util/score';
import { Difficulty } from '@/types/difficulty';
import TextareaAutosize from 'react-autosize-textarea';
import { totalTime } from '@/util/constants';
import ScoreGauge from './ScoreGauge';
import ScoreBreakdownView from './ScoreBreakdownView';
import ScoreBreakdown from '@/types/breakdown';
import Header from "./Header";
import { DifficultySheet } from './DifficultySheet';
import { ModeSelectSheet } from './ModeSelectSheet';

const calculateColor = (percentage: number) => {
    return (percentage > 75 ? "bg-[#5DE3C8]" : (percentage > 50 ? "bg-[#5DE36A]" : (percentage > 25 ? "bg-[#E0E35D]" : (percentage > 10 ? "bg-[#FF7B01]" : "bg-[#FF0101]"))));
}

export default function FreestyleForm({ word, difficulty }: { word: string, difficulty: Difficulty }) {
    const router = useRouter();

    const [countdownTimeLeft, setCountdownTimeLeft] = useState(3);
    const [countdownActive, setCountdownActive] = useState<boolean>(true);

    const [pageState, setPageState] = useState<'intro' | 'rapping' | 'score'>('intro');

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
    }, [timeLeft, pageState]);

    const [lines, setLines] = useState<string[]>(['']);
    const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

    const [score, setScore] = useState<number>(0);
    const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown>(new ScoreBreakdown());

    const [newDifficulty, setNewDifficulty] = useState<Difficulty>(difficulty);
    const [difficultyMenuOpen, setDifficultyMenuOpen] = useState<boolean>(false);

    const handleDifficultyButton = (difficulty: Difficulty) => {
        if (difficultyMenuOpen) {
            setNewDifficulty(difficulty)
        }
        setDifficultyMenuOpen(!difficultyMenuOpen)
    }

    const [newGameMode, setNewGameMode] = useState<"4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode">("4-Bar Mode");
    const [gameModeMenuOpen, setGameModeMenuOpen] = useState<boolean>(false);

    const handleGameModeButton = (gameMode: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode") => {
        if (gameModeMenuOpen) {
            setNewGameMode(gameMode)
        }
        setGameModeMenuOpen(!gameModeMenuOpen)
    }

    const reset = () => {
        setPageState('intro');
        setCountdownTimeLeft(3);
        setCountdownActive(true);
        setTimeLeft(totalTime);
        setTimePercentageLeft(100);
        setLines(['']);
        setScore(0);
        router.replace('/freestyle/' + newDifficulty);
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
            <div className="w-full px-[30px] md:px-[100px] pb-[30px] md:pb-[100px] pt-[25px] mx-auto flex flex-col h-[100vh]">
                <div className={"absolute left-0 top-0 h-8 w-full"}>
                    <div className={`h-full transition-width ease-linear duration-[990ms] ` + calculateColor(timePercentageLeft)} style={{ "width": timePercentageLeft + "%" }}></div>
                </div>
                <div className="flex flex-col w-auto pb-[36px] md:pb-[220px] pt-[36px] md:pt-[100px] mx-auto">
                    <div className="flex w-auto content-center items-center">
                        <h1 className='flex-1 text-center pt-[20px] hidden md:block leading-none font-bold tracking-[0.06em] font-display clamp-word'>
                            {word.toUpperCase()}
                        </h1>
                        <h1 className='flex-1 text-center text-[40px] md:px-[100px] pt-[5px] md:pt-[20px] h-[40px] leading-none font-bold tracking-[0.06em] md:hidden font-display'>
                            {word.toUpperCase()}
                        </h1>
                    </div>
                    <div className="flex flex-col w-auto content-center items-center">
                        <h2 className='flex-1 text-center text-[14px] md:text-[1.85vw] md:px-[100px] pt-[15px] leading-none font-bold tracking-[0.06em]'>
                            Write 4 sentences that rhyme with the keyword
                        </h2>
                        <h3 className='flex-1 text-center text-[12px] md:text-[1.3vw] md:px-[100px] pt-[20px] leading-none tracking-[0.06em] text-[#8F8F8F]'>
                            4-Bar Mode | {difficulty[0].toUpperCase() + difficulty.slice(1)}
                        </h3>
                    </div>
                </div>

                <div className='md:w-full flex flex-col flex-1 h-full relative overflow-y-auto rounded-[12px] md:rounded-[25px]'>
                    {lines.map((line, index) => {
                        return (
                            <div key={index} className={'p-0 m-0 flex flex-col relative ' + (index === lines.length - 1 ? "flex-1" : "")}>
                                {index !== lines.length - 1 && <span className='rounded-full bg-[#5DE3C8] absolute w-6 h-6 text-center pt-[1.5px] mt-[15px] md:mt-[26px] ml-[15px] md:ml-[40px] dark:text-black'>{index + 1}</span>}
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
                                    className={"text-start text-[14px] md:text-2xl py-[15px] md:pt-[24px] pr-[15px] md:pr-[40px] dark:text-[#E1E3E3] dark:bg-[#1C1E1E] md:leading-snug " + (index === lines.length - 1 && index === 0 ? "rounded-[12px] md:rounded-[25px] pl-8 flex-1" : (index === lines.length - 1 ? "rounded-b-[12px] md:rounded-b-[25px] pl-8 flex-1" : (index === 0 ? "rounded-t-[12px] md:rounded-t-[25px] border-b-2 border-[#F5F5F5] dark:border-[#343737] pl-[50px] md:pl-[84.5px]" : "border-b-2 border-[#F5F5F5] dark:border-[#343737] pl-[50px] md:pl-[84.5px]")))}
                                ></TextareaAutosize>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    } else if (pageState === "score") {
        return (
            <div className="max-w-[2560px] w-full h-full px-[30px] md:px-[100px] pt-[30px] md:pt-[50px] mx-auto text-center flex flex-col">
                <Header />
                <div className='flex flex-col md:flex-row items-center mt-5'>
                    <ScoreGauge 
                        score={score} 
                        max={536} 
                        word={word} 
                        scoreBreakdown={scoreBreakdown} 
                        difficulty={difficulty}
                        lines={lines}
                    />
                    <div className="md:hidden text-[14px] text-[#565757] dark:text-[#B2B2B2] -translate-y-[20px]">
                        4-Bar Mode | {difficulty[0].toUpperCase() + difficulty.slice(1)} "{word.charAt(0).toUpperCase() + word.slice(1)}"
                    </div>
                    <div className="hidden md:block">
                        <ScoreBreakdownView scoreBreakdown={scoreBreakdown} />
                    </div>
                </div>

                <div className='md:w-full flex flex-col flex-1 relative overflow-y-auto rounded-[12px] md:rounded-[25px]'>
                    {lines.map((line, index) => (
                        <div key={index} className={'p-0 m-0 flex flex-col relative'}>
                            <span className='rounded-full bg-[#5DE3C8] absolute w-6 h-6 text-center pt-[1.5px] mt-[15px] md:mt-[26px] ml-[15px] md:ml-[25px] dark:text-black'>{index + 1}</span>
                            <TextareaAutosize
                                key={index}
                                ref={el => {
                                    if (el) inputRefs.current[index] = el;
                                }}
                                onChange={(e) => updateLines(index, e.currentTarget.value)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                value={line}
                                className={"text-start text-[14px] md:text-2xl py-[15px] md:pt-[24px] pr-[15px] md:pr-[40px] text-black dark:text-[#E1E3E3] dark:bg-[#1C1E1E] md:leading-snug pl-[50px] md:pl-[60px] " + (index === lines.length - 1 && index === 0 ? "rounded-[12px] md:rounded-[25px]" : (index === lines.length - 1 ? "rounded-b-[12px] md:rounded-b-[25px]" : (index === 0 ? "rounded-t-[12px] md:rounded-t-[25px] border-b-2 border-[#F5F5F5] dark:border-[#343737]" : "border-b-2 border-[#F5F5F5] dark:border-[#343737]")))}
                                readOnly={true}
                            />
                        </div>
                    ))}
                </div>

                <div className='hidden md:flex mt-[30px] justify-center h-[73px]'>
                    <div className="bg-[#FFF] dark:bg-[#1C1E1E] flex flex-row relative w-[311px] justify-center z-10 rounded-[25px]">
                        {newDifficulty === "easy" && !difficultyMenuOpen && <button type="button" onClick={() => handleDifficultyButton("easy")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"}>
                            <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}><Image src="/Easy.svg" height={24.57} width={40} alt={"Easy Icon"} className='mr-[10px] px-[5.775px]' /> Easy</div>
                            <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
                        </button>}
                        {newDifficulty === "medium" && !difficultyMenuOpen && <button type="button" onClick={() => handleDifficultyButton("medium")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"}>
                            <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}><Image src="/Medium.svg" height={24.01} width={40} alt={"Medium Icon"} className='mr-[10px] px-[6.1px]' /> Medium</div>
                            <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
                        </button>}
                        {newDifficulty === "hard" && !difficultyMenuOpen && <button type="button" onClick={() => handleDifficultyButton("hard")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"}>
                            <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}><Image src="/Hard.svg" height={26.3} width={40} alt={"Hard Icon"} className='mr-[10px] px-[2.265px]' /> Hard</div>
                            <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
                        </button>}
                        {difficultyMenuOpen && <div className="flex flex-col absolute bottom-0 bg-[#f4f5f6] dark:bg-[#25292D] w-[311px] rounded-[25px] px-3 shadow-[0_4px_40.6px_rgba(0,0,0,0.25)]">
                            <button type="button" onClick={() => handleDifficultyButton("easy")} className={"px-[10px] py-[15px] mt-[12px] justify-center items-start flex flex-col rounded-xl " + (newDifficulty === "easy" ? "bg-[#fff] dark:bg-[#1C1E1E]" : "")}>
                                <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row items-center"}><Image src="/Easy.svg" height={24.57} width={40} alt={"Easy Icon"} className='mr-[10px] px-[5.775px]' /> Easy</div>
                                <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Good for beginners or for maximizing rhymes.</p>
                            </button>
                            <button type="button" onClick={() => handleDifficultyButton("medium")} className={"px-[10px] py-[15px] my-[9px] justify-center items-start flex flex-col rounded-xl " + (newDifficulty === "medium" ? "bg-[#fff] dark:bg-[#1C1E1E]" : "")}>
                                <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row items-center"}><Image src="/Medium.svg" height={24.01} width={40} alt={"Medium Icon"} className='mr-[10px] px-[6.1px]' /> Medium</div>
                                <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Little bit of a challenge to push your limit.</p>
                            </button>
                            <button type="button" onClick={() => handleDifficultyButton("hard")} className={"px-[10px] py-[15px] mb-[12px] justify-center items-start flex flex-col rounded-xl " + (newDifficulty === "hard" ? "bg-[#fff] dark:bg-[#1C1E1E]" : "")}>
                                <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row items-center"}><Image src="/Hard.svg" height={26.3} width={40} alt={"Hard Icon"} className='mr-[10px] px-[2.265px]' /> Hard</div>
                                <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Some of the most difficult words to rhyme with.</p>
                            </button>
                        </div>}
                    </div>
                    <button className="bg-[#5CE2C7] h-[73px] mx-[25px] rounded-[12px] md:rounded-[25px] text-black text-[18px] md:text-[25px] font-bold md:w-[286px] font-[termina]" onClick={() => reset()}>PLAY AGAIN</button>
                    <div className="bg-[#FFF] dark:bg-[#1C1E1E] flex flex-row relative w-[311px] justify-center z-10 rounded-[25px]">
                        {newGameMode === "4-Bar Mode" && !gameModeMenuOpen && <button type="button" onClick={() => handleGameModeButton("4-Bar Mode")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[25px]"}>
                            <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}><Image src="/icons/FourBarMode.svg" height={24} width={23} alt={"4-Bar Mode Icon"} className='mr-[10px]' /> 4-Bar Mode</div>
                            <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
                        </button>}
                        {newGameMode === "Rapid Fire Mode" && !gameModeMenuOpen && <button type="button" onClick={() => {}} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"}>
                            <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}><Image src="/icons/RapidFireMode.svg" height={24.01} width={40} alt={"Rapid Fire Mode Icon"} className='mr-[10px] px-[6.1px]' /> Rapid Fire Mode</div>
                            <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
                        </button>}
                        {newGameMode === "Endless Mode" && !gameModeMenuOpen && <button type="button" onClick={() => {}} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"}>
                            <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}><Image src="/icons/EndlessMode.svg" height={26.3} width={40} alt={"Endless Mode Icon"} className='mr-[10px] px-[2.265px]' /> Endless Mode</div>
                            <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
                        </button>}
                        {gameModeMenuOpen && <div className="flex flex-col absolute bottom-0 bg-[#f4f5f6] dark:bg-[#25292D] w-[311px] rounded-[25px] px-3 shadow-[0_4px_40.6px_rgba(0,0,0,0.25)]">
                            <button type="button" onClick={() => handleGameModeButton("4-Bar Mode")} className={"px-[10px] py-[15px] mt-[12px] justify-center items-start flex flex-col rounded-xl " + (newGameMode === "4-Bar Mode" ? "bg-[#fff] dark:bg-[#1C1E1E]" : "")}>
                                <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row items-center"}><Image src="/icons/FourBarMode.svg" height={24} width={23} alt={"4-Bar Mode Icon"} className='mr-[18.5px] ml-[8.5px]' /> 4-Bar Mode</div>
                                <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Write 4 sentences that rhyme with the keyword within the time limit.</p>
                            </button>
                            <button type="button" onClick={() => {}} className={"px-[10px] py-[15px] my-[9px] justify-center items-start flex flex-col rounded-xl relative cursor-default"}>
                                <div className={"text-[14px] md:text-[25px] font-bold tracking-wider flex flex-row items-center"}><Image src="/icons/RapidFireMode.svg" height={27} width={21.6} alt={"Rapid Fire Mode Icon"} className='mr-[18.5px] ml-[8.5px]' /> Rapid Fire Mode</div>
                                <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Write 2 sentences that rhyme with each keyword. Complete as many keywords as you can within the time limit.</p>
                                <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
                                    <Image src="/icons/Lock.svg" height={37.33} width={28.44} alt={"Lock Icon"} />
                                    <p className="text-[12px] text-white font-bold">Coming Soon</p>
                                </div>
                            </button></div>}
                    </div>
                </div>

                <div className="md:hidden w-full h-[100px] mb-[20px] flex flex-col justify-between gap-[15px]">
                    <div className="flex justify-center h-[42px] gap-[10px]">
                        <DifficultySheet
                            difficulty={newDifficulty}
                            setDifficulty={setNewDifficulty}
                        />

                        {/* Mobile View */}
                        <ModeSelectSheet
                            gameMode={newGameMode}
                            setGameMode={setNewGameMode}
                        />
                    </div>
                    
                    <button 
                        className="bg-[#5CE2C7] h-[43px] w-full rounded-[12px] text-black text-[18px] font-bold font-[termina]" 
                        onClick={() => reset()}
                    >
                        PLAY AGAIN
                    </button>
                </div>

                <footer className="w-full mx-auto text-center pb-[20px] pt-[40px] opacity-50 font-[neulis-sans] font-bold text-[#565757] hidden md:block">
                    ©{new Date().getFullYear()} LineZero Studio. All rights reserved.
                </footer>
            </div>
        )
    }
}