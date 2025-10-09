"use server"

import { getPronunciation } from "@/app/server";
import { arraysEqual, getLastWord, getNumberString } from '@/util';

export type RhymeQuality = 'perfect' | 'near' | 'repeated' | 'short' | 'bad';

const sanitizeLine = (line: string) => {
    return line.replace(/(\d+)/g, (match) => {
        return getNumberString(parseInt(match));
    }).replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
}

export async function evaluateLine(line: string, allLines: string[], targetWord: string): Promise<RhymeQuality> {

    line = sanitizeLine(line);
    if (!line) {
        return 'bad';
    }

    const lastWord = getLastWord([line]).toLowerCase();
    if (!lastWord) {
        return 'bad';
    }

    if (line.split(' ').length < 4) {
        return 'short';
    }

    const repeatedWords = allLines.filter(l => l.split(' ').length > 3).filter(l => lastWord === getLastWord([sanitizeLine(l)]).toLowerCase());
    if (repeatedWords.length > 0) {
        return 'repeated';
    }

    try {
        const linePronunciation = await getPronunciation(lastWord);
        const targetWordPronunciation = await getPronunciation(targetWord.toLowerCase());

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

