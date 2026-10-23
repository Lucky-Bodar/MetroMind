/**
 * weatherController.js — Weather Controller
 * ─────────────────────────────────────────────────────────────
 * Fetches current weather and forecast for Bengaluru from
 * OpenWeatherMap API (D4 dataset — external weather feed).
 * Translates API response to MetroMind weather codes:
 *   "clear" | "rain" | "heavy"
 */

const axios = require("axios");

const BENGALURU_LAT = 12.9716;
const BENGALURU_LNG = 77.5946;

/**
 * Maps OpenWeatherMap weather IDs to MetroMind weather codes.
 */
function mapWeatherCode(id) {
  if (id >= 502 && id <= 531) return "heavy";  // heavy rain
  if (id >= 300 && id <= 501) return "rain";   // drizzle / light rain
  return "clear";
}

/**
 * GET /api/weather/current
 */
exports.getCurrentWeather = async (req, res, next) => {
  try {
    const url = `${process.env.WEATHER_API_URL}/weather`
              + `?lat=${BENGALURU_LAT}&lon=${BENGALURU_LNG}`
              + `&units=metric&appid=${process.env.WEATHER_API_KEY}`;
    const { data } = await axios.get(url);

    res.json({
      success: true,
      city:        data.name,
      description: data.weather[0].description,
      code:        mapWeatherCode(data.weather[0].id),
      temp_c:      data.main.temp,
      humidity:    data.main.humidity,
      wind_kmh:    Math.round(data.wind.speed * 3.6),
      timestamp:   new Date().toISOString(),
    });
  } catch (err) {
    // In dev / offline, return mock data so frontend still works
    if (process.env.NODE_ENV === "development") {
      return res.json({
        success: true,
        city: "Bengaluru (mock)",
        description: "clear sky",
        code: "clear",
        temp_c: 24,
        humidity: 60,
        wind_kmh: 12,
        timestamp: new Date().toISOString(),
      });
    }
    next(err);
  }
};

/**
 * GET /api/weather/forecast
 * Returns 24-hour hourly forecast for Bengaluru.
 */
exports.getForecast = async (req, res, next) => {
  try {
    const url = `${process.env.WEATHER_API_URL}/forecast`
              + `?lat=${BENGALURU_LAT}&lon=${BENGALURU_LNG}`
              + `&units=metric&cnt=8&appid=${process.env.WEATHER_API_KEY}`;
    const { data } = await axios.get(url);

    const forecast = data.list.map(item => ({
      time:    item.dt_txt,
      code:    mapWeatherCode(item.weather[0].id),
      desc:    item.weather[0].description,
      temp_c:  item.main.temp,
    }));

    res.json({ success: true, forecast });
  } catch (err) {
    next(err);
  }
};
