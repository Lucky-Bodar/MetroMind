/**
 * rateLimiter.js — API Rate Limiting Middleware
 * Prevents abuse using express-rate-limit.
 * Applied ONLY to /api/* routes, never to static assets.
 */

const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 200 : 5000, // Generous in development
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again in 15 minutes.",
  },
});

