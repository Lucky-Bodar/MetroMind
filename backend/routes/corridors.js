/**
 * corridors.js — Corridor Routes
 * GET /api/corridors           → list all named corridors
 * GET /api/corridors/:name     → corridor summary (heatmap data, D5)
 * GET /api/corridors/heatmap   → aggregated delay grid for dashboard
 */

const express    = require("express");
const router     = express.Router();
const corridorController = require("../controllers/corridorController");

router.get("/",          corridorController.getAllCorridors);
router.get("/heatmap",   corridorController.getHeatmap);
router.get("/:name",     corridorController.getCorridorByName);

module.exports = router;
