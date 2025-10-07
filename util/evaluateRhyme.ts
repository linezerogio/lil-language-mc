"use server"

import { getPronunciation } from "@/app/server";
import { arraysEqual, getLastWord } from '@/util';

export type RhymeQuality = 'perfect' | 'near' | 'bad';

export async function evaluateLine(line: string, targetWord: string): Promise<RhymeQuality> {
    if (!line.trim()) {
        return 'bad';
    }

    const lastWord = getLastWord([line]);
    if (!lastWord) {
        return 'bad';
    }

    try {
        const linePronunciation = await getPronunciation(lastWord);
        const targetWordPronunciation = await getPronunciation(targetWord);

        if (!linePronunciation || !targetWordPronunciation) {
            return 'bad';
        }

        // Extract phonemes to target (from last stressed syllable)
        const phonemesToTarget = targetWordPronunciation.substring(
            targetWordPronunciation.lastIndexOf(' ', targetWordPronunciation.lastIndexOf('1'))
        );

        // Check for perfect rhyme
        if (linePronunciation.endsWith(phonemesToTarget)) {
            return 'perfect';
        }

        // Check for near rhyme (vowel sounds match)
        const phonemesToCheck = linePronunciation.substring(
            linePronunciation.lastIndexOf(' ', linePronunciation.lastIndexOf('1'))
        );
        
        const vowelPhonemesToCheck = phonemesToCheck.split(' ').filter((phoneme: string) => 
            phoneme.includes('1') || phoneme.includes('0') || phoneme.includes('2')
        );
        const vowelPhonemesToTarget = phonemesToTarget.split(' ').filter((phoneme: string) => 
            phoneme.includes('1') || phoneme.includes('0') || phoneme.includes('2')
        );

        if (arraysEqual(vowelPhonemesToCheck, vowelPhonemesToTarget)) {
            return 'near';
        }

        return 'bad';
    } catch (error) {
        console.error('Error evaluating rhyme:', error);
        return 'bad';
    }
}

