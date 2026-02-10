import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  total_points: number;
  co2_saved: number;
  total_distance: number;
  created_at: string;
  updated_at: string;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  type: 'walking' | 'cycling' | 'jogging';
  target_value: number;
  target_unit: 'km' | 'trips' | 'days';
  points_bronze: number;
  points_silver: number;
  points_gold: number;
  is_active: boolean;
  created_at: string;
};

export type UserChallenge = {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  status: 'in_progress' | 'completed_bronze' | 'completed_silver' | 'completed_gold';
  started_at: string;
  completed_at?: string;
};

export type Trip = {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  transport_mode: 'walking' | 'cycling' | 'jogging' | 'bus' | 'car' | 'train';
  distance: number;
  co2_saved: number;
  points_earned: number;
  created_at: string;
};

export type ForumPost = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ForumComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};
