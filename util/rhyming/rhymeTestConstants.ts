// ============================================================================
// PERFECT RHYMES - Should match from last stressed syllable to end
// ============================================================================

export const PERFECT_RHYMES = [
  // Cat family
  ['cat', 'bat', 'hat', 'rat', 'mat'],
  
  // Go family  
  ['go', 'flow', 'show', 'know', 'glow'],
  
  // Time family
  ['time', 'rhyme', 'crime', 'dime'],
  
  // Beat family
  ['beat', 'street', 'heat', 'meet', 'seat'],
  
  // Day family
  ['day', 'say', 'way', 'play'],
  
  // Night family
  ['night', 'fight', 'light', 'right'],
  
  // Free family
  ['free', 'be', 'see', 'tree'],
  
  // Create family
  ['create', 'deflate'],
  
  // Running family
  ['running', 'gunning', 'stunning'],
  
  // Land family
  ['land', 'command'],

  // Saw family
  ['saw', 'law', 'jaw', 'raw'],
];

// ============================================================================
// NEAR RHYMES - Only vowel sounds should match (assonance)
// ============================================================================

export const NEAR_RHYMES = [
  // EY vowel family
  ['make', 'late', 'came'],
  
  // AE vowel family
  ['cap', 'bat', 'fast', 'lass'],
  
  // IH vowel family
  ['kick', 'bit'],
  
  // OW vowel family
  ['home', 'cone', 'boat', 'hope'],
  
  // AY vowel family
  ['light', 'mind'],
  
  // IY vowel family
  ['seed', 'sleep'],

  // Saline vs. daily (needs to work but doesn't currently)
  ['saline', 'daily'],
];

// ============================================================================
// NON-RHYMES - Completely different sounds
// ============================================================================

export const NON_RHYMES = [
  // Completely different families
  ['cat', 'dog', 'tree', 'house', 'car'],
  ['sun', 'book', 'pen', 'water', 'fire'],
  ['love', 'hate', 'happy', 'sad'],
  ['night', 'day', 'word'],
];

// ============================================================================
// SINGLE WORDS - For various test scenarios
// ============================================================================

export const COMMON_WORDS = {
  // Target words for testing
  targets: ['cat', 'go', 'time', 'beat', 'show', 'day', 'land'],
  
  // Numbers (for number conversion tests)
  numbers: ['one', 'five', 'ten'],
  
  // Multi-syllable words
  multiSyllable: ['create', 'deflate', 'command', 'understand'],
  
  // Function words (often no stress markers)
  functionWords: ['to', 'do', 'the', 'a'],
  
  // Words that don't exist in dictionary
  invalid: ['xyzabc123invalidword', 'qwerty', 'asdfgh'],
};

// ============================================================================
// TEST LINES - Full rap bars for integration testing
// ============================================================================

export const TEST_LINES = {
  perfect: [
    'I have a cool bat',
    'Watch me spit this flow',
    'I am feeling the heat',
    'Living life in my prime',
  ],
  near: [
    'I am running late',
    'Let me spit a bit',
    'I am going too fast',
  ],
  bad: [
    'I have a cool dog',
    'Let me say the word',
    'I am feeling great',
  ],
  short: [
    'cat hat mat',
    'one two three',
    'my bat',
  ],
  repeated: [
    'I am wearing my cool hat',
    'I have a cool bat',
    'I like to wear that jacket',
  ],
  withNumbers: [
    'I have exactly 1',
    'I have 2 plus 3 equals 5',
  ],
  withPunctuation: [
    'I have a cool bat!!!',
    'I have, you know, a bat',
    '   I have a cool bat   ',
  ],
};

// ============================================================================
// CONTEXT LINES - For testing repeated word detection
// ============================================================================

export const CONTEXT_LINES = {
  withRepeatedHat: [
    'I am wearing my cool hat',
    'I like to wear that jacket',
  ],
  withRepeatedBat: [
    'I have a cool bat',
  ],
  withShortLines: [
    'my bat', // Only 2 words, should be ignored in repeat detection
  ],
  rapScenarioPerfect: [
    'I am starting to go',
    'I am feeling the glow',
  ],
  rapScenarioNear: [
    'I am about to kick',
    'This beat is so sick',
  ],
  rapScenarioBad: [
    'I have a cool cat',
    'Sitting on the mat',
  ],
  rapScenarioRepeated: [
    'I am feeling the flow',
    'Watch me steal the show',
    'I am ready to go',
  ],
};

// ============================================================================
// SPECIAL TEST CASES
// ============================================================================

export const SPECIAL_CASES = {
  // Word that doesn't exist in dictionary
  undefinedWord: 'xyzabc123invalidword',
  
  // Words for edge case testing
  edgeCases: {
    allCaps: 'CAT',
    mixedCase: 'BaT',
    withSpaces: '   bat   ',
    withPunctuation: 'bat!!!',
  },
};

// ============================================================================
// RAP INTEGRATION SCENARIOS
// ============================================================================

export const RAP_SCENARIOS = [
  {
    name: 'Perfect rhyme scenario',
    lines: ['I am starting to go', 'I am feeling the glow'],
    newLine: 'Watch me spit this flow',
    targetWord: 'go',
    expectedResult: 'perfect' as const,
  },
  {
    name: 'Near rhyme scenario',
    lines: ['I am about to kick', 'This beat is so sick'],
    newLine: 'Let me spit a bit',
    targetWord: 'kick',
    expectedResult: 'near' as const,
  },
  {
    name: 'Bad rhyme scenario',
    lines: ['I have a cool cat', 'Sitting on the mat'],
    newLine: 'Let me say the word',
    targetWord: 'cat',
    expectedResult: 'bad' as const,
  },
  {
    name: 'Repeated word scenario',
    lines: ['I am feeling the flow', 'Watch me steal the show', 'I am ready to go'],
    newLine: 'Here we go with the flow',
    targetWord: 'show',
    expectedResult: 'repeated' as const,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all words from perfect rhyme groups
 */
export function getAllPerfectRhymeWords(): string[] {
  return PERFECT_RHYMES.flat();
}

/**
 * Get all words from near rhyme groups
 */
export function getAllNearRhymeWords(): string[] {
  return NEAR_RHYMES.flat();
}

/**
 * Get all words from non-rhyme groups
 */
export function getAllNonRhymeWords(): string[] {
  return NON_RHYMES.flat();
}

/**
 * Generate all possible pairs from a rhyme group
 */
export function generatePairsFromGroup(group: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      pairs.push([group[i], group[j]]);
    }
  }
  return pairs;
}

/**
 * Generate all perfect rhyme pairs
 */
export function getPerfectRhymePairs(): [string, string][] {
  return PERFECT_RHYMES.flatMap(group => generatePairsFromGroup(group));
}

/**
 * Generate all near rhyme pairs
 */
export function getNearRhymePairs(): [string, string][] {
  return NEAR_RHYMES.flatMap(group => generatePairsFromGroup(group));
}

/**
 * Generate all non-rhyme pairs
 */
export function getNonRhymePairs(): [string, string][] {
  return NON_RHYMES.flatMap(group => generatePairsFromGroup(group));
}