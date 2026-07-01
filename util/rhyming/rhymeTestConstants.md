# Rhyme Test Constants Documentation

This file contains all the test data for the rhyme evaluation algorithm. All pronunciations use the ARPAbet phoneme notation from the Datamuse API.

## 📁 File Structure

```
util/rhyming/
├── evaluateRhyme.ts              # Main rhyme evaluation algorithm
├── evaluateRhyme.test.ts         # Test suite (references constants)
├── rhymeTestConstants.ts         # This constants file
└── rhymeTestConstants.md         # This documentation
```

## 🔤 Phoneme Notation Guide

ARPAbet phoneme format used by Datamuse API:

### Vowels with Stress Markers
- `1` = primary stress (e.g., `AE1` in "cat")
- `0` = no stress (e.g., `AE0` in "about")
- `2` = secondary stress (e.g., `AE2` in "understand")

### Common Vowel Sounds
- `AE` = "cat", "bat" 
- `EY` = "say", "day"
- `IY` = "beat", "street"
- `OW` = "go", "flow"
- `AY` = "time", "rhyme"
- `IH` = "bit", "kick"
- `AO` = "dog", "log"

### Consonants
- Standard letters: `B`, `K`, `D`, `F`, `G`, etc.
- Special: `SH` (ship), `HH` (hat), `NG` (running)

### Example
```typescript
"understand" = "AH0 N D ER1 S T AE2 N D"
//              │   │ │  │   │ │  │   │
//              │   │ │  │   │ │  │   └─ D (final consonant)
//              │   │ │  │   │ │  └───── AE2 (secondary stress)
//              │   │ │  │   │ └──────── T
//              │   │ │  │   └─────────── S
//              │   │ │  └─────────────── ER1 (primary stress)
//              │   │ └────────────────── D
//              │   └─────────────────── N
//              └───────────────────────── AH0 (unstressed)
```

## 📊 Data Structures

### `PERFECT_RHYME_PAIRS` (12 pairs)

Perfect rhymes match from the last stressed syllable to the end.

**Example:**
```typescript
{
  word1: { word: 'cat', pronunciation: 'K AE1 T' },
  word2: { word: 'bat', pronunciation: 'B AE1 T' },
  description: 'Simple one-syllable perfect rhyme'
}
```

Both words end with ` AE1 T` (from the last stressed syllable).

**Current perfect rhyme pairs:**
- cat/bat, cat/hat
- go/flow, go/show
- create/deflate
- running/gunning
- land/command
- day/say, night/fight
- free/be, time/rhyme
- street/beat

### `NEAR_RHYME_PAIRS` (8 pairs)

Near rhymes (assonance) match only the vowel sounds from the last stressed syllable.

**Example:**
```typescript
{
  word1: { word: 'make', pronunciation: 'M EY1 K' },
  word2: { word: 'late', pronunciation: 'L EY1 T' },
  description: 'Same vowel (EY1) but different ending consonants'
}
```

Both have `EY1` vowel, but different consonants (K vs T).

**Current near rhyme pairs:**
- make/late (EY1)
- cap/bat (AE1)
- kick/bit (IH1)
- lass/fast (AE1)
- home/cone (OW1)
- light/mind (AY1)
- seed/sleep (IY1)
- boat/hope (OW1)

### `NON_RHYME_PAIRS` (7 pairs)

Completely different phonetic sounds.

**Example:**
```typescript
{
  word1: { word: 'cat', pronunciation: 'K AE1 T' },
  word2: { word: 'dog', pronunciation: 'D AO1 G' },
  description: 'Completely different vowels and consonants'
}
```

**Current non-rhyme pairs:**
- cat/dog, cat/word
- tree/dog
- house/car
- sun/tree
- book/pen
- water/fire

### `TEST_WORDS` (30+ words)

Individual words for building test scenarios.

**Categories:**
- **Common rhymes:** cat, bat, hat, rat, mat
- **OW sounds:** go, flow, show, know
- **Dog family:** dog, log, fog
- **Day family:** day, say, way, play
- **Time family:** time, rhyme, crime
- **Beat family:** beat, street, heat
- **Near rhyme words:** bit, kick, word
- **Numbers:** one, five
- **Multi-syllable:** create, deflate, command, land
- **Function words:** to, do

### `TEST_LINES`

Pre-built test lines for various scenarios:
- `perfect` - Lines ending with perfect rhymes
- `near` - Lines ending with near rhymes
- `bad` - Lines with no rhymes
- `short` - Lines with < 4 words
- `repeated` - Lines with repeated end words
- `withNumbers` - Lines containing numbers
- `withPunctuation` - Lines with special characters

### `CONTEXT_LINES`

Previous lines for testing repeated word detection and rap scenarios.

## ✏️ How to Add New Test Cases

### Adding a Perfect Rhyme Pair

1. Find the pronunciation using [Datamuse API](https://api.datamuse.com/words?sp=YOUR_WORD&qe=sp&md=r&max=1)
2. Verify the phonemes from last stressed syllable match
3. Add to `PERFECT_RHYME_PAIRS`:

```typescript
{
  word1: { word: 'your_word1', pronunciation: 'Y UH1 R W ER1 D' },
  word2: { word: 'your_word2', pronunciation: 'Y UH1 R W ER1 D' },
  description: 'Your description here'
}
```

### Adding a Near Rhyme Pair

1. Find words with matching vowels but different consonants
2. Verify only vowel phonemes match from last stressed syllable
3. Add to `NEAR_RHYME_PAIRS`

### Adding Individual Words

Add to `TEST_WORDS` for reusability:

```typescript
yourword: { word: 'yourword', pronunciation: 'Y UH1 R W ER1 D' },
```

### Adding Context Lines

Add to `CONTEXT_LINES` for testing specific scenarios:

```typescript
yourScenario: [
  'First line with four words',
  'Second line also here',
],
```

## 🧪 Test File Integration

The test file automatically uses these constants:

```typescript
// Perfect rhymes - automatically tests all pairs
test.each(PERFECT_RHYME_PAIRS.map(pair => ({...})))

// Near rhymes - automatically tests all pairs
test.each(NEAR_RHYME_PAIRS.map(pair => ({...})))

// Non-rhymes - automatically tests all pairs
test.each(NON_RHYME_PAIRS.map(pair => ({...})))
```

**Benefits:**
- ✅ Add a pair to the constants → Test automatically runs
- ✅ Modify pronunciations → All tests update
- ✅ Centralized data management
- ✅ Easy to maintain and extend

## 🎯 Best Practices

1. **Always verify pronunciations** using the Datamuse API before adding
2. **Add descriptions** to explain what each pair tests
3. **Group related words** in TEST_WORDS for organization
4. **Test edge cases** like multi-syllable words, stress patterns
5. **Keep pairs simple** - one phonetic concept per pair
6. **Document unusual cases** in the description field

## 🔍 Finding Pronunciations

Use the Datamuse API to get ARPAbet pronunciations:

```bash
# Get pronunciation for "cat"
curl "https://api.datamuse.com/words?sp=cat&qe=sp&md=r&max=1"

# Response includes: "tags": ["pron:K AE1 T"]
```

Or use the interactive tool: https://www.datamuse.com/api/

## 📈 Current Test Coverage

- **Perfect rhyme pairs:** 12 pairs = 12 tests
- **Near rhyme pairs:** 8 pairs = 8 tests  
- **Non-rhyme pairs:** 7 pairs = 7 tests
- **Additional tests:** 35 tests (validation, edge cases, etc.)
- **Total:** 62 tests

## 🚀 Running Tests

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

All tests use the constants file, so you can modify the constants without touching the test file!

