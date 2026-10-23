/**
 * auth.js — JWT Authentication Middleware
 * ─────────────────────────────────────────────────────────────
 * Validates the Bearer token in the Authorization header.
 * Attaches the decoded user payload to req.user.
 */

const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "dev_secret";

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided. Access denied." });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};
