-- Daily Mode schema.
-- Apply once against the current Postgres database before generating daily words.

ALTER TABLE words
  ADD COLUMN IF NOT EXISTS eligible_for_daily BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS daily_source TEXT,
  ADD COLUMN IF NOT EXISTS daily_frequency_rank INTEGER,
  ADD COLUMN IF NOT EXISTS has_stress_marker BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS perfect_rhyme_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS near_rhyme_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_usable_rhyme_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS strong_rhyme_key TEXT,
  ADD COLUMN IF NOT EXISTS strong_rhyme_cell_size INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_exclusion_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS words_word_unique_idx
  ON words (word);

CREATE INDEX IF NOT EXISTS words_daily_eligible_idx
  ON words (eligible_for_daily, rhymescore DESC);

CREATE INDEX IF NOT EXISTS words_strong_rhyme_key_idx
  ON words (strong_rhyme_key);

CREATE TABLE IF NOT EXISTS daily_challenges (
  id SERIAL PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  word_id INTEGER NOT NULL UNIQUE REFERENCES words(id),
  word TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS daily_challenges_date_idx
  ON daily_challenges (challenge_date);

CREATE TABLE IF NOT EXISTS daily_attempts (
  id SERIAL PRIMARY KEY,
  daily_challenge_id INTEGER NOT NULL REFERENCES daily_challenges(id),
  player_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('4-Bar Mode', 'Endless Mode')),
  submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (daily_challenge_id, player_id, mode)
);

CREATE INDEX IF NOT EXISTS daily_attempts_player_challenge_idx
  ON daily_attempts (player_id, daily_challenge_id);

CREATE INDEX IF NOT EXISTS daily_attempts_submission_idx
  ON daily_attempts (submission_id);
