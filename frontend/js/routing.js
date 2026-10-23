/**
 * routing.js — MetroMind
 * ─────────────────────────────────────────────────────────────
 * Builds the city road graph and provides:
 *   • Graph construction  (buildGraph)
 *   • Travel-time estimation per edge (ttiEstimate, edgeMinutes)
 *   • Dijkstra shortest-path  (findPath)
 *   • Full route evaluation   (evaluatePath)
 *   • Utility helpers         (haversine, gaussian, hash, …)
 *
 * Datasets used (simulated):
 *   D1 – Historical traffic index (baseline × hour pattern)
 *   D2 – Incident reports (optional override)
 *   D3 – Live sensor feed (optional blending)
 *   D4 – Road-network graph + weather multiplier
 */

import { RAW_NODES, CORRIDORS } from "./data.js";

/* ── Exported mutable node array (online search may append nodes) ── */
export let NODES = RAW_NODES.map(n => ({ ...n }));

/** Number of static nodes (before any online additions) */
export const BASE_NODE_COUNT = NODES.length;

/* ── Adjacency list: NODES.length Maps of  nodeIndex → edge ── */
/** @type {Map<number, {a:number,to:number,len:number,art:boolean,corr:string,key:string,fs:number}>[]} */
export let ADJ = [];

/* ══════════════════════════════════════════════════════════════
   GEOMETRY & HASH UTILITIES
   ══════════════════════════════════════════════════════════════ */

/**
 * Haversine great-circle distance (km) between two lat/lng points.
 * @param {{lat:number,lng:number}} a
 * @param {{lat:number,lng:number}} b
 * @returns {number}
 */
