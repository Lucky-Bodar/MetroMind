/**
 * seed.js — MetroMind Database Seeder
 * ─────────────────────────────────────────────────────────────
 * Inserts sample trip records and live sensor slots for dev/demo.
 * Run: node database/seeds/seed.js
 *
 * Author : Alliance University – Design Project I (E1CSA313)
 */

const { Pool } = require("pg");
const path     = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../env/.env") });

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("neon.tech") || process.env.DATABASE_URL.includes("supabase")
        ? { rejectUnauthorized: false }
        : false,
    }
  : {
      host:     process.env.DB_HOST || "localhost",
      port:     parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "metromind_db",
      user:     process.env.DB_USER || "metromind_user",
      password: process.env.DB_PASSWORD || "",
    };

const pool = new Pool(poolConfig);

// Sample corridors for seeding
const CORRIDORS = [
  "Outer Ring Road (East)",
  "Hosur Road",
  "Bellary Road",
  "Old Airport Road",
  "Whitefield Road",
];

const MODES   = ["car", "bike", "bus"];
const DAY     = ["weekday", "weekend"];
const WEATHER = ["clear", "rain", "heavy"];

/** Generate a pseudo-random anonymous trip for seeding */
function randomTrip(i) {
  const src = ["Whitefield", "Hebbal", "Kengeri", "Yelahanka", "Koramangala"][i % 5];
  const dst = ["Electronic City", "MG Road", "Indiranagar", "Silk Board", "Majestic (KSR Station)"][i % 5];
  const st  = 6 + Math.floor(Math.random() * 14) + Math.random(); // 6:00 – 19:59
  const mode = MODES[i % 3];
  const corrs = [CORRIDORS[i % CORRIDORS.length]];
  return {
    trip_id:        `T-SEED-${String(i).padStart(4,"0")}`,
    user_id:        `U-SEED-${String(i).padStart(3,"0")}`,
    source:         src,
    destination:    dst,
    start_time:     +st.toFixed(2),
    mode,
    estimated_time: 20 + Math.random() * 60,
    corridors:      JSON.stringify(corrs),
    weather_code:   WEATHER[i % 3],
    day_type:       DAY[i % 2],
    consent:        true,
  };
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱  Seeding MetroMind database…");

    // Clear existing seed data
    await client.query("DELETE FROM trips WHERE trip_id LIKE 'T-SEED-%'");

    // Insert 200 sample trips
    for (let i = 0; i < 200; i++) {
      const t = randomTrip(i);
      await client.query(
        `INSERT INTO trips (trip_id, user_id, source, destination, start_time, mode,
           estimated_time, corridors, weather_code, day_type, consent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (trip_id) DO NOTHING`,
        [t.trip_id, t.user_id, t.source, t.destination, t.start_time,
         t.mode, t.estimated_time, t.corridors, t.weather_code, t.day_type, t.consent]
      );
    }
    console.log("   ✅  Inserted 200 sample trips");

    // Refresh the materialised view
    await client.query("REFRESH MATERIALIZED VIEW corridor_summary");
    console.log("   ✅  Refreshed corridor_summary view");
    console.log("🎉  Seeding complete!");
  } catch (err) {
    console.error("❌  Seed error:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
