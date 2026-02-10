# Challenges Insertion Guide

## Issue

The Supabase database currently has Row-Level Security (RLS) policies that prevent inserting challenges using the anon key. The challenges table has the following policies:

- SELECT policy: "Anyone can view active challenges" (authenticated users, is_active = true)
- **MISSING**: INSERT policy

## Solution

### Step 1: Add RLS Policy for INSERT (via Supabase Dashboard)

Navigate to your Supabase dashboard > Authentication > Policies > challenges table and add these policies:

#### Policy 1: Allow Anon Users to Insert Challenges
```sql
CREATE POLICY "Anon users can insert challenges"
  ON challenges FOR INSERT
  TO anon
  WITH CHECK (true);
```

#### Policy 2: Allow Authenticated Users to Insert Challenges
```sql
CREATE POLICY "Authenticated users can insert challenges"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

### Step 2: Run the Insertion Script

Once the policies are added, run:

```bash
node /tmp/insert_challenges_api.js
```

Or use curl directly:

```bash
curl -X POST "https://aihpnjsmajolfvxcaysd.supabase.co/rest/v1/challenges" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/challenges_batch.json
```

## Current Challenges to Insert

10 new challenges are ready to be inserted:

1. **Urban Explorer** - Discover Muenster by cycling through different districts (60 km cycling)
2. **Weekend Wanderer** - Enjoy peaceful weekend walks around Muenster (50 km walking)
3. **Eco Commute Master** - Use eco-friendly transport for your daily commute (5 trips cycling)
4. **Park Jogger** - Run through Muenster parks and enjoy nature (50 km jogging)
5. **Car-Free Champion** - Go without your car for 7 complete days (7 days walking)
6. **Bike Squad Leader** - Complete 100 km of cycling challenges (100 km cycling)
7. **Green Tourist** - Walk 10 different interesting locations in Muenster (10 trips walking)
8. **Distance Milestone** - Accumulate 150 km of eco-friendly travel (150 km cycling)
9. **Jogging Enthusiast** - Complete 60 km of jogging distance (60 km jogging)
10. **Carbon Zero Hero** - Save 50 kg of CO2 through eco choices (50 km cycling)

## Alternative: Using Supabase CLI

If you have Supabase CLI installed, you can apply migrations:

```bash
supabase db push
```

This will run the migration file that adds the necessary INSERT policies.

## Error Message

Without the proper RLS policy, you'll see:
```
HTTP 401: new row violates row-level security policy for table "challenges"
```

This is expected and can be resolved by adding the INSERT policies above.
