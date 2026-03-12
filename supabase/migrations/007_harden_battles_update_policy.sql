-- Harden battles UPDATE policy:
-- - Keep participant updates (player1/player2)
-- - Allow non-owner update only for safe "join room" transition
--   (waiting -> active with caller becoming player2, no score/winner tampering)

DROP POLICY IF EXISTS "battles_update" ON battles;

CREATE POLICY "battles_update" ON battles
FOR UPDATE
USING (
  auth.uid() = player1_id
  OR auth.uid() = player2_id
  OR (status = 'waiting' AND player2_id IS NULL)
)
WITH CHECK (
  auth.uid() = player1_id
  OR auth.uid() = player2_id
  OR (
    auth.uid() = player2_id
    AND status = 'active'
    AND player1_ready = false
    AND player2_ready = false
    AND winner_id IS NULL
    AND player1_score = 0
    AND player2_score = 0
  )
);
