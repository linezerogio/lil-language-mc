# Daily Mode Implementation Spec

Status: draft synced with the accepted architecture; pending user approval before story breakdown.

## Feature Breakdown

### 1. Database Foundations

Add durable storage for Daily Mode:

- `daily_challenges`
- `daily_attempts`
- Optional daily eligibility columns on `words`

This must land before frontend Daily routes because the game should read today's challenge from the database, not generate it dynamically.

### 2. Word Corpus Expansion

Expand `words` to at least 10,000 eligible unique words.

Implementation requirements:

- Import from a larger stable word source than `random-words`.
- Use `wordfreq` as the primary raw source and existing DB words as carryover candidates.
- Normalize words to lowercase alphabetic strings.
- Deduplicate before DB insert.
- Enrich locally with CMU pronunciation data and rhyme score.
- Track pronunciation, stress marker presence, perfect/strong rhyme key, strong-rhyme cell size, perfect/strong rhyme count, near rhyme count, total usable rhyme count, and daily exclusion reason.
- Exclude slurs/offensive words, explicit sexual words, proper nouns/brands, function words, words under 3 characters, words over 12 characters, and words with punctuation, spaces, numbers, contractions, or hyphens.
- Exclude NLP-detected proper names, places, organizations, demonyms, and calendar words from Daily eligibility.
- Mark candidates eligible only when they have pronunciation data with a usable stress marker, at least 2 strong/perfect rhymes, and at least 5 total usable rhymes.
- Easy and medium schedule pools require at least 3 strong/perfect rhymes.
- Schedule selection must use at most 20 words from any one strong/perfect rhyme cell.
- Sample review 100 words per difficulty bucket and generate risk-review audit artifacts.
- Confirm at least 10,000 eligible rows before schedule generation, with enough words for 3,334 easy, 3,333 medium, and 3,333 hard.

### 3. Daily Schedule Generation

Generate 10,000 `daily_challenges` rows starting on June 30, 2026.

Implementation requirements:

- Use `DAILY_START_DATE=2026-06-30`.
- Use `America/New_York` date boundaries.
- Assign exactly one unique eligible word per date.
- Use at most 20 words from any one strong/perfect rhyme cell.
- Use an even-as-possible difficulty distribution: 3,334 easy, 3,333 medium, and 3,333 hard.
- Store the derived difficulty at generation time.
- Enforce `UNIQUE(challenge_date)` and `UNIQUE(word_id)`.
- Fail loudly if there are fewer than 10,000 eligible words.

### 4. Daily Server API

Add server helpers and API routes for:

- Reading today's daily challenge.
- Reading per-mode attempt status for an anonymous player id.
- Saving a Daily submission and attempt transactionally.
- Returning Daily context for an existing submission.

### 5. Anonymous Player Identity

Add a tiny client helper for Daily Mode only:

- Read `llmc_daily_player_id` from `localStorage`.
- Generate and store one if missing.
- Send it with Daily status and submission requests.

This identity is best-effort and intentionally not secure.

### 6. Daily Routes And UI

Add Daily Mode surfaces:

- `/daily`
- `/daily/freestyle`
- `/daily/endless`

The Daily landing shows today's challenge metadata and entry status for Daily 4-Bar and Daily Endless. It should not reveal the daily word until the countdown starts in the selected Daily mode. Completed mode entries show a completed state first with a link to the linked submission.

### 7. Game Form Integration

Reuse existing `FreestyleForm` and `EndlessForm` behavior where practical.

The preferred change is to make submission behavior injectable:

- Normal routes keep current submission behavior.
- Daily routes pass Daily metadata and use the Daily save endpoint.
- Forms should not trust client-provided daily word or difficulty when saving.

### 8. Shared Submission Page

Extend `/submissions/[id]` to display Daily metadata when the submission belongs to a Daily attempt.

The page remains the share URL.

## Data Contracts

### `DailyChallenge`

