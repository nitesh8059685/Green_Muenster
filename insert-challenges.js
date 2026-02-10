/**
 * Green Muenster Challenges Insertion Script
 *
 * This script inserts 10 new challenges into the Supabase database.
 *
 * Prerequisites:
 * - The challenges table must have INSERT policies enabled for the anon role
 * - See add_insert_policy.sql for the required SQL commands
 *
 * Usage:
 * node insert-challenges.js
 */

const SUPABASE_URL = "https://aihpnjsmajolfvxcaysd.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaHBuanNtYWpvbGZ2eGNheXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzI5MzcsImV4cCI6MjA4NTk0ODkzN30.6W6xvlBJQiy_nI3xwx9VpHfePdYNQm8ng6VhTocfuUg";

const newChallenges = [
  {
    title: "Urban Explorer",
    description: "Discover Muenster by cycling through different districts",
    type: "cycling",
    target_value: 60,
    target_unit: "km",
    points_bronze: 20,
    points_silver: 40,
    points_gold: 80,
    is_active: true
  },
  {
    title: "Weekend Wanderer",
    description: "Enjoy peaceful weekend walks around Muenster",
    type: "walking",
    target_value: 50,
    target_unit: "km",
    points_bronze: 18,
    points_silver: 35,
    points_gold: 70,
    is_active: true
  },
  {
    title: "Eco Commute Master",
    description: "Use eco-friendly transport for your daily commute",
    type: "cycling",
    target_value: 5,
    target_unit: "trips",
    points_bronze: 15,
    points_silver: 30,
    points_gold: 60,
    is_active: true
  },
  {
    title: "Park Jogger",
    description: "Run through Muenster parks and enjoy nature",
    type: "jogging",
    target_value: 50,
    target_unit: "km",
    points_bronze: 18,
    points_silver: 35,
    points_gold: 70,
    is_active: true
  },
  {
    title: "Car-Free Champion",
    description: "Go without your car for 7 complete days",
    type: "walking",
    target_value: 7,
    target_unit: "days",
    points_bronze: 25,
    points_silver: 50,
    points_gold: 100,
    is_active: true
  },
  {
    title: "Bike Squad Leader",
    description: "Complete 100 km of cycling challenges",
    type: "cycling",
    target_value: 100,
    target_unit: "km",
    points_bronze: 30,
    points_silver: 60,
    points_gold: 120,
    is_active: true
  },
  {
    title: "Green Tourist",
    description: "Walk 10 different interesting locations in Muenster",
    type: "walking",
    target_value: 10,
    target_unit: "trips",
    points_bronze: 20,
    points_silver: 40,
    points_gold: 80,
    is_active: true
  },
  {
    title: "Distance Milestone",
    description: "Accumulate 150 km of eco-friendly travel",
    type: "cycling",
    target_value: 150,
    target_unit: "km",
    points_bronze: 35,
    points_silver: 70,
    points_gold: 140,
    is_active: true
  },
  {
    title: "Jogging Enthusiast",
    description: "Complete 60 km of jogging distance",
    type: "jogging",
    target_value: 60,
    target_unit: "km",
    points_bronze: 20,
    points_silver: 40,
    points_gold: 80,
    is_active: true
  },
  {
    title: "Carbon Zero Hero",
    description: "Save 50 kg of CO2 through eco choices",
    type: "cycling",
    target_value: 50,
    target_unit: "km",
    points_bronze: 40,
    points_silver: 80,
    points_gold: 160,
    is_active: true
  }
];

async function insertChallenge(challenge) {
  const response = await fetch(SUPABASE_URL + "/rest/v1/challenges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": "Bearer " + ANON_KEY
    },
    body: JSON.stringify(challenge)
  });

  return {
    status: response.status,
    ok: response.ok,
    data: await response.json()
  };
}

async function verifyChallenges() {
  const response = await fetch(SUPABASE_URL + "/rest/v1/challenges?select=id,title", {
    method: "GET",
    headers: {
      "apikey": ANON_KEY,
      "Content-Type": "application/json"
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data.length;
  }
  return null;
}

async function main() {
  console.log("====================================================================");
  console.log("Green Muenster: Challenges Insertion Script");
  console.log("====================================================================");
  console.log();
  console.log("Total challenges to insert: " + newChallenges.length);
  console.log("Supabase URL: " + SUPABASE_URL);
  console.log();

  // Verify initial count
  console.log("Checking existing challenges...");
  const initialCount = await verifyChallenges();
  if (initialCount !== null) {
    console.log("Current challenges in database: " + initialCount);
  } else {
    console.log("Could not verify initial count");
  }
  console.log();

  let successful = 0;
  let failed = 0;
  const errors = [];
  const insertedChallenges = [];

  for (const challenge of newChallenges) {
    process.stdout.write("Inserting \"" + challenge.title + "\"... ");

    try {
      const result = await insertChallenge(challenge);

      if (result.ok) {
        console.log("SUCCESS");
        successful++;
        insertedChallenges.push(challenge.title);
      } else {
        console.log("FAILED (" + result.status + ")");
        failed++;
        errors.push({
          challenge: challenge.title,
          status: result.status,
          error: result.data
        });
      }
    } catch (error) {
      console.log("ERROR");
      failed++;
      errors.push({
        challenge: challenge.title,
        error: error.message
      });
    }
  }

  console.log();
  console.log("====================================================================");
  console.log("SUMMARY: " + successful + " successful, " + failed + " failed");
  console.log("====================================================================");

  if (insertedChallenges.length > 0) {
    console.log();
    console.log("Successfully inserted challenges:");
    insertedChallenges.forEach((title, index) => {
      console.log("  " + (index + 1) + ". " + title);
    });
  }

  if (errors.length > 0) {
    console.log();
    console.log("ERRORS ENCOUNTERED:");
    errors.forEach(err => {
      console.log("");
      console.log("  Challenge: " + err.challenge);
      if (err.status) {
        console.log("    HTTP Status: " + err.status);
      }
      if (err.error.message) {
        console.log("    Error: " + err.error.message);
      }
      if (err.error.hint) {
        console.log("    Hint: " + err.error.hint);
      }
    });

    if (failed === newChallenges.length) {
      console.log();
      console.log("All insertions failed. Possible causes:");
      console.log("  1. RLS policies not configured for INSERT operations");
      console.log("  2. Invalid or expired API key");
      console.log("  3. Database connection issues");
      console.log();
      console.log("To fix RLS policies, execute the SQL in add_insert_policy.sql");
      console.log("via the Supabase dashboard SQL editor.");
    }
  }

  // Verify final count
  console.log();
  console.log("Verifying insertion...");
  const finalCount = await verifyChallenges();
  if (finalCount !== null) {
    console.log("Final challenges in database: " + finalCount);
    if (initialCount !== null) {
      const added = finalCount - initialCount;
      console.log("Challenges added: " + added);
    }
  }

  console.log();
  if (successful === newChallenges.length) {
    console.log("SUCCESS: All 10 challenges inserted successfully!");
    process.exit(0);
  } else if (successful > 0) {
    console.log("PARTIAL SUCCESS: " + successful + " of " + newChallenges.length + " challenges inserted.");
    process.exit(1);
  } else {
    console.log("FAILED: No challenges were inserted. See errors above.");
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
