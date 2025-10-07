'use client'

import React, { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Score from './FreestylePhases/Score';
import ScoreBreakdown from '@/types/breakdown';
import { Difficulty } from '@/types/difficulty';
import { Mode } from '@/types/mode';
import { getDifficultyOptions, gameModeOptions as getGameModeOptions } from '@/util/options';

type ViewScoreProps = {
    lines: string[];
    score: number;
    keyword: string;
    mode: Mode;
    difficulty: Difficulty;
    scoreBreakdown: ScoreBreakdown;
};

export default function ViewScore({
    lines,
    score,
    keyword,
    mode,
    difficulty,
    scoreBreakdown
}: ViewScoreProps) {
    const router = useRouter();
    const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

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
        router.push('/' + getRouteGameMode(newGameMode) + '/' + getRouteDifficulty(newDifficulty));
    };

    // Ensure we render placeholder bars when no lines were submitted
    const displayLines = useMemo(() => {
        if (Array.isArray(lines) && lines.length > 0) return lines;
        const count = mode === 'Endless Mode' ? 1 : 4;
        return Array.from({ length: count }, () => '');
    }, [lines, mode]);

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
            difficultyOptions={difficultyOptions}
            difficultyMenuOpen={difficultyMenuOpen}
            onDifficultySelect={handleDifficultySelect}
            onDifficultyButtonClick={handleDifficultyButton}
            onDifficultyMenuClose={handleDifficultyMenuClose}
            gameModeOptions={gameModeOptions}
            newGameMode={newGameMode}
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
        />
    );
}

