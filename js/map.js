/**
 * map.js — MetroMind
 * ─────────────────────────────────────────────────────────────
 * SVG-based interactive city map rendered inside #mapw.
 *
 * Responsibilities:
 *   • Project lat/lng → SVG pixel coordinates
 *   • Draw background grid, corridor outlines, node dots
 *   • Animate the selected route (coloured segments + moving dot)
 *   • Highlight the bottleneck with a pulsing ring
 *   • Zoom/pan with smooth easing animations (no external lib)
 */

import { NODES, ADJ, congestionColour } from "./routing.js";

/* ── SVG canvas dimensions ── */
const MAP_W = 620;
const MAP_H = 790;

/** Current viewBox [x, y, w, h]. Updated by setViewBox(). */
let viewBox = [0, 0, MAP_W, MAP_H];

/** requestAnimationFrame handle for the active zoom tween */
let tweenHandle = null;

/* ══════════════════════════════════════════════════════════════
   PROJECTION
   ══════════════════════════════════════════════════════════════ */

/**
 * Project a node's lat/lng to [svgX, svgY].
 * Linear projection calibrated to Bengaluru's bounding box.
 * @param {{lat:number,lng:number}} node
 * @returns {[number,number]}
 */
export function project(node) {
  const x = (node.lng - 77.47) / 0.33 * MAP_W;
  const y = (13.21 - node.lat) / 0.41 * MAP_H;
  return [x, y];
}

/* ══════════════════════════════════════════════════════════════
   VIEW-BOX ANIMATION
   ══════════════════════════════════════════════════════════════ */

function setViewBox(vb) {
  viewBox = vb;
  const svg = document.getElementById("mapw")?.firstChild;
  if (svg) svg.setAttribute("viewBox", vb.join(" "));
}

/** Cubic ease-in-out */
function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Smoothly animate the viewBox from current to `target`.
 * @param {number[]} target – [x, y, w, h]
 * @param {number}   ms     – animation duration ms
 */
export function zoomTo(target, ms = 900) {
  cancelAnimationFrame(tweenHandle);
  const from = viewBox.slice();
  const t0 = performance.now();

  function step(now) {
    const k = Math.min(1, (now - t0) / ms);
    const e = easeInOut(k);
    setViewBox(from.map((v, i) => v + (target[i] - v) * e));
    if (k < 1) tweenHandle = requestAnimationFrame(step);
  }
  tweenHandle = requestAnimationFrame(step);
}

/**
 * Compute a tight viewBox that fits all edge endpoints, with padding.
 * @param {object[]} edges
 * @returns {number[]} [x, y, w, h]
 */
export function fitBox(edges) {
  const pts = [];
  edges.forEach(e => { pts.push(project(NODES[e.a]), project(NODES[e.to])); });
  if (!pts.length) return [0, 0, MAP_W, MAP_H];

  const pad = 70;
  let x0 = Math.min(...pts.map(p => p[0])) - pad;
  let x1 = Math.max(...pts.map(p => p[0])) + pad;
  let y0 = Math.min(...pts.map(p => p[1])) - pad;
  let y1 = Math.max(...pts.map(p => p[1])) + pad;

  let w = x1 - x0;
  let h = y1 - y0;

  // Maintain aspect ratio of the #mapw container
  const mapEl = document.getElementById("mapw");
  const asp = mapEl ? mapEl.clientWidth / mapEl.clientHeight : 1;
  if (w / h < asp) { const nw = h * asp; x0 -= (nw - w) / 2; w = nw; }
  else             { const nh = w / asp;  y0 -= (nh - h) / 2; h = nh; }

  return [x0, y0, w, h];
}

/* ══════════════════════════════════════════════════════════════
   SVG BUILDER
   ══════════════════════════════════════════════════════════════ */

/**
 * Build and inject the SVG map into #mapw.
 *
 * @param {object|null} result – route result from routing.js, or null for idle map
 * @param {{src:object|null, dst:object|null}} selected – chosen source/dest nodes
 */