export function haversine(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dl = (b.lat - a.lat) * r;
  const dg = (b.lng - a.lng) * r;
  const x = Math.sin(dl / 2) ** 2
           + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * Gaussian bell-curve value.
 * Used to model morning/evening rush-hour peaks.
 */
function gaussian(h, mean, sigma) {
  return Math.exp(-((h - mean) ** 2) / (2 * sigma * sigma));
}

/**
 * Deterministic pseudo-random [0, 1) from a string seed.
 * Replaces `Math.random()` so results are reproducible per (edge, timeslot).
 */
export function seededHash(seed) {
  let h = 2166136261;
  for (const c of String(seed)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1000 / 1000;
}

/* ══════════════════════════════════════════════════════════════
   GRAPH CONSTRUCTION
   ══════════════════════════════════════════════════════════════ */

/**
 * Rebuild the adjacency list from NODES and CORRIDORS.
 * Must be called once at startup, and again whenever NODES changes
 * (e.g., after an online place search appends a custom node).
 */
export function buildGraph() {
  ADJ = NODES.map(() => new Map());

  /**
   * Add a directed edge in both directions, keeping arterial edges
   * when a duplicate exists.
   */
  function addEdge(idxA, idxB, isArterial, corridorName) {
    const len = haversine(NODES[idxA], NODES[idxB]) * 1.3; // tortuosity factor
    const key = [NODES[idxA].n, NODES[idxB].n].sort().join("|");
    const freeSpeed = isArterial ? 42 : 28; // km/h

    [[idxA, idxB], [idxB, idxA]].forEach(([from, to]) => {
      const existing = ADJ[from].get(to);
      if (!existing || (isArterial && !existing.art)) {
        ADJ[from].set(to, { a: from, to, len, art: isArterial, corr: corridorName, key, fs: freeSpeed });
      }
    });
  }

  // ① Proximity edges: connect each node to its 4 nearest neighbours
  NODES.forEach((p, i) => {
    NODES
      .map((q, j) => [j, haversine(p, q)])
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 4)
      .forEach(([j]) => addEdge(i, j, false, ""));
  });

  // ② Corridor (arterial) edges along defined road sequences
  const indexOf = name => NODES.findIndex(n => n.n === name);
  CORRIDORS.forEach(([corridorName, stops]) => {
    for (let k = 0; k < stops.length - 1; k++) {
      addEdge(indexOf(stops[k]), indexOf(stops[k + 1]), true, corridorName);
    }
  });
}

// Initial build
buildGraph();

/* ══════════════════════════════════════════════════════════════
   TRAVEL-TIME ESTIMATION  (simulates D1 + D3 + D4)
   ══════════════════════════════════════════════════════════════ */

/**
 * Traffic Time Index (TTI) for a single edge at a given hour.
 * TTI > 1 means congestion; TTI = 1 is free flow.
 *
 * Model:
 *   base TTI = 1 + nodeWeight × (morning peak + evening peak + midday)
 *            × weekday/weekend scale × per-edge random variation
 *   weather  = additive rain slowdown
 *   incident = +0.6 TTI spike on the affected edge
 *   live D3  = replaces 65% of estimate with a random current slot value
 *
 * @param {object} edge   – graph edge object
 * @param {number} hour   – decimal hour (e.g. 8.5 = 08:30)
 * @param {object} config – { we:bool, wx:"clear"|"rain"|"heavy", inc:string }
 * @param {boolean} useLive – whether D3 live feed is enabled
 * @returns {number} TTI ≥ 1
 */
export function ttiEstimate(edge, hour, config, useLive) {
  const A = NODES[edge.a];
  const B = NODES[edge.to];

  // Average node weight; arterial roads get full weight, local get 72%
  const w = ((A.w + B.w) / 2) * (edge.art ? 1 : 0.72);
  const weekdayScale = config.we ? 0.55 : 1;   // weekends are calmer

  // Per-edge variation (stable across calls for same edge + side)
  const k1 = 0.8 + 0.4 * seededHash(edge.key + "a");
  const k2 = 0.8 + 0.4 * seededHash(edge.key + "b");

  // Morning peak 08:48, evening peak 18:18, mild midday bump
  let tti = 1 + w * (
    0.95 * (gaussian(hour, 8.8, 1.25) * k1 + gaussian(hour, 18.3, 1.5) * k2)
    + 0.15 * gaussian(hour, 13, 2.5)
  ) * weekdayScale;

  // D4: weather impact
  const weatherImpact = { clear: [0, 0], rain: [0.25, 0.05], heavy: [0.5, 0.12] }[config.wx];
  tti = 1 + (tti - 1) * (1 + weatherImpact[0]) + weatherImpact[1];

  // D2: incident spike
  if (config.inc === edge.key) tti += 0.6;

  // D3: live sensor blending (65% live, 35% baseline)
  if (useLive) {
    const liveNoise = (seededHash(edge.key + Math.floor(hour * 12)) - 0.5) * 0.2;
    tti *= 1 + 0.65 * liveNoise;
  } else {
    tti *= 1.03; // fallback correction (D2 historical bias)
  }

  return Math.max(1, tti);
}

/**
 * Travel time (minutes) for one edge given current TTI.
 * @param {object} edge
 * @param {number} hour
 * @param {object} config
 * @param {boolean} useLive
 * @returns {number}
 */
export function edgeMinutes(edge, hour, config, useLive) {
  return (edge.len / (edge.fs / ttiEstimate(edge, hour, config, useLive))) * 60;
}

/* ══════════════════════════════════════════════════════════════
   MODE ADJUSTMENT
   ══════════════════════════════════════════════════════════════ */

/**
 * Adjust estimated travel time for mode of transport.
 * @param {number} minutes
 * @param {"car"|"bike"|"bus"} mode
 * @returns {number}
 */
export function adjustForMode(minutes, mode) {
  if (mode === "bike") return minutes * 0.85;          // bikes skip some queues
  if (mode === "bus")  return minutes * 1.1 + 7;       // bus stops + boarding
  return minutes;
}

/* ══════════════════════════════════════════════════════════════
   DIJKSTRA SHORTEST PATH
   ══════════════════════════════════════════════════════════════ */

/**
 * Find the shortest-time path from node `src` to node `dst`.
 * Uses Dijkstra's algorithm over the ADJ adjacency list.
 *
 * @param {number}  src      – source node index
 * @param {number}  dst      – destination node index
 * @param {number}  startHr  – departure hour (decimal)
 * @param {object}  config   – { we, wx, inc }
 * @param {boolean} useLive
 * @param {Set<string>|null} penalise – edge keys to penalise (alternate routing)
 * @returns {object[]|null} ordered edge array, or null if unreachable
 */
export function findPath(src, dst, startHr, config, useLive, penalise) {
  const n = NODES.length;
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(null);
  const visited = new Array(n).fill(false);
  dist[src] = 0;

  for (;;) {
    // Pick unvisited node with smallest tentative distance
    let u = -1, best = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i] < best) { best = dist[i]; u = i; }
    }
    if (u < 0 || u === dst) break;
    visited[u] = true;

    for (const edge of ADJ[u].values()) {
      const penaltyFactor = penalise?.has(edge.key) ? 1.7 : 1;
      const cost = edgeMinutes(edge, startHr + dist[u] / 60, config, useLive) * penaltyFactor;
      if (dist[u] + cost < dist[edge.to]) {
        dist[edge.to] = dist[u] + cost;
        prev[edge.to] = edge;
      }
    }
  }

  if (!prev[dst]) return null; // no route

  // Reconstruct edge sequence
  const edges = [];
  for (let v = dst; v !== src;) {
    const e = prev[v];
    edges.unshift(e);
    v = e.a;
  }
  return edges;
}

