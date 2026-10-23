/**
 * trips.js — Trip Routes
 * POST /api/trips       → save an anonymous trip (D2)
 * GET  /api/trips       → get all saved trips (admin / dashboard)
 * GET  /api/trips/:id   → get a single trip by ID
 * DELETE /api/trips/:id → delete a trip (admin only)
 */

const express = require("express");
const router  = express.Router();
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/auth");

// Save a new anonymous trip (consent required)
router.post("/",     tripController.saveTrip);

// Get all trips — admin only
router.get("/",      authMiddleware, tripController.getAllTrips);

// Get a single trip
router.get("/:id",   tripController.getTripById);

// Delete a trip — admin only
router.delete("/:id", authMiddleware, tripController.deleteTrip);

module.exports = router;
