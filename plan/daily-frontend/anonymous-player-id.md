# Story: Anonymous Daily Player Id

## Goal

Create a browser-local anonymous player id for best-effort Daily attempt tracking.

## User Value

Players are prevented from accidentally submitting multiple counted attempts for the same Daily mode without needing accounts.

## Dependencies

- Daily overview API story.
- Daily submission API story.

## Files Likely Touched

- `util/dailyIdentity.ts`
- Daily route components.

## Implementation Steps

1. Create `getOrCreateDailyPlayerId()`.
2. Store the id in `localStorage` under `llmc_daily_player_id`.
3. Generate ids using `crypto.randomUUID()` where available.
4. Add a fallback for older browser environments.
5. Keep identity helper client-only.
6. Use the id in Daily overview and Daily submission requests.

## Acceptance Criteria

- A player id is generated once and reused on the same browser.
- No player id is generated during server render.
- Clearing browser storage creates a new id.
- Daily API requests include the id when available.

## Test Notes

- Unit-test storage read/write behavior with mocked `localStorage`.
- Manual QA in browser: refresh preserves the id.

## Risks

- Local storage can be unavailable in private or restricted contexts.
- The identity is not cheat-proof, by design.

## Completion Checklist

- [ ] Helper implemented.
- [ ] Daily landing uses helper.
- [ ] Daily submission uses helper.
- [ ] Local storage edge behavior handled.

