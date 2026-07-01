# Daily Mode Spec Plan

## Parsed Project Seed

The project is LLMC, a Next.js rap/rhyme game with existing 4-Bar Mode and Endless Mode. The user wants to add a Daily Mode. The app now appears likely to keep using the new Postgres/Neon database long term, so Daily Mode can be designed with persistent storage in mind.

## Project Idea Summary

Add a daily challenge mode where players get the same daily prompt or word for a given day, can play under a defined rule set, and can compare their result against their own previous attempts or a broader leaderboard/high-score view.

## Known Facts

- Current playable modes are represented by `Mode = '4-Bar Mode' | 'Rapid Fire Mode' | 'Endless Mode'`.
- Current difficulties are `easy`, `medium`, `hard`, `zbra-easy`, and `zbra-hard`.
- Word selection is based on `words.rhymescore` buckets in Postgres.
- `zbra-hard` is hard-coded to return `youtube` and should stay special-cased unless explicitly changed.
- Submissions are stored in a `submissions` table with `lines`, `score`, `keyword`, `mode`, `difficulty`, and `played_on`.
- The game already has score pages, replay flow, difficulty selection, and mode selection UI.
- The temporary/new database has more than 1,000 words available.

## Unknowns

- Whether Daily Mode should be a separate mode, a variant of 4-Bar Mode, or a route-level wrapper around existing modes.
- Whether the daily word should be global for all players, per difficulty, per mode, or per user/session.
- Whether users can play Daily Mode multiple times per day.
- Whether the app needs user identity, anonymous local identity, or no identity at all.
- Whether Daily Mode needs a leaderboard, share card, streaks, history, or only a single daily prompt.
- Whether daily reset should use local time, server time, or a specific timezone.
- Whether Daily Mode should support all difficulties or use one fixed daily difficulty.
- Whether old daily challenges should remain playable.

## Questions To Ask Next

1. Should Daily Mode be one fixed challenge per calendar day, or one daily challenge per difficulty?
2. Should players get unlimited attempts, one submitted score per day, or unlimited practice with only the first/best score counting?
3. Do you want a leaderboard now, or should Daily Mode launch with only personal score/submission sharing?
4. What timezone should define "daily": UTC, America/New_York, or the player's local timezone?
5. Should Daily Mode use the existing 4-Bar rules, Endless rules, or a new ruleset?
6. Should users be anonymous, or do we need accounts/names for tracking streaks and leaderboards?

## Phase-By-Phase Plan

### Phase 0: `plan.md`

Define the spec workflow, current facts, open questions, assumptions, risks, and decision gates.

Status: in progress.

### Phase 1: `project.md`

Define the product behavior before architecture:

- Daily Mode user promise
- Target users
- Core workflows
- Non-goals for v1
- Success criteria
- Product constraints

Decision gate: confirm the intended player experience before deciding data model or routes.

### Phase 2: `architecture.md`

Choose architecture after product behavior is accepted:

- Daily challenge generation strategy
- Database tables or columns
- Route and API/server-action boundaries
- Caching and timezone strategy
- Identity strategy, if needed
- How Daily Mode relates to existing mode/difficulty types

Decision gate: choose storage, identity, and reset semantics before implementation planning.

### Phase 3: `implementation.md`

Translate the accepted product and architecture into build details:

- Data contracts
- UI/component changes
- Route/API contracts
- State transitions
- Error/loading/empty states
- Testing strategy
- Definition of done

Decision gate: confirm the implementation scope before creating story files.

### Phase 4: `plan/[epic]/[story].md`

Break the implementation into small, testable work items:

- Database/schema story
- Daily selection story
- Daily play route story
- Submission/counting rules story
- Results/share/leaderboard story, if included
- Tests and rollout story

## Decision Gates

- Product gate: What does "Daily Mode" mean to players?
- Rules gate: Which gameplay rules does Daily Mode use?
- Attempt gate: How many attempts count?
- Time gate: What timezone resets the challenge?
- Identity gate: How are scores associated with players?
- Data gate: Are daily challenges materialized in DB or computed deterministically?
- UI gate: Where does Daily Mode live in the current mode selector and score flows?

## Assumptions Log

- Daily Mode should reuse as much of the existing game and scoring code as practical.
- V1 should avoid accounts unless leaderboards or streaks require identity.
- The daily challenge should be server-determined so all players see the same prompt.
- The new database can be treated as the durable production database for this feature.
- Existing `submissions` data should remain compatible.

## Open Questions Log

- Is Daily Mode public or private/personal?
- Does Daily Mode need a shareable result page?
- Should Daily Mode have one word per day or a sequence of daily prompts?
- Should difficulty affect the selected word or only the time/scoring rules?
- Should hidden ZBRA difficulties be available in Daily Mode?
- Should Daily Mode submissions be mixed into existing max-score queries?
- Should old daily challenges be playable from a calendar/archive?

## Risk Log

- If attempt rules are unclear, players may be able to farm or invalidate daily scores.
- If timezone semantics are unclear, users may see different daily challenges than expected.
- If Daily Mode is added directly to the existing `Mode` union without a plan, it may spread changes through many components.
- If leaderboards are required without identity, score attribution and abuse prevention become weak.
- If daily challenge generation is purely random at request time, players may not share the same prompt.
- If daily challenges are inserted lazily, first request of the day may need robust error handling and race-condition protection.

## Files To Be Created

- `plan.md`
- `project.md`
- `architecture.md`
- `implementation.md`
- `plan/[epic]/[story].md` files after implementation planning is approved

