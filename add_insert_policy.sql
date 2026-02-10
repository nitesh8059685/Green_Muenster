-- Enable INSERT operations on challenges table for Supabase API access
-- This resolves the RLS policy blocking issue

-- Allow anon users to insert challenges (for API-based seeding)
CREATE POLICY "Anon users can insert challenges"
  ON challenges FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert challenges (for admin operations)
CREATE POLICY "Authenticated users can insert challenges"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure anon can view all challenges (not just active ones)
CREATE POLICY "Anon users can view all challenges"
  ON challenges FOR SELECT
  TO anon
  USING (true);
