/**
 * db.js — Database Configuration
 * ─────────────────────────────────────────────────────────────
 * Sets up the PostgreSQL connection pool using the `pg` library.
 * All database queries go through this pool.
 */

const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME     || "metromind_db",
  user:     process.env.DB_USER     || "metromind_user",
  password: process.env.DB_PASSWORD || "",
  max:      20,               // max connections in pool
  idleTimeoutMillis:  30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.log("ℹ️   PostgreSQL not detected (localhost:5432).");
    console.log("    ⚡ Running in Standalone In-Memory mode — All routing, maps, and APIs work seamlessly!");
  } else {
    console.log(`✅  Connected to PostgreSQL database (${process.env.DB_NAME || "metromind_db"})`);
    release();
  }
});

module.exports = pool;
