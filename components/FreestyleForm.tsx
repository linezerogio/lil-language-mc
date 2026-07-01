
'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@/types/difficulty';
import { Mode } from '@/types/mode';
import ScoreBreakdown from '@/types/breakdown';
import useIsMobile from '../hooks/useIsMobile';
import Intro from './FreestylePhases/Intro';
import Rapping from './FreestylePhases/Rapping';
import Score from './FreestylePhases/Score';
import useCountdown from '../hooks/useCountdown';
import useRappingTimer from '../hooks/useRappingTimer';
import useLines from '../hooks/useLines';
import { getDifficultyOptions, gameModeOptions } from '@/util/options';
import { evaluateSubmission } from '@/util/rhyming/evaluate';
import { getEffectiveTimeSeconds } from '@/util/settings';
import type { DailyMode } from '@/util/daily';

type DailySubmitConfig = {
    playerId: string;
    mode: DailyMode;
};

export default function FreestyleForm({
    word,
    difficulty,
    dailySubmit
}: {
    word: string,
    difficulty: Difficulty,
    dailySubmit?: DailySubmitConfig
}) {
    const router = useRouter();
    const isMobile = useIsMobile();
    const hasSubmittedRef = useRef(false);
    const [newGameMode, setNewGameMode] = useState<Mode>('4-Bar Mode');
    const effectiveTotalTime = useMemo(() => getEffectiveTimeSeconds(newGameMode, difficulty), [newGameMode, difficulty]);

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

    const { secondsLeft: countdownTimeLeft, reset: resetCountdown } = useCountdown(3, pageState === 'intro', () => {
                setPageState('rapping');
    });

    const { timeLeft, timePercentageLeft, reset: resetRappingTimer } = useRappingTimer(effectiveTotalTime, pageState === 'rapping', () => submit());

    const { lines, setLines, inputRefs, updateLines, handleKeyPress, reset: resetLines } = useLines(() => submit());

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

    const [gameModeMenuOpen, setGameModeMenuOpen] = useState<boolean>(false);
    const [gameModeBottomSheetOpen, setGameModeBottomSheetOpen] = useState<boolean>(false);

    const handleGameModeButton = (gameMode: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode") => {
        if (isMobile) {
            setGameModeBottomSheetOpen(true);
        } else {
            if (gameModeMenuOpen) {
                setNewGameMode(gameMode as Mode)
            }
            setGameModeMenuOpen(!gameModeMenuOpen)
        }
    }

    const handleGameModeSelect = (selectedMode: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode") => {
        setNewGameMode(selectedMode as Mode);
    }

    // Difficulty options configuration
    const difficultyOptions = useMemo(() => getDifficultyOptions(newDifficulty), [newDifficulty]);

    // Game mode options come from util/options

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

    const getRouteGameMode = (gameMode: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode"): string => {
        switch (gameMode) {
            case 'Endless Mode':
                return 'endless';
            default:
                return 'freestyle';
        }
    };

    const reset = () => {
        hasSubmittedRef.current = false;
        setPageState('intro');
        resetCountdown(3);
        resetRappingTimer();
        resetLines();
        setScore(0);
        if (dailySubmit) {
            router.replace('/daily');
            return;
        }
        router.replace('/' + getRouteGameMode(newGameMode) + '/' + getRouteDifficulty(newDifficulty));
    };

    const submit = async () => {
        if (hasSubmittedRef.current) {
            return;
        }
        hasSubmittedRef.current = true;

        const { score, scoreBreakdown } = await evaluateSubmission(lines, word, timeLeft, timePercentageLeft);
        const submittedLines = lines.filter(line => line.trim() !== '');
        setScoreBreakdown(scoreBreakdown);
        // @ts-ignore
        setScore(score);
        
        // Save submission to database
        try {
            const response = await fetch(dailySubmit ? '/api/daily/submissions' : '/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dailySubmit ? {
                    playerId: dailySubmit.playerId,
                    mode: dailySubmit.mode,
                    lines: submittedLines,
                    score
                } : {
                    lines: submittedLines,
                    score,
                    keyword: word,
                    mode: '4-Bar Mode',
                    difficulty,
                    scoreBreakdown
                }),
            });

            if (dailySubmit) {
                const data = await response.json().catch(() => null);

                if ((response.ok || response.status === 409) && data?.id) {
                    router.replace(`/submissions/${data.id}`);
                    return;
                }

                console.error('Failed to save Daily submission:', data);
            }
        } catch (error) {
            console.error('Failed to save submission:', error);
        }
        
        setPageState('score');
    }

    if (pageState === "intro") {
        return <Intro countdownTimeLeft={countdownTimeLeft} />
    } else if (pageState === "rapping") {
        return (
            <Rapping
                word={word}
                difficulty={difficulty}
                lines={lines}
                inputRefs={inputRefs}
                timePercentageLeft={timePercentageLeft}
                updateLines={updateLines}
                handleKeyPress={handleKeyPress}
                showQuitConfirmation={showQuitConfirmation}
                onQuitConfirm={handleQuitConfirm}
                onQuitCancel={handleQuitCancel}
                showDifficulty={!dailySubmit}
            />
        )
    } else if (pageState === "score") {
        return (
            <Score
                word={word}
                        score={score}
                        scoreBreakdown={scoreBreakdown}
                        difficulty={difficulty}
                newDifficulty={newDifficulty}
                lines={lines}
                inputRefs={inputRefs}
                showDifficulty={!dailySubmit}
                difficultyOptions={difficultyOptions}
                difficultyMenuOpen={difficultyMenuOpen}
                onDifficultySelect={handleDifficultySelectWrapper}
                onDifficultyButtonClick={handleDifficultyButtonWrapper}
                onDifficultyMenuClose={() => setDifficultyMenuOpen(false)}
                gameModeOptions={gameModeOptions}
                newGameMode={newGameMode}
                gameModeMenuOpen={gameModeMenuOpen}
                onGameModeSelect={handleGameModeSelectWrapper}
                onGameModeButtonClick={handleGameModeButtonWrapper}
                onGameModeMenuClose={() => setGameModeMenuOpen(false)}
                difficultyBottomSheetOpen={difficultyBottomSheetOpen}
                onDifficultyBottomSheetClose={() => setDifficultyBottomSheetOpen(false)}
                onDifficultyBottomSheetSelect={handleDifficultySelect}
                gameModeBottomSheetOpen={gameModeBottomSheetOpen}
                onGameModeBottomSheetClose={() => setGameModeBottomSheetOpen(false)}
                onGameModeBottomSheetSelect={handleGameModeSelect}
                scoreDetailsBottomSheetOpen={scoreDetailsBottomSheetOpen}
                onScoreDetailsBottomSheetClose={() => setScoreDetailsBottomSheetOpen(false)}
                        onScoreBreakdownClick={() => setScoreDetailsBottomSheetOpen(true)}
                onEasterEggDifficultyChange={handleEasterEggDifficultyChange}
                onPlayAgain={() => reset()}
            />
        )
    }
}
