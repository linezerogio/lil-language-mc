# Daily Mode Product Spec

## Problem

LLMC currently lets players start a fresh game whenever they want, with random word selection by difficulty. There is no shared daily challenge that gives players a reason to come back, compare a run, or share a result tied to the same prompt as everyone else.

Daily Mode should add a low-friction daily ritual: one shared word per day, one real attempt per supported mode, and a shareable freestyle.

## Target Users

- Existing LLMC players who want a quick daily challenge.
- Casual players who want a Wordle-style "one shot today" experience.
- Players who want to compare a result with friends without needing accounts or public leaderboards.
- Returning users who benefit from a simple reason to revisit the game each day.

## User Goals

- Play today's challenge with the same daily word everyone else receives.
- Know that only one attempt counts for each Daily Mode variant per day.
- See their result after the attempt.
- Share their daily freestyle.
- Return tomorrow for a new challenge.
- Understand which mode and difficulty rules apply before starting.

## Product Goal

Add a Daily Mode that creates a repeatable daily challenge loop without requiring accounts, leaderboards, or broad redesign work for v1.

The v1 promise is:

> One daily word, one counted attempt per supported mode, one shareable freestyle.

## Accepted Product Decisions

- Daily word: one shared daily word.
- Daily schedule: precompute 10,000 daily challenges.
- Repeats: daily words must not repeat within the precomputed schedule.
- Attempts: one counted attempt per supported mode per day. A player can complete both Daily 4-Bar and Daily Endless on the same daily challenge.
- Sharing: reuse the existing submission page as the sharing surface, because players should be able to show off the freestyle itself.
- Reset timezone: America/New_York.
- Start date: the 10,000-day schedule starts on June 30, 2026.
- Word reveal: the daily word is revealed only after the countdown starts, matching existing mode behavior.
- Completed modes: the Daily landing shows a completed state first, rather than immediately redirecting to the submission page.
- Difficulty/rules: the daily challenge has one daily difficulty shared across supported modes, because difficulty is derived from the selected word's percentile bucket.
- Candidate source: use `wordfreq` as the primary raw word source, plus existing DB words as carryover candidates.
- Daily word style: prefer a mix of common and interesting words, not obscure dictionary filler.
- Rhymability floor: a word is daily-eligible only if it has pronunciation data with a usable stress marker, at least 2 strong/perfect rhymes, and at least 5 total usable rhymes.
- Easy and medium daily words must have at least 3 strong/perfect rhymes.
- Strong-rhyme hypercell cap: the schedule can use at most 20 words from any one strong/perfect rhyme cell.
- Daily quality filter: exclude explicit blocklist words, NLP-detected proper names, places, organizations, demonyms, and calendar words from the Daily schedule pool.
- Daily difficulty distribution: as even as possible across easy, medium, and hard. For 10,000 challenges, target 3,334 easy, 3,333 medium, and 3,333 hard.
- Exclusions: exclude slurs/offensive words, explicit sexual words, proper nouns/brands, function words, words under 3 characters, words over 12 characters, and words with punctuation, spaces, numbers, contractions, or hyphens.
- Review level: sample review 100 words per bucket plus risk-review audit before schedule generation.
- Stability rule: past and current daily challenges are immutable; future challenges may be regenerated if bad words are found.

## Core Use Cases

### Play Today's Daily Challenge

A player opens Daily Mode, sees today's challenge context, starts the game, completes one attempt, and receives a score.

### Prevent A Second Counted Attempt

After a player has submitted today's Daily Mode attempt for a mode, the app should not let them submit another counted attempt for that same daily challenge and mode from the same player/browser identity. Completing Daily 4-Bar should not block Daily Endless, and completing Daily Endless should not block Daily 4-Bar.

### Share A Submission

After finishing, a player can share the existing submission page for the daily attempt. The shared page should show the freestyle lines, score, keyword, mode, difficulty, and daily context.

### Return Tomorrow

When the America/New_York calendar day changes, a new daily word and daily challenge become available.

## Non-Goals For V1

- Public global leaderboard.
- User accounts.
- Anti-cheat guarantees beyond reasonable client/server checks.
- Daily archive/calendar replay.
- Friend groups.
- Comments or social feed.
- Real-time score comparison.
- Reworking the scoring model.
- Replacing existing 4-Bar or Endless routes.
- Changing the `zbra-hard` hard-coded YouTube behavior unless explicitly requested.

## Success Criteria

- A player can access Daily Mode from the main game UI.
- Today's Daily Mode always uses the same daily word for all players.
- The daily reset follows America/New_York dates.
- A player gets one counted attempt per daily challenge per supported mode.
- After completing the attempt, the player sees a result screen.
- The completed daily freestyle can be shared through its submission page.
- Existing non-daily modes continue working.
- Daily Mode submissions are distinguishable from normal submissions.

## Key Workflows

### Entry Workflow

1. Player lands on the home screen.
2. Player chooses Daily Mode or a daily challenge entry point.
3. Player sees the daily mode context and can start.
4. The game uses today's daily word.

### First Attempt Workflow

1. Player starts today's daily challenge.
2. Player writes under the selected daily mode rules.
3. Player submits or time expires.
4. The app records the counted attempt.
5. The app shows the player's score and share option.

### Already Played Workflow

1. Player opens Daily Mode after completing today's attempt.
2. The app recognizes that today's counted attempt already exists.
3. The player sees their result rather than starting another counted run.
4. The player can share the result again.

### New Day Workflow

1. The America/New_York date changes.
2. The app exposes a new daily word/challenge.
3. The player can make one counted attempt for the new day.

## Conceptual Model

### Daily Challenge

A daily challenge represents one America/New_York date and one shared word.

The v1 daily schedule contains 10,000 precomputed challenges. Each challenge must use a unique word, so the system needs at least 10,000 eligible words before the schedule can be generated.

### Daily Variant

A daily variant represents how the same daily word and daily difficulty are played under a supported mode's rules. V1 should define which modes are supported before implementation.

### Daily Attempt

A daily attempt is the player's one counted submission for a daily challenge/mode variant.

### Daily Result

A daily result is the submission created by the daily attempt, with enough daily context to show which date/challenge it belongs to.

## Constraints

- The app is currently a Next.js app using server-rendered routes and client game components.
- The game stores submissions in Postgres.
- The app currently has no user account system.
- Existing scoring and word-selection behavior should be reused where practical.
- One-attempt enforcement needs some form of identity or device/browser marker if accounts are not added.
- The daily reset must use America/New_York, not the browser's local day.
- The word corpus must support at least 10,000 eligible unique daily words.
- Daily-eligible words must pass the accepted rhymability, exclusion, and sample-review filters.

## Open Product Questions

- Does the existing submission page need a Daily Mode visual treatment or badge?
- Should the shared submission page include extra Daily Mode metadata like challenge date, attempt status, or streak copy?
- Should users be allowed to practice today's word after their counted attempt, with clear labeling that it does not count?