```ts
type DailyDifficulty = 'easy' | 'medium' | 'hard' | 'zbra-easy' | 'zbra-hard';

type DailyChallenge = {
  id: number;
  challengeDate: string; // YYYY-MM-DD in America/New_York
  challengeNumber: number; // daily_challenges.id
  wordId: number;
  word: string;
  difficulty: DailyDifficulty;
};
```

`challengeNumber` is `daily_challenges.id`. The schedule should be generated once in chronological order and treated as immutable so ids remain stable.

### `DailyMode`

```ts
type DailyMode = '4-Bar Mode' | 'Endless Mode';
```

Daily Mode v1 does not include Rapid Fire.

### `DailyAttemptStatus`

```ts
type DailyAttemptStatus = {
  challengeId: number;
  playerId: string;
  modes: {
    freestyle: {
      completed: boolean;
      submissionId?: number;
    };
    endless: {
      completed: boolean;
      submissionId?: number;
    };
  };
};
```

### `DailyOverviewResponse`

```ts
type DailyOverviewResponse = {
  challenge: DailyChallenge;
  attemptStatus?: DailyAttemptStatus;
};
```

### `SaveDailySubmissionRequest`

```ts
type SaveDailySubmissionRequest = {
  playerId: string;
  mode: DailyMode;
  lines: string[];
  score: number;
};
```

The server must derive `keyword`, `difficulty`, and `daily_challenge_id` from today's stored challenge.

### `SaveDailySubmissionResponse`

```ts
type SaveDailySubmissionResponse =
  | {
      ok: true;
      submissionId: number;
    }
  | {
      ok: false;
      error: 'already_played';
      submissionId?: number;
    }
  | {
      ok: false;
      error: 'missing_challenge' | 'invalid_mode' | 'invalid_payload' | 'save_failed';
    };
```

### `SubmissionResponse` With Daily Context

```ts
type SubmissionResponse = {
  id: number;
  lines: string[];
  score: number;
  played_on: string;
  keyword: string;
  mode: '4-Bar Mode' | 'Rapid Fire Mode' | 'Endless Mode';
  difficulty: DailyDifficulty;
  daily?: {
    challengeDate: string;
    challengeNumber: number;
    dailyMode: DailyMode;
  };
};
```

## Component And Module Breakdown

### New Files

- `app/daily/page.tsx`
  - Daily landing.
- `app/daily/freestyle/page.tsx`
  - Daily 4-Bar route.
- `app/daily/endless/page.tsx`
  - Daily Endless route.
- `app/api/daily/route.ts`
  - Read today's challenge and status.
- `app/api/daily/submissions/route.ts`
  - Save Daily submission.
- `util/daily.ts`
  - Timezone/date helpers and client-safe constants.
- `util/dailyIdentity.ts`
  - Client helper for anonymous Daily player id.
- `scripts/import-daily-words.*`
  - Corpus import/enrichment script.
- `scripts/generate-daily-challenges.*`
  - Schedule generation script.
- `database/migrations/*daily*.sql`
  - Daily schema migration.

### Existing Files Likely Touched

- `app/server.tsx`
  - Add daily server helpers or delegate to a new daily server module.
- `app/api/submissions/[id]/route.ts`
  - Include Daily context in submission response.
- `app/submissions/[id]/page.tsx`
  - Render Daily metadata.
- `components/FreestyleForm.tsx`
  - Accept optional Daily submit behavior.
- `components/EndlessForm.tsx`
  - Accept optional Daily submit behavior.
- `components/StartSection.tsx`
  - Add Daily entry point.
- `types/mode.ts`
  - Keep canonical app modes; add a separate Daily mode type only if useful.

## User Flows

### Daily Landing Flow

1. Client gets or creates anonymous Daily player id.
2. Client requests today's Daily overview.
3. Server computes today's New York date.
4. Server returns daily challenge and per-mode completion status.
5. UI shows Daily 4-Bar and Daily Endless options.
6. Completed options show a completed state first, with a link to the saved submission.

