/**
 * auth.js — Auth Routes
 * POST /api/auth/register  → create an admin account
 * POST /api/auth/login     → get JWT token
 * GET  /api/auth/me        → get current user info
 */

const express = require("express");
const router  = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login",    authController.login);
router.get("/me",        authMiddleware, authController.me);

module.exports = router;
