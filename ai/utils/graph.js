/**
 * ai/utils/graph.js
 * ─────────────────────────────────────────────────────────────
 * Re-exports corridor/node data for use by the Node.js backend
 * (so corridorController.js can import it without going to the DB).
 */

const { CORRIDORS: rawCorridors } = require("../../frontend/js/data.js");

// Re-export as CommonJS so backend controllers can require() it
module.exports = {
  CORRIDORS: rawCorridors,
};