### Daily 4-Bar Flow

1. Player opens `/daily/freestyle`.
2. Server loads today's challenge.
3. Client form uses today's word and difficulty.
4. Player completes the normal 4-Bar experience.
5. Client posts lines, score, mode, and player id to Daily submission endpoint.
6. Server creates normal submission and linked daily attempt.
7. Client routes to `/submissions/[id]`.

### Daily Endless Flow

Same as Daily 4-Bar, except mode is `Endless Mode` and the existing Endless timer/rhyme behavior is used.

### Duplicate Attempt Flow

1. Player opens a Daily mode already completed for the day.
2. App detects completion from attempt status.
3. App shows the existing submission link instead of starting another counted run.
4. If a duplicate POST still occurs, server returns `already_played`.

### Shared Submission Flow

1. A recipient opens `/submissions/[id]`.
2. Server returns normal submission data and optional Daily metadata.
3. Page renders the freestyle and Daily context.

## API Contracts And Server Actions

### `GET /api/daily?playerId=...`

Returns:

```ts
DailyOverviewResponse
```

If `playerId` is omitted, return only the challenge.

### `POST /api/daily/submissions`

Accepts:

```ts
SaveDailySubmissionRequest
```

Returns:

```ts
SaveDailySubmissionResponse
```

Server-side behavior:

- Validate `playerId` is present and reasonably sized.
- Validate mode is `4-Bar Mode` or `Endless Mode`.
- Validate lines are a non-empty string array.
- Validate score is a finite number.
- Fetch today's daily challenge by New York date.
- Insert into `submissions`.
- Insert into `daily_attempts`.
- Return `already_played` if unique constraint fails for the same player/mode/challenge.

### `GET /api/submissions/[id]`

Extend response with optional `daily`.

Existing consumers should continue working if `daily` is absent.

## State Transitions

### Daily Landing

- `loading`
- `ready_unplayed`
- `ready_partial_complete`
- `ready_complete`
- `missing_challenge`
- `error`

### Daily Play

- `loading_challenge`
- `intro`
- `rapping`
- `submitting`
- `duplicate_attempt`
- `saved`
- `save_error`

### Submission Page

- `loading`
- `loaded_normal`
- `loaded_daily`
- `not_found`
- `error`

## Error States

- No daily challenge exists for today's New York date.
- Daily schedule has not been generated.
- Player id is unavailable because local storage fails.
- Duplicate attempt for the same daily mode.
- Submission save succeeds but daily attempt insert fails.
- Local pronunciation/rhyme metadata is missing or cannot score a daily word.
- Daily word is missing pronunciation metadata.

## Empty States

- Daily landing before schedule generation:
  - Show a short unavailable state rather than a broken game start.
- Completed Daily mode:
  - Show the linked submission instead of an empty play button.
- No Daily metadata on submission:
  - Render normal submission page.

## Loading States

- Daily landing should show a compact loading state while fetching challenge/status.
- Daily play routes should avoid rendering the form until today's challenge is loaded.
- Submission page should preserve existing loading behavior and add no extra blocking state unless Daily context is still loading.

## Validation Rules

### Daily Word Eligibility

- Candidate source is `wordfreq` plus existing DB carryover candidates.
- Candidate word must normalize to one lowercase alphabetic token.
- Word length must be between 3 and 12 characters.
- Candidate must not be a function word, proper noun/brand, slur/offensive word, explicit sexual word, or contain punctuation, spaces, numbers, contractions, or hyphens.
- Candidate must have pronunciation data with a usable stress marker.
- Candidate must have at least 2 strong/perfect rhymes and at least 5 total usable rhymes.
- Easy and medium candidates must have at least 3 strong/perfect rhymes.
- Candidate scoring and schedule selection must cap each strong/perfect rhyme cell at 20 words.
- Candidate must not be flagged as an NLP-detected proper name, place, organization, demonym, or calendar word.
- Candidate must pass sample review for its bucket before schedule generation.

