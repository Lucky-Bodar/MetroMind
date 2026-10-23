/**
 * Trip model — field definitions and validation helpers.
 * (Not an ORM — MetroMind uses raw SQL via pg pool.)
 */

const VALID_MODES = ["car", "bike", "bus"];

/**
 * Validate a raw trip object before saving to the database.
 * @param {object} trip
 * @returns {{ valid:boolean, errors:string[] }}
 */
function validateTrip(trip) {
  const errors = [];
  if (!trip.source)          errors.push("source is required");
  if (!trip.destination)     errors.push("destination is required");
  if (trip.source === trip.destination) errors.push("source and destination must differ");
  if (trip.startTime === undefined || trip.startTime === null) errors.push("startTime is required");
  if (!VALID_MODES.includes(trip.mode)) errors.push(`mode must be one of: ${VALID_MODES.join(", ")}`);
  if (!trip.consent)         errors.push("user consent is required");
  return { valid: errors.length === 0, errors };
}

module.exports = { validateTrip, VALID_MODES };
