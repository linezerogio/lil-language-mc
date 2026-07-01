# Story: Daily Mode Verification And Rollout

## Goal

Verify Daily Mode end to end and prepare it for safe release.

## User Value

Players get a Daily Mode that works reliably without breaking existing game modes.

## Dependencies

- All Daily database, corpus, server, frontend, and sharing stories.

## Files Likely Touched

- `README.md` or internal notes if setup steps are documented.
- Test files.
- Verification scripts.

## Implementation Steps

1. Run corpus and schedule verification scripts.
2. Run database constraint checks.
3. Run unit and integration tests.
4. Run `npm run build`.
5. Manual QA Daily landing.
6. Manual QA Daily 4-Bar.
7. Manual QA Daily Endless.
8. Manual QA duplicate attempts.
9. Manual QA shared Daily submission page.
10. Manual QA normal 4-Bar and Endless.
11. Document setup/runbook for regenerating future challenges if bad words are found.

## Acceptance Criteria

- Build passes.
- 10,000 Daily challenges exist.
- Schedule uniqueness and distribution are verified.
- Daily 4-Bar and Daily Endless can both be completed once per player/date.
- Duplicate same-mode attempts are blocked.
- `/submissions/[id]` works for normal and Daily submissions.
- Normal modes still work.

## Test Notes

- Include SQL checks for counts and uniqueness.
- Include API checks for Daily overview and Daily save.
- Include browser checks around word reveal timing.

## Risks

- Manual QA may miss bad words outside the sample.
- Timezone behavior needs special attention near midnight New York time.
- Future-only schedule repair needs discipline once Daily Mode is live.

## Completion Checklist

- [ ] Build passes.
- [ ] SQL verification passes.
- [ ] Daily browser QA passes.
- [ ] Normal mode regression QA passes.
- [ ] Rollout notes written.

