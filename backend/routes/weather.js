/**
 * weather.js — Weather Routes
 * GET /api/weather/current   → current weather for Bengaluru (D4)
 * GET /api/weather/forecast  → 24-h forecast
 */

const express  = require("express");
const router   = express.Router();
const weatherController = require("../controllers/weatherController");

router.get("/current",  weatherController.getCurrentWeather);
router.get("/forecast", weatherController.getForecast);

module.exports = router;