/* ══════════════════════════════════════════════════════════════
   ROUTE EVALUATION
   ══════════════════════════════════════════════════════════════ */

/**
 * Evaluate a sequence of edges: compute per-section stats.
 *
 * @param {object[]} edges
 * @param {number}   startHr
 * @param {"car"|"bike"|"bus"} mode
 * @param {object}   config
 * @param {boolean}  useLive
 * @param {{rows:object[],keys:Set<string>}|null} primaryRoute
 *   – if provided, checks whether alternate pushes nearby roads above 75%
 * @returns {{tot:number, free:number, dist:number, rows:object[], ok:boolean,
 *            st:number, mode:string, keys:Set<string>}}
 */
export function evaluatePath(edges, startHr, mode, config, useLive, primaryRoute) {
  let clock = startHr;
  let totalMins = 0, freeFlowMins = 0, totalDist = 0;
  let spilloverOk = true;
  const rows = [];

  // Average excess delay on primary route (used for spill-over check)
  const avgExcess = primaryRoute
    ? primaryRoute.rows.reduce((a, r) => a + r.t - 1, 0) / primaryRoute.rows.length
    : 0;

  for (const edge of edges) {
    const tti      = ttiEstimate(edge, clock, config, useLive);
    const mins     = (edge.len / (edge.fs / tti)) * 60;
    const freeMins = (edge.len / edge.fs) * 60;

    // Spill-over check: would this edge push nearby roads above 75%?
    let spilloverCong = 0;
    if (primaryRoute && !primaryRoute.keys.has(edge.key)) {
      spilloverCong = congestionPct(tti + 0.08 * avgExcess * 2.5);
      if (spilloverCong > 75) spilloverOk = false;
    }

    rows.push({
      e: edge,
      from:  NODES[edge.a].n,
      to:    NODES[edge.to].n,
      len:   edge.len,
      mins,
      fm:    freeMins,
      t:     tti,
      cg:    congestionPct(tti),
      clk:   clock,
      sp:    spilloverCong,
      veh:   Math.round(115 * tti + seededHash(edge.key + clock) * 10),
    });

    clock += mins / 60;
    totalMins += mins;
    freeFlowMins += freeMins;
    totalDist += edge.len;
  }

  return {
    tot:  adjustForMode(totalMins, mode),
    free: adjustForMode(freeFlowMins, mode),
    dist: totalDist,
    rows,
    ok:   spilloverOk,
    st:   startHr,
    mode,
    keys: new Set(edges.map(e => e.key)),
  };
}

/* ══════════════════════════════════════════════════════════════
   CONGESTION HELPERS
   ══════════════════════════════════════════════════════════════ */

/** Convert TTI to a 0-100% congestion index. */
export function congestionPct(tti) {
  return Math.min(100, Math.round(100 * (1 - 1 / tti) * 1.7));
}

/** CSS colour for a congestion level. */
export function congestionColour(pct) {
  if (pct < 30) return "#22b573"; // free
  if (pct < 55) return "#f2c024"; // moderate
  if (pct < 75) return "#f08a2b"; // heavy
  return "#e0443a";               // severe
}

/** Human-readable label for a congestion level. */
export function congestionLabel(pct) {
  if (pct < 30) return "Free flow";
  if (pct < 55) return "Moderate";
  if (pct < 75) return "Heavy";
  return "Severe";
}

/** Format a decimal hour as "HH:MM". */
export function fmtTime(h) {
  h = ((h % 24) + 24) % 24;
  const mins = Math.round(h * 60);
  return String(Math.floor(mins / 60) % 24).padStart(2, "0") + ":"
       + String(mins % 60).padStart(2, "0");
}
