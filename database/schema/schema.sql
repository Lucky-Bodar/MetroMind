-- ═══════════════════════════════════════════════════════════════
--  MetroMind Database Schema
--  File : database/schema/schema.sql
--  DB   : PostgreSQL 15+
--
--  Tables:
--    admins              — admin users (JWT auth)
--    trips               — anonymous commuter trip records (D2)
--    live_sensor_slots   — 5-min corridor sensor snapshots (D3)
--    corridor_summary    — materialised view aggregating D2+D3 → D5
--
--  Run:  psql -U metromind_user -d metromind_db -f schema.sql
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
--  Table: admins
--  Stores admin accounts for dashboard access only.
--  Commuters are never stored here.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT        NOT NULL,
    name          VARCHAR(100),
    created_at    TIMESTAMP   DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  Table: trips
--  Anonymous commuter trip records (Dataset D2).
--  No names, phone numbers or home addresses stored.
--  trip_id and user_id are random — cannot be linked to a person.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
    id              SERIAL      PRIMARY KEY,
    trip_id         VARCHAR(20) UNIQUE NOT NULL,   -- e.g. T-0028A1B3
    user_id         VARCHAR(20) NOT NULL,           -- e.g. U-4F2C   (anonymous)
    source          VARCHAR(150) NOT NULL,
    destination     VARCHAR(150) NOT NULL,
    start_time      FLOAT        NOT NULL,          -- decimal hour  e.g. 8.5 = 08:30
    mode            VARCHAR(10)  NOT NULL           CHECK (mode IN ('car','bike','bus')),
    estimated_time  FLOAT        NOT NULL,          -- minutes
    corridors       JSONB        DEFAULT '[]',      -- corridor names the trip passed through
    weather_code    VARCHAR(10)  DEFAULT 'clear'    CHECK (weather_code IN ('clear','rain','heavy')),
    day_type        VARCHAR(10)  DEFAULT 'weekday'  CHECK (day_type IN ('weekday','weekend')),
    consent         BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_start_time  ON trips (start_time);
CREATE INDEX IF NOT EXISTS idx_trips_mode         ON trips (mode);
CREATE INDEX IF NOT EXISTS idx_trips_created_at   ON trips (created_at DESC);

-- ─────────────────────────────────────────────────────────────
--  Table: live_sensor_slots
--  5-minute sensor snapshots per corridor (Dataset D3 simulation).
--  In production these would be written by a real-time ingestion
--  pipeline; here a cron job / seeder populates sample data.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_sensor_slots (
    id              SERIAL      PRIMARY KEY,
    corridor_name   VARCHAR(100) NOT NULL,
    slot_time       TIMESTAMP    NOT NULL,          -- rounded to nearest 5 min
    avg_speed_kmh   FLOAT,
    vehicle_count   INTEGER,
    congestion_pct  INTEGER      CHECK (congestion_pct BETWEEN 0 AND 100),
    tti             FLOAT        DEFAULT 1.0,       -- Traffic Time Index
    created_at      TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_corridor ON live_sensor_slots (corridor_name, slot_time DESC);

-- ─────────────────────────────────────────────────────────────
--  Materialised View: corridor_summary  (Dataset D5)
--  Aggregates D2 trips + D3 sensor data per corridor per hour.
--  REFRESH MATERIALIZED VIEW corridor_summary;  -- run after bulk inserts
-- ─────────────────────────────────────────────────────────────
CREATE MATERIALIZED VIEW IF NOT EXISTS corridor_summary AS
SELECT
    jsonb_array_elements_text(corridors) AS corridor_name,
    FLOOR(start_time)::INTEGER           AS hour,
    COUNT(*)                             AS trip_count,
    AVG(estimated_time)                  AS avg_time_minutes,
    AVG(estimated_time - (
        (estimated_time / (1 + GREATEST(0, (start_time - 8) * 0.05)))
    ))                                   AS avg_delay_minutes,
    mode,
    day_type
FROM trips
GROUP BY corridor_name, hour, mode, day_type
HAVING COUNT(*) >= 5   -- privacy threshold: hide cells with < 5 trips
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_corridor_summary_pk
    ON corridor_summary (corridor_name, hour, mode, day_type);
