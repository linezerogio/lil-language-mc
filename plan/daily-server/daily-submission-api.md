# Story: Daily Submission API

## Goal

Save a Daily attempt transactionally as both a normal submission and a linked daily attempt.

## User Value

Players can complete one Daily 4-Bar and one Daily Endless per day, then share the resulting submission page.

## Dependencies

- Daily schema story.
- Daily overview API story.
- Existing submission save behavior.

## Files Likely Touched

- `app/api/daily/submissions/route.ts`
- `app/daily/server.ts`
- `app/server.tsx`
- `types/daily.ts`

## Implementation Steps

1. Define Daily submission request and response types.
2. Validate `playerId`, mode, lines, and score.
3. Resolve today's challenge server-side.
4. Ignore any client-provided keyword or difficulty.
5. Insert the normal submission using today's word and stored Daily difficulty.
6. Insert the `daily_attempts` row in the same transaction.
7. Catch duplicate attempt constraint failures and return `already_played`.
8. Return `submissionId` for successful attempts.

## Acceptance Criteria

- Daily 4-Bar save creates one `submissions` row and one `daily_attempts` row.
- Daily Endless save can succeed for the same player and challenge after Daily 4-Bar.
- Duplicate same-mode Daily save returns `already_played`.
- Server derives word and difficulty from `daily_challenges`.
- Failed daily attempt does not leave inconsistent rows.

## Test Notes

- Integration-test Daily 4-Bar save.
- Integration-test Daily Endless save for same player/date.
- Integration-test duplicate same-mode save.
- Verify transaction rollback behavior on forced insert failure.

## Risks

- Existing `saveSubmission` helper may need refactoring for transaction support.
- Duplicate handling may vary depending on Postgres error codes.
- Client score is trusted today; stronger score validation is out of scope for v1.

## Completion Checklist

- [ ] Request validation implemented.
- [ ] Transactional save implemented.
- [ ] Duplicate attempt response implemented.
- [ ] Daily 4-Bar and Daily Endless saves verified.

