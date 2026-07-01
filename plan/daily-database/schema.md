# Story: Daily Mode Database Schema

## Goal

Add the database structures required to store precomputed Daily challenges and per-mode Daily attempts.

## User Value

Players get stable Daily challenges, one counted attempt per mode, and shareable submissions tied to a Daily challenge.

## Dependencies

- Approved `architecture.md`.
- Existing `words` and `submissions` tables.
- Current `DATABASE_URL` points at the durable database.

## Files Likely Touched

- `database/migrations/*daily*.sql`
- `app/server.tsx` or `app/daily/server.ts`
- Test or verification scripts, if added.

## Implementation Steps

1. Add optional Daily eligibility/enrichment columns to `words`, including strong-rhyme cell metadata.
2. Create `daily_challenges` with `id`, `challenge_date`, `word_id`, `word`, `difficulty`, and `created_at`.
3. Add `UNIQUE(challenge_date)` and `UNIQUE(word_id)`.
4. Create `daily_attempts` with `daily_challenge_id`, `player_id`, `mode`, `submission_id`, and `created_at`.
5. Add `UNIQUE(daily_challenge_id, player_id, mode)`.
6. Restrict `daily_attempts.mode` to `4-Bar Mode` and `Endless Mode`.
7. Add useful indexes for date lookup, submission lookup, and attempt status lookup.

## Acceptance Criteria

- Daily schema can be applied to the database without affecting existing submissions.
- `words` can store `strong_rhyme_key` and `strong_rhyme_cell_size` for Daily schedule capping.
- Duplicate Daily dates are rejected.
- Duplicate scheduled Daily words are rejected.
- A player can have one Daily 4-Bar and one Daily Endless attempt for the same challenge.
- A duplicate same-mode attempt for the same player/challenge is rejected.

## Test Notes

- Run SQL checks for each unique constraint.
- Confirm existing `GET /api/submissions/[id]` still works after migration.
- Confirm existing normal submission insert still works.

## Risks

- A destructive migration could affect existing submissions.
- A too-broad mode check could accidentally allow Rapid Fire Daily.
- Missing indexes could make attempt status reads slower later.

## Completion Checklist

- [ ] Migration created.
- [ ] Migration applied locally.
- [ ] Constraints verified.
- [ ] Existing submission flow smoke-tested.
