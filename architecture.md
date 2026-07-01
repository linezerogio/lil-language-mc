# Daily Mode Architecture Spec

## Accepted Architecture Decisions

The following decisions were confirmed before writing this architecture:

- Daily challenge schedule: precompute 10,000 Daily Mode challenges.
- Daily word uniqueness: repeats are unacceptable; every scheduled daily word must be unique.
- Daily reset timezone: `America/New_York`.
- Daily schedule start date: June 30, 2026.
- Daily word reveal: reveal the daily word only after the countdown starts, matching existing mode behavior.
- Completed mode behavior: show a completed state first, with a link to the saved submission.
- Daily difficulty: one difficulty per daily word, shared across supported daily modes.
- Daily difficulty distribution: as even as possible across easy, medium, and hard. For 10,000 challenges, target 3,334 easy, 3,333 medium, and 3,333 hard.
- Supported v1 modes: Daily 4-Bar and Daily Endless only. Rapid Fire is excluded for v1.
- Attempt scope: one counted attempt per mode per daily challenge. A player can do both Daily 4-Bar and Daily Endless on the same date.
- Attempt identity: anonymous browser/device id stored client-side and checked server-side.
- Cheat prevention: best-effort only; this is not a high-stakes competitive system.
- Sharing: use the existing `/submissions/[id]` page and add Daily context when applicable.
- Storage model: add `daily_challenges` and `daily_attempts`; keep normal submissions compatible.
- Challenge number: use `daily_challenges.id` as the public Daily challenge number. `daily_challenges.word_id` remains the foreign key to `words`.
- Candidate source: use `wordfreq` as the primary raw word source, plus existing DB words as carryover candidates.
- Daily word style: mix common and interesting words while avoiding obscure dictionary filler.
- Rhymability floor: require pronunciation data with a usable stress marker, at least 2 strong/perfect rhymes, and at least 5 total usable rhymes.
- Easy and medium daily words require at least 3 strong/perfect rhymes.
- Strong-rhyme hypercell cap: schedule generation can use at most 20 words from the same strong/perfect rhyme cell.
- Daily quality filter: exclude explicit blocklist words, NLP-detected proper names, places, organizations, demonyms, and calendar words from the Daily schedule pool.
- Exclusions: exclude slurs/offensive words, explicit sexual words, proper nouns/brands, function words, words under 3 characters, words over 12 characters, and words with punctuation, spaces, numbers, contractions, or hyphens.
- Review level: sample review 100 words per difficulty bucket plus risk-review audit before schedule generation.
- Stability rule: past and current daily challenges are immutable; future challenges may be regenerated if bad words are found.

## Chosen Tech Stack

- App framework: existing Next.js app router.
- Runtime language: TypeScript.
- Database: existing Postgres/Neon database via the `postgres` package.
- Client state: existing React component state patterns.
- Identity: anonymous browser/device id stored in client storage and sent with Daily attempt requests.
- Word metadata: local CMU pronunciation/rhyme enrichment for corpus expansion.

## System Boundaries

### Existing Game System

Owns:

- Normal 4-Bar Mode and Endless Mode routes.
- Scoring and score breakdown.
- Word lookup by difficulty.
- Submission creation and submission display.

### Daily Challenge System

Owns:

- 10,000-date Daily Mode schedule.
- No-repeat daily word guarantee.
- Lookup of today's challenge by New York date.
- Daily attempt enforcement per anonymous player and mode.
- Linking Daily attempts to normal submissions.
- Daily metadata for shared submission pages.

### Out Of Scope For V1

- Accounts.
- Public leaderboard.
- Strong anti-cheat enforcement.
- Daily archive browsing.
- Rapid Fire Daily.

## App Structure

Recommended routes:

- `/daily`
  - Daily landing/selector for today's challenge.
  - Shows today's availability for Daily 4-Bar and Daily Endless.
- `/daily/freestyle`
  - Daily 4-Bar play route.
  - Uses today's daily word and shared daily difficulty.
- `/daily/endless`
  - Daily Endless play route.
  - Uses today's daily word and shared daily difficulty.
- `/submissions/[id]`
  - Existing shared submission route.
  - Adds Daily context if the submission is linked to a daily attempt.

Recommended server modules:

- `app/daily/server.ts` or `app/server.tsx` additions:
  - `getTodayDailyChallenge()`
  - `getDailyAttemptStatus(playerId, challengeId)`
  - `saveDailyAttempt(...)`
  - `getDailyContextForSubmission(submissionId)`
- Existing `app/server.tsx` can continue to own generic submission helpers.

## Data Model

### `words`

Existing table.

Required for Daily Mode:

- At least 10,000 eligible unique words before schedule generation.
- Daily generation should use only eligible rows.

Recommended future columns:

