# Story: Daily Overview API

## Goal

Expose today's Daily challenge metadata and per-mode attempt status.

## User Value

The Daily landing can show which Daily modes are available or completed without revealing the word before play.

## Dependencies

- Daily schema story.
- Daily schedule generated.
- Anonymous player id helper story for full status behavior.

## Files Likely Touched

- `app/api/daily/route.ts`
- `app/daily/server.ts`
- `util/daily.ts`
- `types/daily.ts`

## Implementation Steps

1. Add `getTodayNewYorkDate()`.
2. Add `getTodayDailyChallenge()`.
3. Add `getDailyAttemptStatus(playerId, challengeId)`.
4. Implement `GET /api/daily?playerId=...`.
5. Return challenge metadata without revealing the word on the landing response if the route is used before start.
6. Return completion status and linked `submissionId` per supported Daily mode.
7. Return a clear unavailable response if today's challenge is missing.

## Acceptance Criteria

- API resolves today's challenge by `America/New_York` date.
- API returns Daily number from `daily_challenges.id`.
- API returns completion status for Daily 4-Bar and Daily Endless.
- API does not treat Rapid Fire as a Daily mode.
- Missing challenge is handled cleanly.

## Test Notes

- Unit-test New York date helper around midnight and DST cases.
- Integration-test with and without `playerId`.
- Verify completed attempts include `submissionId`.

## Risks

- Timezone bugs can show the wrong challenge near midnight.
- Accidentally returning the word on the landing response would violate the reveal rule.
- Existing server helpers may become too crowded if all Daily code lands in `app/server.tsx`.

## Completion Checklist

- [ ] Date helper implemented.
- [ ] Daily server helpers implemented.
- [ ] API route implemented.
- [ ] Missing-challenge behavior verified.
- [ ] Attempt status verified.

