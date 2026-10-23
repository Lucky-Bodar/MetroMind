/**
 * errorHandler.js — Global Error Handler Middleware
 */

module.exports = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);

  const status  = err.status  || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    error:   message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
