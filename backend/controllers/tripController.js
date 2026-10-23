/**
 * tripController.js — Trip Controller
 * ─────────────────────────────────────────────────────────────
 * Handles saving and retrieving anonymous commuter trips (D2 dataset).
 * No personal data is stored — only a random trip ID, section-level
 * locations, and travel-time estimates.
 */

const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// In-memory fallback for local demo when PostgreSQL is not running
const inMemoryTrips = [];

/**
 * POST /api/trips
 * Body: { source, destination, startTime, mode, estimatedTime, corridors, consent }
 */
exports.saveTrip = async (req, res, next) => {
  try {
    const { source, destination, startTime, mode, estimatedTime, corridors, consent } = req.body;

    if (!consent) {
      return res.status(400).json({ success: false, message: "User consent is required to save a trip." });
    }
    if (!source || !destination || startTime === undefined || !mode || !estimatedTime) {
      return res.status(400).json({ success: false, message: "Missing required trip fields." });
    }

    // Generate anonymous IDs — no user-identifiable info stored
    const tripId   = "T-" + uuidv4().slice(0, 8).toUpperCase();
    const userId   = "U-" + uuidv4().slice(0, 6).toUpperCase();

    try {
      const query = `
        INSERT INTO trips (trip_id, user_id, source, destination, start_time, mode, estimated_time, corridors, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `;
      const values = [tripId, userId, source, destination, startTime, mode, estimatedTime, JSON.stringify(corridors || [])];
      const result = await db.query(query, values);

      return res.status(201).json({
        success: true,
        message: "Trip saved anonymously to PostgreSQL.",
        trip: result.rows[0],
      });
    } catch (dbErr) {
      console.warn("[Trips] PostgreSQL offline, saving in session memory:", dbErr.message);
      const trip = {
        trip_id: tripId,
        user_id: userId,
        source,
        destination,
        start_time: startTime,
        mode,
        estimated_time: estimatedTime,
        corridors: corridors || [],
        created_at: new Date().toISOString()
      };
      inMemoryTrips.unshift(trip);
      return res.status(201).json({
        success: true,
        message: "Trip saved anonymously (in-memory mode).",
        trip,
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/trips
 * Returns all saved trips (admin only, handled by auth middleware on route).
 */
exports.getAllTrips = async (req, res, next) => {
  try {
    try {
      const result = await db.query("SELECT * FROM trips ORDER BY created_at DESC LIMIT 500");
      res.json({ success: true, count: result.rowCount, trips: result.rows });
    } catch (dbErr) {
      res.json({ success: true, count: inMemoryTrips.length, trips: inMemoryTrips, source: "in_memory" });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/trips/:id
 */
exports.getTripById = async (req, res, next) => {
  try {
    try {
      const result = await db.query("SELECT * FROM trips WHERE trip_id = $1", [req.params.id]);
      if (!result.rowCount) return res.status(404).json({ success: false, message: "Trip not found." });
      res.json({ success: true, trip: result.rows[0] });
    } catch (dbErr) {
      const trip = inMemoryTrips.find(t => t.trip_id === req.params.id);
      if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });
      res.json({ success: true, trip });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/trips/:id
 */
exports.deleteTrip = async (req, res, next) => {
  try {
    try {
      await db.query("DELETE FROM trips WHERE trip_id = $1", [req.params.id]);
    } catch (dbErr) {
      const idx = inMemoryTrips.findIndex(t => t.trip_id === req.params.id);
      if (idx !== -1) inMemoryTrips.splice(idx, 1);
    }
    res.json({ success: true, message: "Trip deleted." });
  } catch (err) {
    next(err);
  }
};
