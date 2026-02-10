-- Add INSERT policy for challenges table to allow API inserts
-- This allows anyone to insert challenges (admin data seeding)

CREATE POLICY "Anyone can insert challenges (admin seeding)"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow anon role to view and insert for demo/admin purposes
CREATE POLICY "Anon users can view all challenges"
  ON challenges FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert challenges"
  ON challenges FOR INSERT
  TO anon
  WITH CHECK (true);
