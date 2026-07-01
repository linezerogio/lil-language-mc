-- Daily challenges no longer expose or use difficulty buckets.
-- Keep the legacy column populated for the existing NOT NULL/check constraint.

ALTER TABLE daily_challenges
  ALTER COLUMN difficulty SET DEFAULT 'medium';

UPDATE daily_challenges
SET difficulty = 'medium'
WHERE difficulty <> 'medium';
