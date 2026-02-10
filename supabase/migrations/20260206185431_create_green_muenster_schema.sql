/*
  # Green Muenster Application Schema

  ## Overview
  Complete database schema for the Green Muenster carbon footprint reduction app.

  ## New Tables

  ### 1. `profiles`
  User profile data extending Supabase auth
  - `id` (uuid, references auth.users)
  - `username` (text, unique)
  - `full_name` (text)
  - `avatar_url` (text, optional)
  - `total_points` (integer, default 0)
  - `co2_saved` (numeric, kg of CO2 saved)
  - `total_distance` (numeric, km traveled by eco-friendly transport)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `challenges`
  Available challenges for users
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `type` (text: 'walking', 'cycling', 'jogging')
  - `target_value` (numeric, e.g., km or trips)
  - `target_unit` (text: 'km', 'trips', 'days')
  - `points_bronze` (integer)
  - `points_silver` (integer)
  - `points_gold` (integer)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 3. `user_challenges`
  Tracks user progress on challenges
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `challenge_id` (uuid, references challenges)
  - `current_progress` (numeric)
  - `status` (text: 'in_progress', 'completed_bronze', 'completed_silver', 'completed_gold')
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz, optional)

  ### 4. `trips`
  Records of user transportation choices
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `from_location` (text)
  - `to_location` (text)
  - `from_lat` (numeric)
  - `from_lng` (numeric)
  - `to_lat` (numeric)
  - `to_lng` (numeric)
  - `transport_mode` (text: 'walking', 'cycling', 'bus', 'car', 'train')
  - `distance` (numeric, km)
  - `co2_saved` (numeric, kg)
  - `points_earned` (integer)
  - `created_at` (timestamptz)

  ### 5. `forum_posts`
  Community forum posts
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `content` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `forum_comments`
  Comments on forum posts
  - `id` (uuid, primary key)
  - `post_id` (uuid, references forum_posts)
  - `user_id` (uuid, references profiles)
  - `content` (text)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only modify their own data
  - All users can view leaderboard and challenges
  - Forum posts/comments are public but only editable by owners
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  total_points integer DEFAULT 0,
  co2_saved numeric DEFAULT 0,
  total_distance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('walking', 'cycling', 'jogging')),
  target_value numeric NOT NULL,
  target_unit text NOT NULL CHECK (target_unit IN ('km', 'trips', 'days')),
  points_bronze integer DEFAULT 10,
  points_silver integer DEFAULT 25,
  points_gold integer DEFAULT 50,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  current_progress numeric DEFAULT 0,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed_bronze', 'completed_silver', 'completed_gold')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
  ON user_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON user_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON user_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_location text NOT NULL,
  to_location text NOT NULL,
  from_lat numeric NOT NULL,
  from_lng numeric NOT NULL,
  to_lat numeric NOT NULL,
  to_lng numeric NOT NULL,
  transport_mode text NOT NULL CHECK (transport_mode IN ('walking', 'cycling', 'jogging', 'bus', 'car', 'train')),
  distance numeric NOT NULL,
  co2_saved numeric NOT NULL,
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum posts"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create forum posts"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON forum_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON forum_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON forum_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON forum_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON forum_comments(post_id);

-- Insert some initial challenges
INSERT INTO challenges (title, description, type, target_value, target_unit, points_bronze, points_silver, points_gold) VALUES
('Cycle Commuter', 'Cycle 50 km to reduce your carbon footprint', 'cycling', 50, 'km', 15, 30, 60),
('Walking Warrior', 'Walk 30 km around Muenster', 'walking', 30, 'km', 10, 25, 50),
('Jog Master', 'Complete 40 km of jogging', 'jogging', 40, 'km', 12, 28, 55),
('Weekly Cyclist', 'Cycle for 7 consecutive days', 'cycling', 7, 'days', 20, 40, 75),
('Daily Walker', 'Walk every day for 5 days', 'walking', 5, 'days', 15, 30, 60)
ON CONFLICT DO NOTHING;