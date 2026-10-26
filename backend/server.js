/**
 * server.js — MetroMind Backend Entry Point
 * ─────────────────────────────────────────────────────────────
 * Express.js REST API server
 * Serves the trip analysis, corridor data, and trip-save endpoints.
 *
 * Run:  node server.js   (or: nodemon server.js)
 *
 * Author : Alliance University – Design Project I (E1CSA313)
 * Sem    : 5th  |  Batch: 2023–27
 */

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const path       = require("path");
const fs = require("fs");
const envPath = path.join(__dirname, "../env/.env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  require("dotenv").config();
}

const tripRoutes      = require("./routes/trips");
const corridorRoutes  = require("./routes/corridors");
const weatherRoutes   = require("./routes/weather");
const aiRoutes        = require("./routes/ai");
const authRoutes      = require("./routes/auth");
const errorHandler    = require("./middleware/errorHandler");
const rateLimiter     = require("./middleware/rateLimiter");

const app      = express();
const PORT     = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

/* ── Security & middleware ── */
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* ── Static frontend (never rate-limited) ── */
app.use(express.static(path.join(__dirname, "../frontend")));

/* ── API routes (rate-limited) ── */
app.use("/api", rateLimiter);
app.use("/api/trips",     tripRoutes);
app.use("/api/corridors", corridorRoutes);
app.use("/api/weather",   weatherRoutes);
app.use("/api/ai",        aiRoutes);
app.use("/api/auth",      authRoutes);

/* ── Health check ── */
app.get("/api/health", (req, res) => {
  res.json({
    status:  "ok",
    service: "MetroMind API",
    version: "1.0.0",
    time:    new Date().toISOString(),
  });
});

/* ── Search Engine Optimization (SEO) & Web Standards ── */
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.sendFile(path.join(__dirname, "../frontend/robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.sendFile(path.join(__dirname, "../frontend/sitemap.xml"));
});

app.get("/site.webmanifest", (req, res) => {
  res.type("application/manifest+json");
  res.sendFile(path.join(__dirname, "../frontend/site.webmanifest"));
});

/* ── Fallback: serve frontend SPA ── */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* ── Global error handler ── */
app.use(errorHandler);

/* ── Start server ── */
app.listen(PORT, () => {
  console.log(`\n===========================================================`);
  console.log(`🚀  MetroMind Server running at http://localhost:${PORT}`);
  console.log(`    Design Project – I (E1CSA313) · Alliance University`);
  console.log(`    Environment : ${NODE_ENV}`);
  console.log(`    Frontend    : http://localhost:${PORT}`);
  console.log(`    Health API  : http://localhost:${PORT}/api/health`);
  console.log(`===========================================================\n`);
});

module.exports = app;