### Daily Challenge Generation

- Exactly 10,000 rows must be generated.
- No duplicate `challenge_date`.
- No duplicate `word_id`.
- Every scheduled word must be eligible.
- Every scheduled easy or medium word must have at least 3 strong/perfect rhymes.
- No scheduled strong/perfect rhyme cell may contain more than 20 words.
- Every scheduled challenge must have stored difficulty.
- Schedule distribution must be 3,334 easy, 3,333 medium, and 3,333 hard.
- Past and current challenge rows must not be changed by future regeneration scripts.

### Daily Submission

- `playerId` required.
- `mode` must be one of Daily v1 modes.
- `lines` must be a non-empty array of strings.
- `score` must be finite.
- `keyword` and `difficulty` must be ignored if sent by the client.
- Server must use today's stored Daily challenge.

### Submission Display

- Daily metadata is optional.
- Missing Daily metadata must not break old submission pages.

## Testing Approach

### Unit Tests

- New York date helper around midnight and DST boundaries.
- Difficulty derivation from word percentile bucket.
- Anonymous player id helper.
- Daily API validation helpers.

### Database Tests Or Script Checks

- `daily_challenges` rejects duplicate dates.
- `daily_challenges` rejects duplicate words.
- `daily_attempts` allows one Daily 4-Bar and one Daily Endless for the same player/date.
- `daily_attempts` rejects two Daily 4-Bar attempts for the same player/date.
- Schedule generation stops if eligible words are below 10,000.
- Schedule generation stops if any difficulty bucket cannot satisfy its target count.
- Schedule generation stops if the 20-word strong-rhyme-cell cap leaves fewer than 10,000 usable candidates.
- Corpus eligibility excludes words that fail pronunciation, stress marker, rhyme-count, length, token-shape, or exclusion-list checks.

### Integration Tests

- Daily overview returns today's challenge.
- Daily 4-Bar save creates `submissions` and `daily_attempts`.
- Daily Endless save creates a second attempt for the same player/date.
- Duplicate Daily 4-Bar save returns `already_played`.
- `/submissions/[id]` returns Daily context for Daily submissions and no Daily context for normal submissions.

### Manual Browser QA

- Home entry to Daily landing.
- Daily 4-Bar complete and share.
- Daily Endless complete and share.
- Completed Daily mode shows saved submission.
- Normal 4-Bar and Endless still work.
- `zbra-hard` still resolves to YouTube outside Daily unless explicitly changed.

## Implementation Risks

- 10,000-word corpus quality may be the longest part of the work.
- Local dictionary scoring can disagree with rhyme APIs or human intuition, so sample review remains required.
- Existing form components may need careful extraction to support alternate submit behavior without regressions.
- Anonymous player id can be bypassed, by design.
- Timezone behavior must be server-owned to avoid off-by-one daily challenges.
- Existing score/submission page code has recent changes; edits should be tightly scoped.

## Definition Of Done

- Database has `daily_challenges` and `daily_attempts` with required constraints.
- `words` has at least 10,000 eligible unique daily words.
- 10,000 Daily challenges are generated with no repeated words.
- `/daily` shows today's challenge and per-mode attempt status.
- `/daily/freestyle` plays today's Daily 4-Bar challenge.
- `/daily/endless` plays today's Daily Endless challenge.
- One player/browser can submit one counted Daily 4-Bar and one counted Daily Endless per date.
- Duplicate same-mode Daily attempts are blocked server-side.
- Daily submissions route to `/submissions/[id]`.
- `/submissions/[id]` shows Daily context for Daily attempts and the freestyle lines for sharing.
- `npm run build` passes.
- Focused tests or script checks cover schedule uniqueness and daily attempt constraints.

## Pending Review Before Story Breakdown

- User approval of this implementation spec.
