'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Score from './FreestylePhases/Score';
import ScoreBreakdown from '@/types/breakdown';
import { Difficulty } from '@/types/difficulty';
import { Mode } from '@/types/mode';
import { getDifficultyOptions, gameModeOptions as getGameModeOptions } from '@/util/options';
import { getOrCreateDailyPlayerId } from '@/util/dailyIdentity';
import type { DailyAttemptStatus, DailyChallenge, DailyMode } from '@/util/daily';

type DailySubmissionContext = {
    challengeDate: string;
    challengeNumber: number;
    dailyMode: DailyMode;
};

type DailyOverview = {
    challenge: DailyChallenge;
    attemptStatus?: DailyAttemptStatus;
};

type ViewScoreProps = {
    lines: string[];
    score: number;
    keyword: string;
    mode: Mode;
    difficulty: Difficulty;
    scoreBreakdown: ScoreBreakdown;
    showDifficulty?: boolean;
    daily?: DailySubmissionContext | null;
};

function getDailyModePath(mode: DailyMode) {
    return mode === 'Endless Mode' ? '/daily/endless' : '/daily/freestyle';
}

function getOtherDailyMode(mode: DailyMode): DailyMode {
    return mode === 'Endless Mode' ? '4-Bar Mode' : 'Endless Mode';
}

function getDailyModeStatus(attemptStatus: DailyAttemptStatus | undefined, mode: DailyMode) {
    return mode === 'Endless Mode'
        ? attemptStatus?.modes.endless
        : attemptStatus?.modes.freestyle;
}

function getDailyModeLabel(mode: DailyMode) {
    return mode === 'Endless Mode' ? 'DAILY ENDLESS' : 'DAILY 4-BAR';
}

