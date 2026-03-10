-- Track per-player ready state in battle lobby.
ALTER TABLE battles
ADD COLUMN IF NOT EXISTS player1_ready BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS player2_ready BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill safety for older rows that might have null values.
UPDATE battles
SET
  player1_ready = COALESCE(player1_ready, FALSE),
  player2_ready = COALESCE(player2_ready, FALSE)
WHERE player1_ready IS NULL OR player2_ready IS NULL;
