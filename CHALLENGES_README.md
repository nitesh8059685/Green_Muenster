# Adding Challenges to Green Muenster Database

## Overview

This guide explains how to add 10 new challenges to the Supabase database for the Green Muenster application. The challenges are focused on eco-friendly transportation and carbon footprint reduction in Muenster.

## Files Included

1. **insert-challenges.js** - Node.js script to insert all 10 challenges into the database
2. **add_insert_policy.sql** - SQL statements to enable INSERT permissions on the challenges table
3. **SQL_SOLUTION.md** - Detailed troubleshooting and solution documentation

## Quick Start

### Step 1: Enable INSERT Permissions

Before running the insertion script, you must add INSERT policies to the challenges table. This is required because the table has Row-Level Security (RLS) enabled.

**Option A: Via Supabase Dashboard (Easiest)**

1. Go to https://app.supabase.com/ and log in
2. Select your "Green Muenster" project
3. Navigate to **Authentication** → **Policies**
4. Find the **challenges** table
5. Click **New Policy** → **For INSERT**
6. Configure:
   - **Role**: anon
   - **Name**: "Anon users can insert challenges"
   - **Check**: Leave empty or set to `true`
7. Click **Review** and **Save**

Repeat for authenticated role:
- **Role**: authenticated
- **Name**: "Authenticated users can insert challenges"

**Option B: Via SQL Editor**

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the contents of `add_insert_policy.sql`
4. Execute the query

### Step 2: Run the Insertion Script

```bash
cd /path/to/project
node insert-challenges.js
```

You should see output like:

```
====================================================================
Green Muenster: Challenges Insertion Script
====================================================================

Total challenges to insert: 10
Supabase URL: https://aihpnjsmajolfvxcaysd.supabase.co

Checking existing challenges...
Current challenges in database: 5

Inserting "Urban Explorer"... SUCCESS
Inserting "Weekend Wanderer"... SUCCESS
Inserting "Eco Commute Master"... SUCCESS
Inserting "Park Jogger"... SUCCESS
Inserting "Car-Free Champion"... SUCCESS
Inserting "Bike Squad Leader"... SUCCESS
Inserting "Green Tourist"... SUCCESS
Inserting "Distance Milestone"... SUCCESS
Inserting "Jogging Enthusiast"... SUCCESS
Inserting "Carbon Zero Hero"... SUCCESS

====================================================================
SUMMARY: 10 successful, 0 failed
====================================================================

Verifying insertion...
Final challenges in database: 15
Challenges added: 10

SUCCESS: All 10 challenges inserted successfully!
```

## Challenges to Be Added

### 1. Urban Explorer
- **Description**: Discover Muenster by cycling through different districts
- **Type**: Cycling
- **Target**: 60 km
- **Points**: Bronze: 20 | Silver: 40 | Gold: 80

### 2. Weekend Wanderer
- **Description**: Enjoy peaceful weekend walks around Muenster
- **Type**: Walking
- **Target**: 50 km
- **Points**: Bronze: 18 | Silver: 35 | Gold: 70

### 3. Eco Commute Master
- **Description**: Use eco-friendly transport for your daily commute
- **Type**: Cycling
- **Target**: 5 trips
- **Points**: Bronze: 15 | Silver: 30 | Gold: 60

### 4. Park Jogger
- **Description**: Run through Muenster parks and enjoy nature
- **Type**: Jogging
- **Target**: 50 km
- **Points**: Bronze: 18 | Silver: 35 | Gold: 70

### 5. Car-Free Champion
- **Description**: Go without your car for 7 complete days
- **Type**: Walking
- **Target**: 7 days
- **Points**: Bronze: 25 | Silver: 50 | Gold: 100

### 6. Bike Squad Leader
- **Description**: Complete 100 km of cycling challenges
- **Type**: Cycling
- **Target**: 100 km
- **Points**: Bronze: 30 | Silver: 60 | Gold: 120

### 7. Green Tourist
- **Description**: Walk 10 different interesting locations in Muenster
- **Type**: Walking
- **Target**: 10 trips
- **Points**: Bronze: 20 | Silver: 40 | Gold: 80

### 8. Distance Milestone
- **Description**: Accumulate 150 km of eco-friendly travel
- **Type**: Cycling
- **Target**: 150 km
- **Points**: Bronze: 35 | Silver: 70 | Gold: 140

### 9. Jogging Enthusiast
- **Description**: Complete 60 km of jogging distance
- **Type**: Jogging
- **Target**: 60 km
- **Points**: Bronze: 20 | Silver: 40 | Gold: 80

### 10. Carbon Zero Hero
- **Description**: Save 50 kg of CO2 through eco choices
- **Type**: Cycling
- **Target**: 50 km
- **Points**: Bronze: 40 | Silver: 80 | Gold: 160

## Verification

After running the insertion script successfully, verify the challenges in the database:

### Method 1: Via Supabase Dashboard

1. Go to Supabase Dashboard
2. Open the **challenges** table
3. Verify all 15 challenges are present (5 original + 10 new)

### Method 2: Via SQL Query

```sql
SELECT COUNT(*) as total_challenges FROM challenges;
SELECT title, type, target_value, target_unit FROM challenges ORDER BY created_at DESC LIMIT 10;
```

### Method 3: Via API

```bash
curl -X GET "https://aihpnjsmajolfvxcaysd.supabase.co/rest/v1/challenges?select=id,title,type,target_value,target_unit" \
  -H "apikey: YOUR_ANON_KEY"
```

## Troubleshooting

### Error: "new row violates row-level security policy for table 'challenges'"

This means the INSERT policies have not been added yet. See Step 1 above.

### Error: "Invalid API key"

Ensure you're using the correct anon key from the `.env` file:
- Variable: `VITE_SUPABASE_ANON_KEY`
- URL should be: `https://aihpnjsmajolfvxcaysd.supabase.co`

### Error: "Connection refused"

- Check your internet connection
- Verify the Supabase URL is correct
- Ensure the Supabase project is running

### Partial Success (Some challenges inserted, some failed)

- This can happen if the database connection is unstable
- Run the script again; it will skip challenges that already exist (due to ON CONFLICT DO NOTHING in the original migration)
- Or manually delete failed challenges and re-run

## Additional Notes

- All 10 challenges are marked as `is_active = true` and will be visible to users immediately
- The script verifies the insertion by counting total challenges before and after
- Existing challenges (from the initial migration) will not be affected
- The script is idempotent - running it multiple times won't create duplicates (if properly configured in the database)

## Support

For more detailed information, see:
- **SQL_SOLUTION.md** - Technical details and SQL documentation
- Supabase Documentation: https://supabase.com/docs/guides/auth/row-level-security
- Green Muenster Project: Check the main README.md

## Project Structure

```
/project
├── insert-challenges.js          # Insertion script
├── add_insert_policy.sql         # RLS policy SQL
├── SQL_SOLUTION.md               # Technical documentation
├── CHALLENGES_README.md          # This file
├── src/
│   ├── components/
│   │   └── Challenges.tsx        # UI component for challenges
│   └── lib/
│       └── supabase.ts           # Supabase client setup
├── .env                          # Environment variables (contains credentials)
└── supabase/
    ├── migrations/
    │   └── 20260206185431_create_green_muenster_schema.sql
```
