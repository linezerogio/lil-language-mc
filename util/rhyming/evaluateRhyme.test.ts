import { evaluateLine, RhymeQuality } from './evaluateRhyme';
import { getPronunciation } from '@/app/server';
import {
  PERFECT_RHYMES,
  NEAR_RHYMES,
  NON_RHYMES,
  COMMON_WORDS,
  TEST_LINES,
  CONTEXT_LINES,
  SPECIAL_CASES,
  RAP_SCENARIOS,
  getPerfectRhymePairs,
  getNearRhymePairs,
  getNonRhymePairs,
} from './rhymeTestConstants';

/**
 * Helper function to fetch pronunciation from the actual getPronunciation function
 * This is used to get real pronunciations for testing
 */
async function fetchPronunciation(word: string): Promise<string | undefined> {
    return await getPronunciation(word);
}

/**
 * Cache for pronunciations to avoid redundant API calls
 */
const pronunciationCache = new Map<string, string | undefined>();

async function getCachedPronunciation(word: string): Promise<string | undefined> {
  if (!pronunciationCache.has(word)) {
    const pronunciation = await fetchPronunciation(word);
    pronunciationCache.set(word, pronunciation);
  }
  return pronunciationCache.get(word);
}

describe('evaluateLine', () => {
  beforeEach(() => {
    // Clear the pronunciation cache before each test
    pronunciationCache.clear();
  });

  describe('Basic validation', () => {
    test('returns "bad" for empty line', async () => {
      const result = await evaluateLine('', [], COMMON_WORDS.targets[0]);
      expect(result).toBe('bad');
    });

    test('returns "bad" for line with only special characters', async () => {
      const result = await evaluateLine('!!!###', [], COMMON_WORDS.targets[0]);
      expect(result).toBe('bad');
    });

    test('returns "bad" for line with no words', async () => {
      const result = await evaluateLine('   ', [], COMMON_WORDS.targets[0]);
      expect(result).toBe('bad');
    });

    test('returns "short" for lines with less than 4 words', async () => {
      const result = await evaluateLine(TEST_LINES.short[0], [], COMMON_WORDS.targets[0]);
      expect(result).toBe('short');
    });

    test('returns "short" for lines with exactly 3 words', async () => {
      const result = await evaluateLine(TEST_LINES.short[1], [], COMMON_WORDS.targets[0]);
      expect(result).toBe('short');
    });

    test('accepts lines with 4 or more words', async () => {
      const result = await evaluateLine(TEST_LINES.perfect[0], [], 'cat');
      expect(result).not.toBe('short');
    }, 10000);
  });

  describe('Number sanitization', () => {
    test('converts numbers to words before processing', async () => {
      // The line should be processed as "I have exactly one"
      // "one" doesn't rhyme with "cat", so we expect "bad"
      const result = await evaluateLine(TEST_LINES.withNumbers[0], [], 'cat');
      expect(result).toBe('bad');
    }, 10000);

    test('handles multiple numbers in a line', async () => {
      const result = await evaluateLine(TEST_LINES.withNumbers[1], [], 'cat');
      
      // The last word should be "five" - "five" doesn't rhyme with "cat", so we expect "bad"
      expect(result).toBe('bad');
    });
  });

  describe('Repeated words detection', () => {
    test('returns "repeated" when last word was already used', async () => {
      const result = await evaluateLine('I am wearing a hat', CONTEXT_LINES.withRepeatedHat, 'cat');
      expect(result).toBe('repeated');
    });

    test('returns "repeated" for exact same last word', async () => {
      const result = await evaluateLine('I really like that bat', CONTEXT_LINES.withRepeatedBat, 'cat');
      expect(result).toBe('repeated');
    });

    test('does not mark as repeated if previous line was short', async () => {
      const result = await evaluateLine(TEST_LINES.perfect[0], CONTEXT_LINES.withShortLines, 'cat');
      expect(result).not.toBe('repeated');
    });

    test('case insensitive repeated word detection', async () => {
      const contextWithUppercase = ['I am wearing my HAT'];
      const result = await evaluateLine('I like to wear hat', contextWithUppercase, 'cat');
      expect(result).toBe('repeated');
    });

    test('handles lines with special characters when checking repeats', async () => {
      const contextWithPunctuation = ['I am wearing my hat!!!'];
      const result = await evaluateLine('I like to wear hat???', contextWithPunctuation, 'cat');
      expect(result).toBe('repeated');
    });
  });

  describe('Perfect rhyme detection', () => {
    test.each(getPerfectRhymePairs())(
      '%s and %s should rhyme perfectly',
      async (word1, word2) => {
        const testLine = `I have a cool ${word1}`;
        const result = await evaluateLine(testLine, [], word2);
        
        if (result !== 'perfect') {
          const pron1 = await fetchPronunciation(word1);
          const pron2 = await fetchPronunciation(word2);
          console.log(`\n❌ Perfect rhyme test failed: "${word1}" vs "${word2}"`);
          console.log(`   "${word1}" pronunciation: ${pron1 || 'undefined'}`);
          console.log(`   "${word2}" pronunciation: ${pron2 || 'undefined'}`);
          console.log(`   Expected: perfect, Got: ${result}\n`);
        }
        
        expect(result).toBe('perfect');
      },
      10000 // Increase timeout for API calls
    );
  });

  describe('Near rhyme detection', () => {
    test.each(getNearRhymePairs())(
      '%s and %s should near rhyme',
      async (word1, word2) => {
        const testLine = `I have a cool ${word1}`;
        const result = await evaluateLine(testLine, [], word2);
        
        if (result !== 'near') {
          const pron1 = await fetchPronunciation(word1);
          const pron2 = await fetchPronunciation(word2);
          console.log(`\n❌ Near rhyme test failed: "${word1}" vs "${word2}"`);
          console.log(`   "${word1}" pronunciation: ${pron1 || 'undefined'}`);
          console.log(`   "${word2}" pronunciation: ${pron2 || 'undefined'}`);
          console.log(`   Expected: near, Got: ${result}\n`);
        }
        
        expect(result).toBe('near');
      },
      10000 // Increase timeout for API calls
    );
  });

  describe('Bad rhyme detection', () => {
    test.each(getNonRhymePairs())(
      '%s and %s should not rhyme',
      async (word1, word2) => {
        const testLine = `I have a cool ${word1}`;
        const result = await evaluateLine(testLine, [], word2);
        
        if (result !== 'bad') {
          const pron1 = await fetchPronunciation(word1);
          const pron2 = await fetchPronunciation(word2);
          console.log(`\n❌ Bad rhyme test failed: "${word1}" vs "${word2}"`);
          console.log(`   "${word1}" pronunciation: ${pron1 || 'undefined'}`);
          console.log(`   "${word2}" pronunciation: ${pron2 || 'undefined'}`);
          console.log(`   Expected: bad, Got: ${result}\n`);
        }
        
        expect(result).toBe('bad');
      },
      10000 // Increase timeout for API calls
    );

    test('returns "bad" when pronunciation is not found', async () => {
      const result = await evaluateLine(`I have a cool ${SPECIAL_CASES.undefinedWord}`, [], 'cat');
      expect(result).toBe('bad');
    });

    test('returns "bad" when target word pronunciation is not found', async () => {
      const result = await evaluateLine(TEST_LINES.bad[0], [], SPECIAL_CASES.undefinedWord);
      expect(result).toBe('bad');
    });

    test('returns "bad" when both pronunciations are not found', async () => {
      const result = await evaluateLine(`I have a cool ${SPECIAL_CASES.undefinedWord}`, [], 'qwerty');
      expect(result).toBe('bad');
    });
  });

  describe('Error handling', () => {
    // Note: Error handling tests are removed since we're using real API calls
    // In a real scenario, network errors would be handled by the actual getPronunciation function
  });

  describe('Edge cases', () => {
    test('handles line with trailing spaces', async () => {
      const result = await evaluateLine(TEST_LINES.withPunctuation[2], [], 'cat');
      expect(result).toBe('perfect');
    }, 10000);

    test('handles line with leading spaces', async () => {
      const result = await evaluateLine('   I have a cool bat', [], 'cat');
      expect(result).toBe('perfect');
    }, 10000);

    test('handles line with special characters at the end', async () => {
      const result = await evaluateLine(TEST_LINES.withPunctuation[0], [], 'cat');
      expect(result).toBe('perfect');
    }, 10000);

    test('handles multiple spaces between words', async () => {
      const result = await evaluateLine('I   have   a   cool   bat', [], 'cat');
      expect(result).not.toBe('short');
    });

    test('handles lines with punctuation in the middle', async () => {
      const result = await evaluateLine(TEST_LINES.withPunctuation[1], [], 'cat');
      expect(result).not.toBe('short');
    });

    test('handles empty allLines array', async () => {
      const result = await evaluateLine(TEST_LINES.perfect[0], [], 'cat');
      expect(result).toBe('perfect');
    }, 10000);

    test('handles target word with capital letters', async () => {
      const result = await evaluateLine(TEST_LINES.perfect[0], [], SPECIAL_CASES.edgeCases.allCaps);
      expect(result).toBe('perfect');
    }, 10000);

    test('handles mixed case in the line', async () => {
      const result = await evaluateLine('I have a cool BAT', [], 'cat');
      expect(result).toBe('perfect');
    }, 10000);
  });

  describe('Complex stress patterns', () => {
    test('correctly identifies rhyme with multiple stressed syllables', async () => {
      const result = await evaluateLine('I truly do command', [], 'land');
      expect(result).toBe('perfect');
    }, 10000);

    test('handles words with no stress markers', async () => {
      const result = await evaluateLine('I want to go to', [], 'do');
      expect(result).not.toBe('short');
    });
  });

  describe('Integration scenarios - Real rap bars', () => {
    test.each(RAP_SCENARIOS)(
      '$name',
      async ({ lines, newLine, targetWord, expectedResult }) => {
        const result = await evaluateLine(newLine, lines, targetWord);
        
        if (result !== expectedResult) {
          // Extract the last word from newLine
          const words = newLine.trim().split(' ');
          const lastWord = words[words.length - 1].toLowerCase();
          
          const lastWordPron = await fetchPronunciation(lastWord);
          const targetPron = await fetchPronunciation(targetWord);
          console.log(`\n❌ Integration test failed: "${newLine}" vs "${targetWord}"`);
          console.log(`   Last word "${lastWord}" pronunciation: ${lastWordPron || 'undefined'}`);
          console.log(`   Target word "${targetWord}" pronunciation: ${targetPron || 'undefined'}`);
          console.log(`   Expected: ${expectedResult}, Got: ${result}\n`);
        }
        
        expect(result).toBe(expectedResult);
      },
      10000 // Increase timeout for API calls
    );
  });

  describe('Test data validation', () => {
    test('PERFECT_RHYMES contains valid data', () => {
      expect(PERFECT_RHYMES.length).toBeGreaterThan(0);
      PERFECT_RHYMES.forEach(group => {
        expect(Array.isArray(group)).toBe(true);
        expect(group.length).toBeGreaterThan(1);
        group.forEach(word => {
          expect(typeof word).toBe('string');
          expect(word.length).toBeGreaterThan(0);
        });
      });
    });

    test('NEAR_RHYMES contains valid data', () => {
      expect(NEAR_RHYMES.length).toBeGreaterThan(0);
      NEAR_RHYMES.forEach(group => {
        expect(Array.isArray(group)).toBe(true);
        expect(group.length).toBeGreaterThan(1);
        group.forEach(word => {
          expect(typeof word).toBe('string');
          expect(word.length).toBeGreaterThan(0);
        });
      });
    });

    test('NON_RHYMES contains valid data', () => {
      expect(NON_RHYMES.length).toBeGreaterThan(0);
      NON_RHYMES.forEach(group => {
        expect(Array.isArray(group)).toBe(true);
        expect(group.length).toBeGreaterThan(1);
        group.forEach(word => {
          expect(typeof word).toBe('string');
          expect(word.length).toBeGreaterThan(0);
        });
      });
    });

    test('Can fetch pronunciations for common words', async () => {
      const catPron = await fetchPronunciation('cat');
      const batPron = await fetchPronunciation('bat');
      
      expect(catPron).toBeTruthy();
      expect(batPron).toBeTruthy();
      expect(typeof catPron).toBe('string');
      expect(typeof batPron).toBe('string');
    }, 10000);

    test('Helper functions work correctly', () => {
      const perfectPairs = getPerfectRhymePairs();
      const nearPairs = getNearRhymePairs();
      const nonPairs = getNonRhymePairs();
      
      expect(perfectPairs.length).toBeGreaterThan(0);
      expect(nearPairs.length).toBeGreaterThan(0);
      expect(nonPairs.length).toBeGreaterThan(0);
      
      // Check that all pairs are tuples
      perfectPairs.forEach(([word1, word2]) => {
        expect(typeof word1).toBe('string');
        expect(typeof word2).toBe('string');
      });
    });
  });
});