export function drawMap(result, selected) {
  let svg = `<svg viewBox="${viewBox.join(" ")}" preserveAspectRatio="xMidYMid meet">`;

  // ── Defs: gradient background, glow filter ──
  svg += `<defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0" stop-color="#12315c"/>
      <stop offset="1" stop-color="#081326"/>
    </radialGradient>
    <filter id="gl"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>`;

  // Background
  svg += `<rect x="-400" y="-400" width="1500" height="1700" fill="url(#bg)"/>`;

  // Grid lines (subtle overlay)
  for (let k = 0; k < 14; k++) {
    svg += `<line x1="${k*50}" y1="-400" x2="${k*50}" y2="1300" stroke="#ffffff" stroke-opacity=".035"/>`;
    svg += `<line y1="${k*65}" x1="-400" y2="${k*65}" x2="1000" stroke="#ffffff" stroke-opacity=".035"/>`;
  }

  // ── Corridor outlines (arterial road skeleton) ──
  const seenEdges = new Set();
  ADJ.forEach(map => map.forEach(e => {
    if (e.art && !seenEdges.has(e.key)) {
      seenEdges.add(e.key);
      const [ax, ay] = project(NODES[e.a]);
      const [bx, by] = project(NODES[e.to]);
      svg += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"
                stroke="#6f8fb8" stroke-opacity=".38" stroke-width="2.2" stroke-linecap="round"/>`;
    }
  }));

  // ── Alternate route (dashed purple, drawn under main route) ──
  if (result?.alt) {
    const d = result.alt.es.map((e, i) => {
      const [ax, ay] = project(NODES[e.a]);
      const [bx, by] = project(NODES[e.to]);
      return (i === 0 ? `M${ax} ${ay}` : "") + `L${bx} ${by}`;
    }).join("");
    svg += `<path class="alt" d="${d}" fill="none"
              stroke="#a78bfa" stroke-width="3.5" stroke-dasharray="7 6" stroke-linecap="round"/>`;
  }

  // Nodes on route (for highlight logic)
  const onRoute = new Set(
    result ? result.es.flatMap(e => [NODES[e.a].n, NODES[e.to].n]) : []
  );

  // ── All node dots ──
  NODES.forEach(node => {
    const [x, y] = project(node);
    const isOnRoute  = onRoute.has(node.n);
    const r = isOnRoute ? 4 : 2.6;
    const fill = isOnRoute ? "#fff" : "#9fb8d9";
    svg += `<circle class="nd" data-n="${node.n}"
               cx="${x}" cy="${y}" r="${r}" fill="${fill}">
              <title>${node.n} – click to set as source/destination</title>
            </circle>`;

    // Label: show for major hubs always; show for route nodes always
    const isMajor = !result && node.w >= 1.1;
    if (isMajor || isOnRoute) {
      svg += `<text x="${x + 6}" y="${y + 3}" font-size="9" fill="#cfe0f5"
                opacity=".85" style="pointer-events:none">${node.n.split(" (")[0]}</text>`;
    }
  });

  // ── Main route segments (coloured by congestion) ──
  if (result) {
    result.es.forEach((edge, i) => {
      const [ax, ay] = project(NODES[edge.a]);
      const [bx, by] = project(NODES[edge.to]);
      const cg = result.cur.rows[i].cg;
      svg += `<line pathLength="1" class="rt"
                style="animation-delay:${i * 0.12}s"
                x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"
                stroke="${congestionColour(cg)}" stroke-width="6" stroke-linecap="round"/>`;
    });

    // Animated traveller dot along route
    const routePath = result.es.map((e, i) => {
      const [ax, ay] = project(NODES[e.a]);
      const [bx, by] = project(NODES[e.to]);
      return (i === 0 ? `M${ax} ${ay}` : "") + `L${bx} ${by}`;
    }).join("");
    const dur = Math.max(5, result.es.length * 0.9);
    svg += `<path id="rp" d="${routePath}" fill="none"/>
            <circle r="6" fill="#ffb020" stroke="#fff" stroke-width="2">
              <animateMotion dur="${dur}s" begin="1.6s" repeatCount="indefinite">
                <mpath href="#rp"/>
              </animateMotion>
            </circle>`;

    // Bottleneck pulse marker
    const bn = result.bn;
    if (bn && bn.cg >= 30) {
      const [ax, ay] = project(NODES[bn.e.a]);
      const [bx, by] = project(NODES[bn.e.to]);
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      svg += `<circle class="pr" cx="${mx}" cy="${my}" r="9"
                fill="none" stroke="#e0443a" stroke-width="3"/>
              <text x="${mx + 12}" y="${my - 10}" font-size="11" font-weight="700"
                fill="#ffb4ad" style="pointer-events:none">bottleneck</text>`;
    }
  }

  // ── Source / destination markers ──
  [["src", "#22b573", "A"], ["dst", "#e0443a", "B"]].forEach(([role, colour, letter]) => {
    const node = selected[role];
    if (!node) return;
    const [x, y] = project(node);
    svg += `<circle class="pr" cx="${x}" cy="${y}" r="9" fill="${colour}" opacity=".6"/>
            <circle cx="${x}" cy="${y}" r="10" fill="${colour}" stroke="#fff" stroke-width="2.5"/>
            <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11"
              font-weight="800" fill="#fff" style="pointer-events:none">${letter}</text>
            <text x="${x + 14}" y="${y - 12}" font-size="12" font-weight="700"
              fill="#fff" style="pointer-events:none">${node.n.split(" (")[0]}</text>`;
  });

  svg += "</svg>";
  document.getElementById("mapw").innerHTML = svg;
}