- `eligible_for_daily BOOLEAN NOT NULL DEFAULT FALSE`
- `daily_source TEXT NULL`
- `daily_frequency_rank INTEGER NULL`
- `perfect_rhyme_count INTEGER NOT NULL DEFAULT 0`
- `near_rhyme_count INTEGER NOT NULL DEFAULT 0`
- `total_usable_rhyme_count INTEGER NOT NULL DEFAULT 0`
- `strong_rhyme_key TEXT NULL`
- `strong_rhyme_cell_size INTEGER NOT NULL DEFAULT 0`
- `daily_exclusion_reason TEXT NULL`

These columns are recommended for v1 so corpus generation is auditable. A word should become `eligible_for_daily = TRUE` only after source import, normalization, pronunciation/rhyme enrichment, exclusion filtering, and sample review.

### `daily_challenges`

One row per scheduled daily challenge.

Recommended columns:

```sql
CREATE TABLE daily_challenges (
  id SERIAL PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  word_id INTEGER NOT NULL UNIQUE REFERENCES words(id),
  word TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'zbra-easy', 'zbra-hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Important constraints:

- `challenge_date UNIQUE` ensures one daily challenge per New York date.
- `word_id UNIQUE` ensures scheduled daily words never repeat.
- `id` is the public Daily challenge number. Generate the schedule once in chronological order starting June 30, 2026, and avoid deleting/reseeding schedule rows so public numbers remain stable.
- `difficulty` is stored so historical challenges remain stable even if percentile logic changes later.
- `word` is denormalized for stable display and simpler reads; `word_id` remains the durable reference.

### `daily_attempts`

One counted attempt per anonymous player, daily challenge, and mode.

Recommended columns:

```sql
CREATE TABLE daily_attempts (
  id SERIAL PRIMARY KEY,
  daily_challenge_id INTEGER NOT NULL REFERENCES daily_challenges(id),
  player_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('4-Bar Mode', 'Endless Mode')),
  submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (daily_challenge_id, player_id, mode)
);
```

Important constraints:

- `UNIQUE (daily_challenge_id, player_id, mode)` enforces one counted attempt per mode.
- `submission_id UNIQUE` prevents one submission from being linked to multiple daily attempts.
- `mode` is restricted to v1 Daily modes, not the full mode union.

### `submissions`

Existing table remains the canonical record for freestyle content:

- `lines`
- `score`
- `keyword`
- `mode`
- `difficulty`
- `played_on`

Daily Mode should continue creating a normal submission row first, then create a linked `daily_attempts` row.

For v1, avoid adding daily-specific columns directly to `submissions` unless implementation simplicity clearly outweighs separation.

## Storage Strategy

### Corpus Expansion

Before generating `daily_challenges`, expand `words` to at least 10,000 eligible unique rows.

Recommended approach:

1. Import `wordfreq` top English words as the primary raw source.
2. Add existing DB words as carryover candidates.
3. Normalize to lowercase alphabetic words.
4. Deduplicate.
5. Exclude words under 3 characters, over 12 characters, or containing punctuation, spaces, numbers, contractions, or hyphens.
6. Exclude function words, explicit blocklist words, NLP-detected proper names, places, organizations, demonyms, and calendar words.
7. Enrich each remaining candidate with pronunciation, stress marker presence, perfect/strong rhyme key, strong-rhyme cell size, perfect/strong rhyme count, near rhyme count, total usable rhyme count, and rhyme score.
8. Mark a candidate eligible only when it has pronunciation data with a usable stress marker, at least 2 strong/perfect rhymes, and at least 5 total usable rhymes.
9. Require at least 3 strong/perfect rhymes for easy and medium schedule pools.
10. Cap the schedule candidate pool at 20 words per strong-rhyme cell.
11. Bucket eligible words into easy, medium, and hard by capped rhymability.
12. Sample review 100 words per bucket and generate the risk-review audit.
13. Confirm the reviewed eligible pool can supply the schedule distribution: 3,334 easy, 3,333 medium, and 3,333 hard.

The current `random-words` package has about 1,952 words, so it is not enough by itself.

### Schedule Generation

Generate exactly 10,000 rows starting on June 30, 2026.

Recommended generation strategy:

- Select 10,000 eligible unique `words` rows.
- Use at most 20 words from any one `strong_rhyme_key`.
- Use the accepted difficulty distribution: 3,334 easy, 3,333 medium, and 3,333 hard.
- Sort or shuffle deterministically with a fixed seed.
- Assign one word to each New York calendar date starting June 30, 2026.
- Compute/store the difficulty from the word's percentile bucket at generation time.
- Insert all rows into `daily_challenges`.
- Rely on DB constraints to reject duplicates.

The schedule should be generated by a script, not at runtime.

After generation, past and current challenges are immutable. If a bad word is found, only future `daily_challenges` rows should be updated or regenerated, preserving existing ids, dates, and shared submissions for today/past challenges.

### Timezone Handling

Daily lookup must use `America/New_York`.

The app should compute today's daily date server-side. Avoid using browser local date for the canonical challenge.

## API And Server Strategy

### Daily Challenge Read

Server function:

```ts
getTodayDailyChallenge(): Promise<DailyChallenge>
```

Behavior:

- Computes current date in `America/New_York`.
- Fetches that date from `daily_challenges`.
- Returns challenge id, word, difficulty, date, and per-mode availability if player id is provided.

### Daily Attempt Status

Server function:

```ts
getDailyAttemptStatus(playerId: string, dailyChallengeId: number): Promise<DailyAttemptStatus>
```

Returns whether the player has already completed Daily 4-Bar and/or Daily Endless.

### Daily Submission Write

Server/API function:

```ts
saveDailySubmission(input): Promise<{ submissionId: number }>
```

Expected behavior:

1. Validate `playerId`.
2. Fetch today's challenge by New York date.
3. Validate requested mode is one of the supported Daily modes.
4. Check whether `(daily_challenge_id, player_id, mode)` already exists.
5. Save a normal submission with today's daily word and difficulty.
6. Save the linked daily attempt.
7. Return the submission id for the existing `/submissions/[id]` flow.

This should happen transactionally so a duplicate or failed daily attempt cannot leave inconsistent rows.

### Submission Read With Daily Context

Extend the submission read path to optionally include Daily metadata:

```ts
{
  id,
  lines,
  score,
  played_on,
  keyword,
  mode,
  difficulty,
  daily?: {
    challengeDate,
    challengeNumber, // daily_challenges.id
    mode,
  }
}
```

`/submissions/[id]` can render the same core page with a Daily badge/context when `daily` exists.

## Frontend Architecture

### Anonymous Player Id

Create a small client helper:

- Reads an id from `localStorage`.
- If missing, generates a random id.
- Stores it locally.
- Sends it with Daily status and Daily submission requests.

This identity is not secure. It is enough to prevent accidental repeated attempts on the same browser.

### Daily Landing

The Daily landing should:

- Fetch today's challenge and attempt status.
- Show today's date context.
- Hide the daily word until the countdown starts in the selected Daily mode.
- Show Daily 4-Bar and Daily Endless entry points.
- Show a completed state first for completed modes, with a link to the existing submission page.

### Daily Play Components

Preferred implementation:

- Reuse existing `FreestyleForm` and `EndlessForm` behavior through props or thin wrappers.
- Add Daily-specific submit handling rather than duplicating the whole game component.
- The game should use the daily word and stored daily difficulty from `daily_challenges`.

### Score And Share Flow

After a Daily attempt:

- Save via Daily submission endpoint.
- Route to `/submissions/[id]`.
- The submission page shows the freestyle and Daily context.

## State Management Approach

Use existing React local state patterns.

Daily-specific state:

- `dailyChallenge`
- `dailyAttemptStatus`
- `playerId`
- `isSubmitting`
- duplicate attempt error state

No global state library is needed.

## Authentication And Authorization

No accounts for v1.

Authorization is best-effort:

- Client-generated anonymous id.
- Server-enforced unique constraint per `daily_challenge_id`, `player_id`, and `mode`.
- Duplicate attempts return the existing submission/result if available, or an explanatory error.

Known limitation:

- Clearing browser storage or changing devices allows another attempt.
- This is acceptable for v1 because the game is not high stakes.

## External Services

Existing external services:

- Local CMU pronunciation dictionary for corpus enrichment.
- RhymeZone for rhyme data in existing game behavior.
- PostHog remains unrelated to Daily Mode unless analytics events are added later.

Corpus expansion may require an additional word list source. The source should be stable and scriptable, not a request-time dependency.

## Deployment Assumptions

- Database migrations can be applied manually or through a script before deploying the feature.
- Corpus expansion and schedule generation are one-time setup scripts.
- The app deploy target can run Node server code with access to `DATABASE_URL`.
- Existing `/submissions/[id]` URLs remain valid.

## Security Considerations

- Anonymous player id should not contain personal data.
- Daily attempt endpoints must validate mode, challenge, and request shape server-side.
- Server should not trust client-provided word or difficulty for Daily attempts.
- Daily submission writes should derive word/difficulty from today's stored challenge.
- There is no strong cheating prevention in v1.

## Performance Considerations

- `daily_challenges` lookup by `challenge_date` should be indexed by the unique constraint.
- `daily_attempts` duplicate checks should use the unique composite index.
- The 10,000-row schedule is tiny for Postgres.
- Corpus expansion/enrichment is the only heavy operation and should run offline.
- Avoid `ORDER BY RANDOM()` for Daily lookup; Daily Mode should use direct date lookup.

## Architectural Risks

- The current corpus is too small; reaching 10,000 eligible words is a prerequisite.
- A raw 10,000-word import may include bad, obscure, duplicate, offensive, or unfun words.
- Difficulty buckets depend on rhyme score quality; weak metadata can produce strange daily difficulty.
- If Daily submit logic is bolted directly into existing forms without clear boundaries, it may create brittle mode-specific branching.
- Anonymous identity is easy to bypass.
- Timezone bugs can cause users to see the wrong daily challenge near midnight.

## Open Architecture Questions

None for v1. Remaining ambiguity should be handled during implementation through sample review of the generated eligible word buckets.
