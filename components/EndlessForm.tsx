'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@/types/difficulty';
import useIsMobile from '../hooks/useIsMobile';
import Intro from './FreestylePhases/Intro';
import EndlessRapping from './FreestylePhases/EndlessRapping';
import Score from './FreestylePhases/Score';
import useCountdown from '../hooks/useCountdown';
import useEndlessTimer from '../hooks/useEndlessTimer';
import useEndlessLines from '../hooks/useEndlessLines';
import { getDifficultyOptions, gameModeOptions } from '@/util/options';
import { evaluateLine } from '@/util/evaluateRhyme';
import { evaluateSubmission } from '@/util/evaluate';
import { ENDLESS_PERFECT_RHYME_REFRESH, ENDLESS_NEAR_RHYME_BONUS } from '@/util/settings';
import ScoreBreakdown from '@/types/breakdown';
import { Mode } from '@/types/mode';

export default function EndlessForm({ word, difficulty }: { word: string, difficulty: Difficulty }) {
    const router = useRouter();
    const isMobile = useIsMobile();

    const [pageState, setPageState] = useState<'intro' | 'rapping' | 'score'>('intro');
    const [totalScore, setTotalScore] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown>(new ScoreBreakdown());
    const [showQuitConfirmation, setShowQuitConfirmation] = useState<boolean>(false);
    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
    
    // Handle browser back button for quit confirmation
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (pageState === 'rapping') {
                event.preventDefault();
                setShowQuitConfirmation(true);
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

    const handleGameOver = async () => {
        // Calculate final score based on all completed lines (no time bonus/penalty for endless)
        const lines = completedLines.map(line => line.text);
        const { score: finalScore, scoreBreakdown: finalBreakdown } = await evaluateSubmission(lines, word, 0, 0);
        setScore(finalScore);
        setScoreBreakdown(finalBreakdown);
        
        // Save submission to database
        try {
            await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lines,
                    score: finalScore,
                    keyword: word,
                    mode: 'Endless Mode',
                    difficulty,
                    scoreBreakdown: finalBreakdown
                }),
            });
        } catch (error) {
            console.error('Failed to save submission:', error);
        }
        
        setPageState('score');
    };

    const { timeLeft, timePercentageLeft, refreshTimer, fullRefresh, reset: resetTimer } = useEndlessTimer(
        pageState === 'rapping' && !isEvaluating, 
        handleGameOver,
        difficulty
    );

    const { 
        currentLine, 
        completedLines, 
        inputRef,
        updateCurrentLine, 
        submitLine, 
        reset: resetLines 
    } = useEndlessLines();

    const [newDifficulty, setNewDifficulty] = useState<Difficulty>(difficulty);
    const [difficultyMenuOpen, setDifficultyMenuOpen] = useState<boolean>(false);
    const [difficultyBottomSheetOpen, setDifficultyBottomSheetOpen] = useState<boolean>(false);

    const [newGameMode, setNewGameMode] = useState<Mode>('Endless Mode');
    const [gameModeMenuOpen, setGameModeMenuOpen] = useState<boolean>(false);
    const [gameModeBottomSheetOpen, setGameModeBottomSheetOpen] = useState<boolean>(false);
    const [scoreDetailsBottomSheetOpen, setScoreDetailsBottomSheetOpen] = useState<boolean>(false);

    const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

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

    const handleEasterEggDifficultyChange = (newDifficulty: Difficulty) => {
        setNewDifficulty(newDifficulty);
    };

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

    const difficultyOptions = useMemo(() => getDifficultyOptions(newDifficulty), [newDifficulty]);

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

    const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            
            if (currentLine.trim() && !isEvaluating) {
                setIsEvaluating(true);
                
                // Evaluate the rhyme quality
                const rhymeQuality = await evaluateLine(currentLine, completedLines.map(line => line.text), word);
                
                // Update timer based on rhyme quality
                if (rhymeQuality === 'perfect') {
                    refreshTimer(ENDLESS_PERFECT_RHYME_REFRESH);
                    setTotalScore(prev => prev + 100); // Award points for perfect rhyme
                } else if (rhymeQuality === 'near') {
                    refreshTimer(ENDLESS_NEAR_RHYME_BONUS);
                    setTotalScore(prev => prev + 50); // Award points for near rhyme
                }
                
                // Submit the line
                submitLine(rhymeQuality);
                
                setIsEvaluating(false);
            }
        }
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
        setPageState('intro');
        resetCountdown(3);
        resetTimer();
        resetLines();
        setTotalScore(0);
        router.replace('/' + getRouteGameMode(newGameMode) + '/' + getRouteDifficulty(newDifficulty));
    };

    if (pageState === "intro") {
        return <Intro countdownTimeLeft={countdownTimeLeft} />
    } else if (pageState === "rapping") {
        return (
            <EndlessRapping
                word={word}
                difficulty={difficulty}
                currentLine={currentLine}
                completedLines={completedLines}
                inputRef={inputRef}
                timePercentageLeft={timePercentageLeft}
                updateCurrentLine={updateCurrentLine}
                handleKeyPress={handleKeyPress}
                showQuitConfirmation={showQuitConfirmation}
                onQuitConfirm={handleQuitConfirm}
                onQuitCancel={handleQuitCancel}
                onEndEarly={() => handleGameOver()}
            />
        )
    } else if (pageState === "score") {
        const lines = completedLines.map(line => line.text);
        return (
            <Score
                word={word}
                score={score}
                scoreBreakdown={scoreBreakdown}
                difficulty={difficulty}
                newDifficulty={newDifficulty}
                lines={lines}
                inputRefs={inputRefs}
                mode="Endless Mode"
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

