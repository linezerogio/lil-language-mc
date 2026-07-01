# Story: Daily Context On Shared Submission Page

## Goal

Show Daily Mode context on `/submissions/[id]` when a submission belongs to a Daily attempt.

## User Value

Shared Daily submissions show the freestyle itself and enough context to understand which Daily challenge it came from.

## Dependencies

- Daily schema story.
- Daily submission API story.
- Existing submission detail page.

## Files Likely Touched

- `app/api/submissions/[id]/route.ts`
- `app/submissions/[id]/page.tsx`
- `components/ViewScore.tsx`
- `components/FreestylePhases/Score.tsx`
- `types/daily.ts`

## Implementation Steps

1. Extend submission lookup to left join Daily context.
2. Return optional `daily` metadata from `GET /api/submissions/[id]`.
3. Keep the response compatible for normal submissions.
4. Render a Daily badge/context on the shared submission page.
5. Include Daily number, date, and Daily mode.
6. Keep the freestyle lines visible for sharing.

## Acceptance Criteria

- Normal submission pages render unchanged when no Daily context exists.
- Daily submission pages show Daily context.
- Daily pages still show lines, score, keyword, mode, and difficulty.
- Shared URL remains `/submissions/[id]`.

## Test Notes

- API test normal submission response.
- API test Daily submission response.
- Manual QA shared Daily page.
- Manual QA existing normal submission page.

## Risks

- Response type changes can break existing client assumptions.
- Daily context UI could crowd the existing score page.

## Completion Checklist

- [ ] Submission API includes optional Daily metadata.
- [ ] Submission page renders Daily metadata.
- [ ] Normal submissions still render.
- [ ] Shared Daily submission page QA complete.

