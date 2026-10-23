/**
 * aiController.js — AI/ML Controller
 * ─────────────────────────────────────────────────────────────
 * Bridges the Node.js backend to the Python AI microservice
 * (runs separately on port 5001).
 * Falls back to the JS simulation model when the service is offline.
 */

const axios = require("axios");

const AI_URL = process.env.AI_MODEL_URL || "http://localhost:5001";

/**
 * POST /api/ai/predict
 * Body: { corridorKey, hour, dayType, weatherCode }
 */
exports.predict = async (req, res, next) => {
  try {
    const { corridorKey, hour, dayType, weatherCode } = req.body;
    if (!corridorKey || hour === undefined) {
      return res.status(400).json({ success: false, message: "Missing corridorKey or hour." });
    }

    const { data } = await axios.post(`${AI_URL}/predict`, {
      corridor_key: corridorKey,
      hour,
      day_type:     dayType    || "weekday",
      weather_code: weatherCode || "clear",
    }, { timeout: 5000 });

    res.json({ success: true, prediction: data });
  } catch (err) {
    // AI service offline — return a simple heuristic fallback
    const fallback = simulatePrediction(req.body);
    res.json({ success: true, prediction: fallback, source: "fallback_js" });
  }
};

/**
 * POST /api/ai/route
 * Full route analysis forwarded to the Python service.
 */
exports.analyseRoute = async (req, res, next) => {
  try {
    const { data } = await axios.post(`${AI_URL}/route`, req.body, { timeout: 10000 });
    res.json({ success: true, result: data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/ai/status
 */
exports.getStatus = async (req, res) => {
  try {
    const { data } = await axios.get(`${AI_URL}/health`, { timeout: 3000 });
    res.json({ success: true, ai_online: true, info: data });
  } catch {
    res.json({ success: true, ai_online: false, info: "AI service offline — using JS fallback." });
  }
};

/* ── JS fallback (mirrors the browser simulation) ── */
function simulatePrediction({ hour = 8, dayType = "weekday", weatherCode = "clear" }) {
  const peak = 0.95 * (gauss(hour,8.8,1.25) + gauss(hour,18.3,1.5)) + 0.15 * gauss(hour,13,2.5);
  const wd   = dayType === "weekend" ? 0.55 : 1;
  const wx   = { clear:[0,0], rain:[0.25,0.05], heavy:[0.5,0.12] }[weatherCode] || [0,0];
  let tti    = 1 + peak * wd;
  tti = 1 + (tti-1)*(1+wx[0]) + wx[1];
  return { tti: +tti.toFixed(3), congestion_pct: Math.min(100, Math.round(100*(1-1/tti)*1.7)) };
}
function gauss(h, m, s) { return Math.exp(-((h-m)**2)/(2*s*s)); }
