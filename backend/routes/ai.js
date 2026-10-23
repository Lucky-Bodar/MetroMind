/**
 * ai.js — AI/ML Inference Routes
 * POST /api/ai/predict   → get congestion prediction from Python model
 * POST /api/ai/route     → full route analysis via AI service
 * GET  /api/ai/status    → check if AI model service is online
 */

const express = require("express");
const router  = express.Router();
const aiController = require("../controllers/aiController");

router.post("/predict", aiController.predict);
router.post("/route",   aiController.analyseRoute);
router.get("/status",   aiController.getStatus);

module.exports = router;
