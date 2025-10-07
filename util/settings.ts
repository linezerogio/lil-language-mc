import { Difficulty } from '@/types/difficulty';
import { Mode } from '@/types/mode';



// Endless Mode Configuration
export const ENDLESS_STARTING_TIME = 300; // seconds
export const ENDLESS_PERFECT_RHYME_REFRESH = 30; // seconds (full refresh)
export const ENDLESS_NEAR_RHYME_BONUS = 15; // seconds
export const ENDLESS_MAX_TIME = 300; // seconds (cap)

export type DifficultySettings = {
    timeMultiplier: number; // multiply base or mode default time
    wordSelection: {
        ntileSeparator: number; // e.g., 3 for Thirds, 10 for Deciles
        ntileName: 'Third' | 'Decile'; // alias used in SQL
        ntileValue: number; // e.g., 1 for top third/decile
    }
};

export type ModeSettings = {
    defaultTime: number; // base time seconds for the mode (before multiplier)
    route: string; // route segment for navigation
};

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
    // Tertiles via DESC sort: 1 = top third, 2 = middle, 3 = bottom
    'easy': { timeMultiplier: 1.0, wordSelection: { ntileSeparator: 3, ntileName: 'Third', ntileValue: 1 } },
    'medium': { timeMultiplier: 1.0, wordSelection: { ntileSeparator: 3, ntileName: 'Third', ntileValue: 2 } },
    'hard': { timeMultiplier: 1.0, wordSelection: { ntileSeparator: 3, ntileName: 'Third', ntileValue: 3 } },
    // ZBRA Easy: top decile; ZBRA Hard remains special-cased in server
    'zbra-easy': { timeMultiplier: 2.0, wordSelection: { ntileSeparator: 10, ntileName: 'Decile', ntileValue: 1 } },
    'zbra-hard': { timeMultiplier: 1.0, wordSelection: { ntileSeparator: 3, ntileName: 'Third', ntileValue: 3 } }
};

export const MODE_SETTINGS: Record<Mode, ModeSettings> = {
    '4-Bar Mode': { defaultTime: 60, route: 'freestyle' },
    'Rapid Fire Mode': { defaultTime: 90, route: 'rapid' },
    'Endless Mode': { defaultTime: ENDLESS_STARTING_TIME, route: 'endless' }
};

export function getEffectiveTimeSeconds(mode: Mode, difficulty: Difficulty): number {
    const { defaultTime } = MODE_SETTINGS[mode];
    const { timeMultiplier } = DIFFICULTY_SETTINGS[difficulty];
    if (defaultTime === 0) return 0; // endless mode
    return Math.round(defaultTime * timeMultiplier);
}


