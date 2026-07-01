import { NextRequest, NextResponse } from 'next/server';
import { getRhymeData } from '@/util/rhymes';
import { arraysEqual } from '@/util';

type WordPosition = {
  lineIndex: number;
  wordIndex: number;
  word: string;
  pronunciation?: string;
};

type RhymeGroup = {
  id: number;
  words: WordPosition[];
  rhymeType: 'perfect' | 'near';
};

async function checkRhyme(
  wordPronunciation: string | undefined,
  otherPronunciation: string | undefined
): Promise<'perfect' | 'near' | 'none'> {
  if (!wordPronunciation || !otherPronunciation) {
    return 'none';
  }

  // Extract phonemes from last stressed syllable for both words
  const phonemes1 = wordPronunciation.substring(
    wordPronunciation.lastIndexOf(' ', wordPronunciation.lastIndexOf('1'))
  );
  const phonemes2 = otherPronunciation.substring(
    otherPronunciation.lastIndexOf(' ', otherPronunciation.lastIndexOf('1'))
  );

  // Check for perfect rhyme (ends match)
  if (wordPronunciation.endsWith(phonemes2) || otherPronunciation.endsWith(phonemes1)) {
    return 'perfect';
  }

  // Check for near rhyme (vowel sounds match)
  const vowelPhonemes1 = phonemes1.split(' ').filter((phoneme: string) =>
    phoneme.includes('1') || phoneme.includes('0') || phoneme.includes('2')
  );
  const vowelPhonemes2 = phonemes2.split(' ').filter((phoneme: string) =>
    phoneme.includes('1') || phoneme.includes('0') || phoneme.includes('2')
  );

  if (arraysEqual(vowelPhonemes1, vowelPhonemes2)) {
    return 'near';
  }

  return 'none';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lines } = body;

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: lines (array)' },
        { status: 400 }
      );
    }

    // Use a dummy target word for getRhymeData (we won't use it for comparison)
    const dummyTarget = lines[0].split(' ').filter((w: string) => w.trim()).pop() || 'word';
    const rhymeData = await getRhymeData(lines, dummyTarget);

    // Collect all words with their positions
    const allWords: WordPosition[] = [];
    rhymeData.mappedLines.forEach((mappedLine, lineIndex) => {
      mappedLine.forEach((wordData, wordIndex) => {
        if (wordData.pronunciation) {
          allWords.push({
            lineIndex,
            wordIndex,
            word: wordData.value,
            pronunciation: wordData.pronunciation
          });
        }
      });
    });

    // Find all rhyming pairs and group them
    const rhymeGroups: RhymeGroup[] = [];
    const wordToGroupId = new Map<string, number>();
    let nextGroupId = 0;

    // Compare each word with every other word
    for (let i = 0; i < allWords.length; i++) {
      const word1 = allWords[i];
      if (!word1.pronunciation) continue;

      for (let j = i + 1; j < allWords.length; j++) {
        const word2 = allWords[j];
        if (!word2.pronunciation) continue;

        const rhymeType = await checkRhyme(word1.pronunciation, word2.pronunciation);
        
        if (rhymeType !== 'none') {
          const key1 = `${word1.lineIndex}-${word1.wordIndex}`;
          const key2 = `${word2.lineIndex}-${word2.wordIndex}`;
          
          const groupId1 = wordToGroupId.get(key1);
          const groupId2 = wordToGroupId.get(key2);

          if (groupId1 !== undefined && groupId2 !== undefined) {
            // Both already in groups - merge if different
            if (groupId1 !== groupId2) {
              const group1 = rhymeGroups.find(g => g.id === groupId1);
              const group2 = rhymeGroups.find(g => g.id === groupId2);
              if (group1 && group2) {
                // Merge group2 into group1
                group1.words.push(...group2.words);
                group2.words.forEach(w => {
                  wordToGroupId.set(`${w.lineIndex}-${w.wordIndex}`, groupId1);
                });
                const group2Index = rhymeGroups.findIndex(g => g.id === groupId2);
                if (group2Index !== -1) {
                  rhymeGroups.splice(group2Index, 1);
                }
              }
            }
          } else if (groupId1 !== undefined) {
            // word1 in group, add word2
            const group = rhymeGroups.find(g => g.id === groupId1);
            if (group) {
              group.words.push(word2);
              wordToGroupId.set(key2, groupId1);
            }
          } else if (groupId2 !== undefined) {
            // word2 in group, add word1
            const group = rhymeGroups.find(g => g.id === groupId2);
            if (group) {
              group.words.push(word1);
              wordToGroupId.set(key1, groupId2);
            }
          } else {
            // Create new group
            const newGroup: RhymeGroup = {
              id: nextGroupId++,
              words: [word1, word2],
              rhymeType
            };
            rhymeGroups.push(newGroup);
            wordToGroupId.set(key1, newGroup.id);
            wordToGroupId.set(key2, newGroup.id);
          }
        }
      }
    }

    // Build response with word rhyme info
    const evaluatedLines = rhymeData.mappedLines.map((mappedLine, lineIndex) => {
      const words = mappedLine.map((wordData, wordIndex) => {
        const key = `${lineIndex}-${wordIndex}`;
        const groupId = wordToGroupId.get(key);
        const group = groupId !== undefined ? rhymeGroups.find(g => g.id === groupId) : undefined;

        return {
          word: wordData.value,
          isRhyme: group !== undefined,
          rhymeType: group?.rhymeType || 'none' as 'perfect' | 'near' | 'none',
          rhymeGroupId: groupId ?? null,
          pronunciation: wordData.pronunciation
        };
      });

      return {
        line: lines[lineIndex],
        words
      };
    });

    return NextResponse.json({
      lineInfos: evaluatedLines,
      rhymeGroups: rhymeGroups.map(g => ({
        id: g.id,
        wordCount: g.words.length,
        rhymeType: g.rhymeType
      }))
    });
  } catch (error) {
    console.error('Error evaluating rhymes:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate rhymes' },
      { status: 500 }
    );
  }
}
