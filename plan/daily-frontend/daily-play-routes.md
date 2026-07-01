# Story: Daily Play Routes

## Goal

Add `/daily/freestyle` and `/daily/endless` routes that reuse existing game play while saving through Daily Mode.

## User Value

Players can play Daily 4-Bar and Daily Endless with familiar game behavior and the same word reveal timing as normal modes.

## Dependencies

- Daily overview API story.
- Daily submission API story.
- Anonymous player id story.
- Daily landing story.

## Files Likely Touched

- `app/daily/freestyle/page.tsx`
- `app/daily/endless/page.tsx`
- `components/FreestyleForm.tsx`
- `components/EndlessForm.tsx`
- `types/daily.ts`

## Implementation Steps

1. Add Daily play routes.
2. Load today's challenge server-side.
3. Pass daily word and daily difficulty to the form only for gameplay.
4. Preserve existing countdown behavior.
5. Reveal the word only after countdown starts, matching existing modes.
6. Add injectable submit behavior or Daily-specific form props.
7. Save through `/api/daily/submissions`.
8. Route successful saves to `/submissions/[id]`.
9. Handle duplicate attempt response by showing completed/submission state.

## Acceptance Criteria

- Daily 4-Bar uses today's word and difficulty.
- Daily Endless uses today's word and difficulty.
- Word reveal timing matches normal modes.
- Successful completion saves a Daily attempt and redirects to `/submissions/[id]`.
- Duplicate same-mode attempts do not create another counted attempt.
- Normal 4-Bar and Endless routes still work.

## Test Notes

- Manual QA Daily 4-Bar complete flow.
- Manual QA Daily Endless complete flow.
- Regression QA normal 4-Bar and Endless.
- Verify duplicate same-mode behavior.

## Risks

- Existing form components may not accept alternate submission behavior cleanly.
- Refactoring forms can regress normal modes.
- Client-side word/difficulty props must not be trusted by the server.

## Completion Checklist

- [ ] Daily 4-Bar route created.
- [ ] Daily Endless route created.
- [ ] Forms support Daily submit path.
- [ ] Normal mode regression checks pass.

