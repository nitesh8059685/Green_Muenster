import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aihpnjsmajolfvxcaysd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaHBuanNtYWpvbGZ2eGNheXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzI5MzcsImV4cCI6MjA4NTk0ODkzN30.6W6xvlBJQiy_nI3xwx9VpHfePdYNQm8ng6VhTocfuUg';

const supabase = createClient(supabaseUrl, supabaseKey);

const challenges = [
  { title: 'Urban Explorer', description: 'Discover Muenster by cycling through different districts', type: 'cycling', target_value: 60, target_unit: 'km', points_bronze: 20, points_silver: 40, points_gold: 80 },
  { title: 'Weekend Wanderer', description: 'Enjoy peaceful weekend walks around Muenster', type: 'walking', target_value: 50, target_unit: 'km', points_bronze: 18, points_silver: 35, points_gold: 70 },
  { title: 'Eco Commute Master', description: 'Use eco-friendly transport for your daily commute', type: 'cycling', target_value: 5, target_unit: 'trips', points_bronze: 15, points_silver: 30, points_gold: 60 },
  { title: 'Park Jogger', description: 'Run through Muenster parks and enjoy nature', type: 'jogging', target_value: 50, target_unit: 'km', points_bronze: 18, points_silver: 35, points_gold: 70 },
  { title: 'Car-Free Champion', description: 'Go without your car for 7 complete days', type: 'walking', target_value: 7, target_unit: 'days', points_bronze: 25, points_silver: 50, points_gold: 100 },
  { title: 'Bike Squad Leader', description: 'Complete 100 km of cycling challenges', type: 'cycling', target_value: 100, target_unit: 'km', points_bronze: 30, points_silver: 60, points_gold: 120 },
  { title: 'Green Tourist', description: 'Walk 10 different interesting locations in Muenster', type: 'walking', target_value: 10, target_unit: 'trips', points_bronze: 20, points_silver: 40, points_gold: 80 },
  { title: 'Distance Milestone', description: 'Accumulate 150 km of eco-friendly travel', type: 'cycling', target_value: 150, target_unit: 'km', points_bronze: 35, points_silver: 70, points_gold: 140 },
  { title: 'Jogging Enthusiast', description: 'Complete 60 km of jogging distance', type: 'jogging', target_value: 60, target_unit: 'km', points_bronze: 20, points_silver: 40, points_gold: 80 },
  { title: 'Carbon Zero Hero', description: 'Save 50 kg of CO2 through eco choices', type: 'cycling', target_value: 50, target_unit: 'km', points_bronze: 40, points_silver: 80, points_gold: 160 }
];

async function addChallenges() {
  console.log('Adding challenges to database...');

  for (const challenge of challenges) {
    const { data, error } = await supabase.from('challenges').insert([challenge]);
    if (error) {
      console.log(`Error adding "${challenge.title}":`, error.message);
    } else {
      console.log(`Added: ${challenge.title}`);
    }
  }

  const { data, error: selectError } = await supabase.from('challenges').select('*');
  if (selectError) {
    console.log('Error fetching challenges:', selectError.message);
  } else {
    console.log(`\nTotal challenges in database: ${data.length}`);
  }
}

addChallenges().catch(console.error);
