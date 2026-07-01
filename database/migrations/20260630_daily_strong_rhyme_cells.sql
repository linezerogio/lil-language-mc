-- Persist strong-rhyme cell metadata used by Daily schedule diversity caps.

ALTER TABLE words
  ADD COLUMN IF NOT EXISTS strong_rhyme_key TEXT,
  ADD COLUMN IF NOT EXISTS strong_rhyme_cell_size INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS words_strong_rhyme_key_idx
  ON words (strong_rhyme_key);
