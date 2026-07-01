# Story: Daily Landing Page

## Goal

Add `/daily`, where players can see today's Daily status and choose Daily 4-Bar or Daily Endless.

## User Value

Players get a clear Daily Mode entry point that shows what they can still play today without revealing the word early.

## Dependencies

- Daily overview API story.
- Anonymous player id story.
- Daily schedule generated.

## Files Likely Touched

- `app/daily/page.tsx`
- `components/StartSection.tsx`
- `util/options.ts`
- `types/daily.ts`

## Implementation Steps

1. Add a Daily entry point from the home/start UI.
2. Add `/daily` route.
3. Fetch Daily overview with anonymous player id.
4. Show Daily number and date context without revealing the word.
5. Show Daily 4-Bar and Daily Endless options.
6. For completed modes, show completed state first with a link to the saved submission.
7. For available modes, link to the corresponding Daily play route.
8. Handle missing challenge, loading, and error states.

## Acceptance Criteria

- `/daily` loads today's challenge metadata.
- Word is not visible on the landing page.
- Both Daily modes are visible.
- Completed modes show a completed state and submission link.
- Available modes can be started.

## Test Notes

- Manual QA for no attempts, one completed mode, and both completed modes.
- Verify no Daily word appears in initial landing HTML or visible UI.
- Test missing challenge response.

## Risks

- Adding Daily to existing mode selectors could create visual clutter.
- Accidentally revealing the word early breaks the product rule.

## Completion Checklist

- [ ] `/daily` route created.
- [ ] Home entry added.
- [ ] Attempt status states rendered.
- [ ] Word hidden before start.