export default function ViewScore({
    lines,
    score,
    keyword,
    mode,
    difficulty,
    scoreBreakdown,
    showDifficulty = true,
    daily = null
}: ViewScoreProps) {
    const router = useRouter();
    const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
    const [dailyOverview, setDailyOverview] = useState<DailyOverview | null>(null);
    const [dailyLoading, setDailyLoading] = useState(Boolean(daily));
    const [dailyError, setDailyError] = useState<string | null>(null);

    // State for UI controls
    const [newDifficulty, setNewDifficulty] = useState<Difficulty>(difficulty);
    const [newGameMode, setNewGameMode] = useState<Mode>(mode);
    
    // Desktop menu state
    const [difficultyMenuOpen, setDifficultyMenuOpen] = useState(false);
    const [gameModeMenuOpen, setGameModeMenuOpen] = useState(false);
    
    // Mobile bottom sheet state
    const [difficultyBottomSheetOpen, setDifficultyBottomSheetOpen] = useState(false);
    const [gameModeBottomSheetOpen, setGameModeBottomSheetOpen] = useState(false);
    const [scoreDetailsBottomSheetOpen, setScoreDetailsBottomSheetOpen] = useState(false);

    // Get options
    const difficultyOptions = useMemo(() => getDifficultyOptions(newDifficulty), [newDifficulty]);
    const gameModeOptions = useMemo(() => getGameModeOptions, []);

    useEffect(() => {
        if (!daily) {
            return;
        }

        let cancelled = false;

        async function loadDailyStatus() {
            try {
                setDailyLoading(true);
                setDailyError(null);
                const playerId = getOrCreateDailyPlayerId();
                const response = await fetch(`/api/daily?playerId=${encodeURIComponent(playerId)}`, {
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error('Daily is unavailable');
                }

                const data: DailyOverview = await response.json();
                if (!cancelled) {
                    setDailyOverview(data);
                    setDailyLoading(false);
                }
            } catch (error: any) {
                if (!cancelled) {
                    setDailyError(error?.message ?? 'Daily is unavailable');
                    setDailyLoading(false);
                }
            }
        }

        loadDailyStatus();

        return () => {
            cancelled = true;
        };
    }, [daily]);

    // Difficulty handlers
    const handleDifficultySelect = (selectedDifficulty: string) => {
        setNewDifficulty(selectedDifficulty as Difficulty);
        setDifficultyMenuOpen(false);
        setDifficultyBottomSheetOpen(false);
    };

    const handleDifficultyButton = (selectedDifficulty: string) => {
        if (window.innerWidth < 1024) {
            setDifficultyBottomSheetOpen(true);
        } else {
            setDifficultyMenuOpen(!difficultyMenuOpen);
        }
    };

    const handleDifficultyMenuClose = () => {
        setDifficultyMenuOpen(false);
    };

    const handleDifficultyBottomSheetClose = () => {
        setDifficultyBottomSheetOpen(false);
    };

    const handleDifficultyBottomSheetSelect = (selectedDifficulty: Difficulty) => {
        setNewDifficulty(selectedDifficulty);
        setDifficultyBottomSheetOpen(false);
    };

    // Game mode handlers
    const handleGameModeSelect = (selectedMode: string) => {
        setNewGameMode(selectedMode as Mode);
        setGameModeMenuOpen(false);
        setGameModeBottomSheetOpen(false);
    };

    const handleGameModeButton = (selectedMode: string) => {
        if (window.innerWidth < 1024) {
            setGameModeBottomSheetOpen(true);
        } else {
            setGameModeMenuOpen(!gameModeMenuOpen);
        }
    };

    const handleGameModeMenuClose = () => {
        setGameModeMenuOpen(false);
    };

    const handleGameModeBottomSheetClose = () => {
        setGameModeBottomSheetOpen(false);
    };

    const handleGameModeBottomSheetSelect = (selectedMode: Mode) => {
        setNewGameMode(selectedMode);
        setGameModeBottomSheetOpen(false);
    };

    // Score breakdown handlers
    const handleScoreBreakdownClick = () => {
        setScoreDetailsBottomSheetOpen(true);
    };

    const handleScoreDetailsBottomSheetClose = () => {
        setScoreDetailsBottomSheetOpen(false);
    };

    // Easter egg handler (from header)
    const handleEasterEggDifficultyChange = (selectedDifficulty: Difficulty) => {
        setNewDifficulty(selectedDifficulty);
    };

    // Play again handler
    const getRouteGameMode = (gameMode: Mode): string => {
        switch (gameMode) {
            case 'Endless Mode':
                return 'endless';
            default:
                return 'freestyle';
        }
    };

    const getRouteDifficulty = (difficulty: Difficulty): string => {
        return difficulty;
    };

    const handlePlayAgain = () => {
        if (dailyAction) {
            if (!dailyAction.disabled && dailyAction.path) {
                router.push(dailyAction.path);
            }
            return;
        }

        router.push('/' + getRouteGameMode(newGameMode) + '/' + getRouteDifficulty(newDifficulty));
    };

    // Ensure we render placeholder bars when no lines were submitted
    const displayLines = useMemo(() => {
        if (Array.isArray(lines) && lines.length > 0) return lines;
        const count = mode === 'Endless Mode' ? 1 : 4;
        return Array.from({ length: count }, () => '');
    }, [lines, mode]);

    const dailyAction = useMemo(() => {
        if (!daily) {
            return null;
        }

        if (dailyLoading) {
            return {
                label: 'LOADING',
                disabled: true,
                mode: daily.dailyMode,
                path: null,
            };
        }

        if (dailyError || !dailyOverview || dailyOverview.challenge.id !== daily.challengeNumber) {
            return {
                label: 'DAILY COMPLETE',
                disabled: true,
                mode: daily.dailyMode,
                path: null,
            };
        }

        const currentStatus = getDailyModeStatus(dailyOverview.attemptStatus, daily.dailyMode);
        if (!currentStatus?.completed) {
            return {
                label: `PLAY ${getDailyModeLabel(daily.dailyMode)}`,
                disabled: false,
                mode: daily.dailyMode,
                path: getDailyModePath(daily.dailyMode),
            };
        }

        const otherMode = getOtherDailyMode(daily.dailyMode);
        const otherStatus = getDailyModeStatus(dailyOverview.attemptStatus, otherMode);
        if (!otherStatus?.completed) {
            return {
                label: `PLAY ${getDailyModeLabel(otherMode)}`,
                disabled: false,
                mode: otherMode,
                path: getDailyModePath(otherMode),
            };
        }

        return {
            label: 'VIEW SUBMISSION',
            disabled: true,
            mode: daily.dailyMode,
            path: null,
        };
    }, [daily, dailyError, dailyLoading, dailyOverview]);

    return (
        <Score
            word={keyword}
            score={score}
            scoreBreakdown={scoreBreakdown}
            difficulty={difficulty}
            newDifficulty={newDifficulty}
            lines={displayLines}
            inputRefs={inputRefs}
            mode={mode}
            showDifficulty={showDifficulty}
            difficultyOptions={difficultyOptions}
            difficultyMenuOpen={difficultyMenuOpen}
            onDifficultySelect={handleDifficultySelect}
            onDifficultyButtonClick={handleDifficultyButton}
            onDifficultyMenuClose={handleDifficultyMenuClose}
            gameModeOptions={gameModeOptions}
            newGameMode={dailyAction?.mode ?? newGameMode}
            gameModeMenuOpen={gameModeMenuOpen}
            onGameModeSelect={handleGameModeSelect}
            onGameModeButtonClick={handleGameModeButton}
            onGameModeMenuClose={handleGameModeMenuClose}
            difficultyBottomSheetOpen={difficultyBottomSheetOpen}
            onDifficultyBottomSheetClose={handleDifficultyBottomSheetClose}
            onDifficultyBottomSheetSelect={handleDifficultyBottomSheetSelect}
            gameModeBottomSheetOpen={gameModeBottomSheetOpen}
            onGameModeBottomSheetClose={handleGameModeBottomSheetClose}
            onGameModeBottomSheetSelect={handleGameModeBottomSheetSelect}
            scoreDetailsBottomSheetOpen={scoreDetailsBottomSheetOpen}
            onScoreDetailsBottomSheetClose={handleScoreDetailsBottomSheetClose}
            onScoreBreakdownClick={handleScoreBreakdownClick}
            onEasterEggDifficultyChange={handleEasterEggDifficultyChange}
            onPlayAgain={handlePlayAgain}
            primaryActionLabel={dailyAction?.label}
            primaryActionDisabled={dailyAction?.disabled}
        />
    );
}

