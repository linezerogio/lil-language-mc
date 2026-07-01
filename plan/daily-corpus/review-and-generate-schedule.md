# Story: Review Buckets And Generate 10,000-Day Schedule

## Goal

Generate exactly 10,000 no-repeat Daily challenges starting on June 30, 2026, with an even-as-possible difficulty distribution.

## User Value

Players get a stable Daily schedule that does not repeat words and stays balanced across easy, medium, and hard prompts.

## Dependencies

- Daily schema story.
- Daily word import and eligibility story.
- At least 3,334 eligible easy words, 3,333 eligible medium words, and 3,333 eligible hard words.
- At least 6,667 eligible words with 3 or more strong/perfect rhymes for the easy and medium pools.
- At least 10,000 eligible schedule candidates after limiting each strong-rhyme cell to 20 selected words.

## Files Likely Touched

- `scripts/generate-daily-challenges.*`
- `scripts/review-daily-word-samples.*`
- `scripts/export-daily-risk-review.*`
- `database/migrations/*daily*.sql`
- Optional generated review artifacts.

## Implementation Steps

1. Bucket eligible words by rhymability into easy, medium, and hard.
2. Select easy and medium words only from candidates with at least 3 strong/perfect rhymes.
3. Limit candidates to at most 20 words per strong-rhyme cell before schedule selection.
4. Generate sample review exports of 100 words per bucket from that capped candidate pool.
5. Generate risk-review exports for short-word, morphology-family, exact-token, NLP-proper, and strong-cell audit categories.
6. Review and remove or mark any bad sampled words.
7. Confirm bucket counts still satisfy 3,334 easy, 3,333 medium, and 3,333 hard.
8. Deterministically select 10,000 unique words.
9. Assign selected words to dates starting `2026-06-30` in `America/New_York`.
10. Insert rows into `daily_challenges` in chronological order so `daily_challenges.id` is the public Daily number.
11. Verify uniqueness and distribution after insert.

## Acceptance Criteria

- `daily_challenges` contains exactly 10,000 rows.
- First challenge date is `2026-06-30`.
- No `word_id` repeats.
- No `challenge_date` repeats.
- Distribution is 3,334 easy, 3,333 medium, and 3,333 hard.
- Easy and medium challenges have at least 3 strong/perfect rhymes.
- No strong-rhyme cell contributes more than 20 scheduled words.
- Risk review has zero exact-token and NLP-proper hits before schedule generation.
- Challenge ids are chronological.

## Test Notes

- Run SQL count by difficulty.
- Run SQL count by strong-rhyme cell and verify no cell exceeds 20 scheduled words.
- Run risk-review export and verify exact-token/NLP-proper categories are clear.
- Run SQL duplicate checks for `word_id` and `challenge_date`.
- Verify `MIN(challenge_date) = 2026-06-30`.
- Verify ids sort in the same order as dates.

## Risks

- Sample review may find enough bad words to drop a bucket below target.
- Regenerating the schedule after publication could break Daily ids if not handled carefully.
- Difficulty bucket definitions may need tuning after sample review.

## Completion Checklist

- [ ] Sample review completed.
- [ ] Schedule generation script written.
- [ ] 10,000 rows generated.
- [ ] Distribution verified.
- [ ] Uniqueness verified.
