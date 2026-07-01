# Story: Import And Mark Daily-Eligible Words

## Goal

Expand the `words` table to at least 10,000 Daily-eligible words using `wordfreq` plus existing database words as raw candidates.

## User Value

Daily Mode gets a large no-repeat word pool where each word is playable and has enough rhyme options.

## Dependencies

- Daily schema story.
- `wordfreq` or a pinned export from `wordfreq`.
- Local CMU pronunciation/rhyme enrichment script.

## Files Likely Touched

- `scripts/import-daily-words.*`
- `scripts/enrich-daily-words.*`
- `database/migrations/*daily*.sql`
- `package.json` or script runner config if a dependency is added.

## Implementation Steps

1. Pull raw candidates from `wordfreq`.
2. Add existing DB words as carryover candidates.
3. Normalize candidates to lowercase alphabetic tokens.
4. Exclude invalid token shapes: under 3 chars, over 12 chars, punctuation, spaces, numbers, contractions, or hyphens.
5. Exclude function words, explicit blocklist words, NLP-detected proper names, places, organizations, demonyms, and calendar words.
6. Enrich remaining candidates with pronunciation, stress marker presence, strong/perfect rhyme key, strong/perfect rhyme cell size, strong/perfect rhyme count, near rhyme count, total usable rhyme count, and rhyme score.
7. Mark `eligible_for_daily = true` only when the word has pronunciation data with a usable stress marker, at least 2 strong/perfect rhymes, and at least 5 total usable rhymes.
8. Store `daily_source`, `daily_frequency_rank`, rhyme counts, strong-rhyme cell metadata, and exclusion reason.
9. Produce a summary report of accepted and rejected candidates.

## Acceptance Criteria

- At least 10,000 words are marked `eligible_for_daily = true`.
- Every eligible word has pronunciation data and a usable stress marker.
- Every eligible word has at least 2 strong/perfect rhymes and at least 5 total usable rhymes.
- Every enriched eligible word has a `strong_rhyme_key` and `strong_rhyme_cell_size`.
- Rejected words have a clear exclusion reason where practical.
- No eligible word violates length or token-shape rules.
- No eligible word is flagged as an NLP-detected proper name, place, organization, demonym, or calendar word.

## Test Notes

- Run SQL counts by eligibility and exclusion reason.
- Spot-check accepted and rejected rows.
- Verify no eligible words contain spaces, punctuation, numbers, contractions, or hyphens.
- Verify NLP-driven exclusion reasons are present in the rejection summary.

## Risks

- Local dictionary scoring can disagree with rhyme APIs or human intuition, so sample review remains required.
- Automated offensive/proper noun filtering may miss edge cases.
- Wordfreq candidates may include words that are common but poor freestyle prompts.

## Completion Checklist

- [ ] Candidate import script written.
- [ ] Enrichment script written.
- [ ] Eligibility report generated.
- [ ] At least 10,000 eligible words confirmed.
- [ ] 100 words per bucket are ready for sample review.
