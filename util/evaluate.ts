import { arraysEqual, getLastWord } from '@/util';
import { getRhymeData } from '@/util/rhymes';
import { getScore, perfectRhymeScore, nearRhymeScore, maybeRhymeScore, getSyllableMatch, getBonusPoints, getComplexity, getPenalty, getWordCountPenalty, getRepeatPenalty, getSyllableMatchCount, getSentenceLengthInfo } from '@/util/score';
import ScoreBreakdown from '@/types/breakdown';

export async function evaluateSubmission(lines: string[], word: string, timeLeft: number, timePercentageLeft: number) {
    const result = await getRhymeData(lines, word);
    const { mappedLines, linePronunciations, targetWordPronunciation } = result;

    const phonemesToTarget = targetWordPronunciation.substring(
        targetWordPronunciation.lastIndexOf(' ', targetWordPronunciation.lastIndexOf('1'))
    );

    const perfectRhymes = linePronunciations.map(linePronunciation => {
        return linePronunciation.endsWith(phonemesToTarget);
    }).reduce((acc, val) => acc + (val ? 1 : 0), 0);

    const nearRhymes = linePronunciations.map(linePronunciation => {
        const phonemesToCheck = linePronunciation.substring(linePronunciation.lastIndexOf(' ', linePronunciation.lastIndexOf('1')));
        const vowelPhonemesToCheck = phonemesToCheck.split(' ').filter(phoneme => phoneme.includes('1') || phoneme.includes('0') || phoneme.includes('2'));
        const vowelPhonemesToTarget = phonemesToTarget.split(' ').filter(phoneme => phoneme.includes('1') || phoneme.includes('0') || phoneme.includes('2'));
        return arraysEqual(vowelPhonemesToCheck, vowelPhonemesToTarget);
    }).reduce((acc, val) => acc + (val ? 1 : 0), 0) - perfectRhymes;

    const maybeRhymes = Math.max((linePronunciations.map(linePronunciation => {
        const phonemesToCheck = linePronunciations.length ? linePronunciation.substring(linePronunciation.lastIndexOf(' ', linePronunciation.lastIndexOf('1'))) : '';
        return phonemesToCheck[0] == phonemesToTarget[0] && phonemesToCheck.length == phonemesToTarget.length;
    }).reduce((acc, val) => acc + (val ? 1 : 0), 0) - perfectRhymes - nearRhymes), 0);

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

    const newScoreBreakdown = new ScoreBreakdown();
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

    return { score: (!Number.isNaN(score) && score > 0 ? score : 0), scoreBreakdown: newScoreBreakdown } as const;
}


