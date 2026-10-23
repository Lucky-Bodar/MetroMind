/**
 * authController.js — Auth Controller
 * ─────────────────────────────────────────────────────────────
 * Simple JWT-based auth for admin access to trip data.
 * Commuters do NOT need to log in — trips are saved anonymously.
 */

const db     = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

const SECRET  = process.env.JWT_SECRET  || "dev_secret";
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

/**
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

    const hashed = await bcrypt.hash(password, 12);
    const result = await db.query(
      "INSERT INTO admins (email, password_hash, name, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id, email, name",
      [email, hashed, name || "Admin"]
    );

    res.status(201).json({ success: true, admin: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ success: false, message: "Email already registered." });
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await db.query("SELECT * FROM admins WHERE email = $1", [email]);
    if (!result.rowCount) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const token = jwt.sign({ id: admin.id, email: admin.email }, SECRET, { expiresIn: EXPIRES });
    res.json({ success: true, token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
exports.me = async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, email, name FROM admins WHERE id = $1", [req.user.id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, admin: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
