/**
 * db.js — Database Configuration
 * ─────────────────────────────────────────────────────────────
 * Sets up the PostgreSQL connection pool using the `pg` library.
 * All database queries go through this pool.
 */

const path = require("path");
const fs = require("fs");
[
  path.join(__dirname, "../../.env"),
  path.join(__dirname, "../.env"),
  path.join(__dirname, "../../env/.env"),
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), "env/.env"),
].forEach(p => {
  if (fs.existsSync(p)) require("dotenv").config({ path: p });
});
require("dotenv").config();

const { Pool } = require("pg");

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL.includes("neon.tech") || process.env.DATABASE_URL.includes("supabase")
        ? { rejectUnauthorized: false }
        : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host:     process.env.DB_HOST     || "localhost",
      port:     parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME     || "metromind_db",
      user:     process.env.DB_USER     || "metromind_user",
      password: process.env.DB_PASSWORD || "",
      max:      20,
      idleTimeoutMillis:  30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.log("ℹ️   PostgreSQL not connected:", err.message || err);
    console.log("    ⚡ Running in Standalone In-Memory mode — All routing, maps, and APIs work seamlessly!");
  } else {
    const target = process.env.DATABASE_URL ? "Neon Cloud PostgreSQL" : (process.env.DB_NAME || "metromind_db");
    console.log(`✅  Connected to PostgreSQL database (${target})`);
    release();
  }
});

module.exports = pool;
