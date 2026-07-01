# Rhyme Algorithm Test Suite

This document describes the test suite for the `evaluateLine` rhyme evaluation algorithm.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite includes **39 comprehensive tests** covering:

### 1. Basic Validation (6 tests)
- Empty lines
- Lines with only special characters
- Lines with no words
- Short lines (< 4 words)
- Minimum word count validation

### 2. Number Sanitization (2 tests)
- Converts numbers to words (e.g., "1" → "one")
- Handles multiple numbers in a line

### 3. Repeated Words Detection (5 tests)
- Detects when the same word is used at the end of multiple lines
- Case-insensitive detection
- Ignores short lines (< 4 words) in repetition checking
- Handles special characters when checking for repeats

### 4. Perfect Rhyme Detection (3 tests)
- Perfect rhymes (e.g., "cat" and "bat")
- Multi-syllable perfect rhymes
- Words with same stressed syllable endings

### 5. Near Rhyme Detection (3 tests)
- Assonance (matching vowel sounds, different consonants)
- Multi-syllable near rhymes
- Partial phoneme matching

### 6. Bad Rhyme Detection (4 tests)
- Non-rhyming words
- Unknown word pronunciation (API returns undefined)
- Missing target word pronunciation
- Both pronunciations missing

### 7. Error Handling (2 tests)
- API errors
- Network timeouts

### 8. Edge Cases (9 tests)
- Trailing/leading spaces
- Special characters at line endings
- Multiple spaces between words
- Punctuation in the middle of lines
- Empty previous lines array
- Mixed case handling (uppercase/lowercase)

### 9. Complex Stress Patterns (2 tests)
- Multiple stressed syllables
- Words without stress markers

### 10. Integration Scenarios (4 tests)
- Real rap bar scenarios with perfect rhymes
- Real rap bar scenarios with near rhymes
- Real rap bar scenarios with bad rhymes
- Real rap bar scenarios with repeated words

## How Rhyming Works

The algorithm uses phoneme-based rhyme detection:

1. **Perfect Rhyme**: The phonemes from the last stressed syllable to the end match exactly
   - Example: "cat" (K AE1 T) and "bat" (B AE1 T) both end with " AE1 T"

2. **Near Rhyme**: Only the vowel phonemes match from the last stressed syllable
   - Example: "cat" (K AE1 T) and "cap" (K AE1 P) have matching vowel "AE1"

3. **Repeated Word**: The exact same word was used at the end of a previous line (4+ words)

4. **Short Line**: Line contains fewer than 4 words

5. **Bad Rhyme**: None of the above conditions are met

## Mock Data Structure

The tests mock the `getPronunciation` function which normally calls the Datamuse API. Phoneme format:

```
- Consonants: B, K, D, F, G, etc.
- Vowels with stress: AE1 (primary stress), AE0 (no stress), AE2 (secondary stress)
- Example: "understand" = "AH0 N D ER1 S T AE2 N D"
```

## Adding New Tests

When adding new tests:

1. Always mock `getPronunciation` responses using `mockGetPronunciation.mockResolvedValueOnce()`
2. Use realistic phoneme patterns from the Datamuse API
3. Clear mocks in `beforeEach()` to avoid test interference
4. Test both happy and error paths

Example:
```typescript
test('my new test case', async () => {
  mockGetPronunciation
    .mockResolvedValueOnce('B AE1 T')   // "bat"
    .mockResolvedValueOnce('K AE1 T');  // "cat"

  const result = await evaluateLine('I have a bat', [], 'cat');
  expect(result).toBe('perfect');
});
```

## Test Results

✅ All 39 tests passing
- Coverage includes all major code paths
- Error handling thoroughly tested
- Edge cases covered
- Integration scenarios validated

