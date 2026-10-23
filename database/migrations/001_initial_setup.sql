-- ═══════════════════════════════════════════════════════════════
--  MetroMind — Database Migration 001
--  File   : database/migrations/001_initial_setup.sql
--  Run    : psql -U metromind_user -d metromind_db -f 001_initial_setup.sql
-- ═══════════════════════════════════════════════════════════════

-- Create the database if it doesn't exist
-- (run as superuser if needed: CREATE DATABASE metromind_db OWNER metromind_user;)

-- Apply the main schema
\i ../schema/schema.sql

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 001 — Initial setup complete at %', NOW();
END $$;
