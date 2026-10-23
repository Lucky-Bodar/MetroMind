/**
 * ui.js — MetroMind Frontend
 * ------------------------------------------------------------------
 * Handles all DOM interactions:
 *   - Autocomplete (source/destination inputs)
 *   - Tab/nav switching with sliding pill
 *   - Trip form submission & pipeline animation
 *   - Results rendering (KPIs, bottleneck, suggestion, tables)
 *   - Travel-time chart & slider
 *   - Consent + trip-save flow
 *   - Toast notifications & ripple effects
 *
 * Imports routing, map modules and calls backend API via api.js
 * ------------------------------------------------------------------
 * Author : Alliance University – Design Project I (E1CSA313)
 * Sem    : 5th  |  Batch: 2023–27
 */

import { NODES, ADJ, ttiEstimate, buildGraph, findPath, evaluatePath, congestionPct,
         congestionColour, congestionLabel, fmtTime,
         seededHash, adjustForMode } from "./routing.js";
import { drawMap, zoomTo, fitBox, project } from "./map.js";
import { CORRIDORS } from "./data.js";

/* ── shorthand ── */
const $ = id => document.getElementById(id);

/* ── app state ── */
let SEL    = { src: null, dst: null };   // selected nodes
let RES    = null;                        // last route result
let CONFIG = {};                          // current form config
let TRIPS  = [];                          // saved trips (session)

const MODE_LABELS = { car: "Car", bike: "Two-wheeler", bus: "Bus" };

/* ════════════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════════════ */
export function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("on"), 3400);
}

/* ════════════════════════════════════════════════════════════════
   SCROLL-REVEAL
   ════════════════════════════════════════════════════════════════ */
export function reveal(root) {
  root.querySelectorAll(".rv").forEach((el, i) => {
    el.style.setProperty("--i", i);
    el.classList.remove("rv-go");
    void el.offsetWidth; // reflow
    el.classList.add("rv-go");
  });
}

/* ════════════════════════════════════════════════════════════════
   COUNTER ANIMATION
   ════════════════════════════════════════════════════════════════ */
function animateCount(el, to, decimals = 0, suffix = "") {
  const t0 = performance.now();
  const tick = now => {
    const k = Math.min(1, (now - t0) / 1100);
    const v = to * (1 - Math.pow(1 - k, 3));
    el.textContent = v.toFixed(decimals) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ════════════════════════════════════════════════════════════════
   NAV / TAB
   ════════════════════════════════════════════════════════════════ */
function pillTo(btn) {
  const pill = $("pill");
  pill.style.left  = btn.offsetLeft + "px";
  pill.style.width = btn.offsetWidth + "px";
}

function setupNav() {
  const btns = [...document.querySelectorAll("#nav button")];
  pillTo(btns[0]);

  btns.forEach(btn => {
    btn.onclick = () => {
      btns.forEach(b => b.classList.toggle("on", b === btn));
      pillTo(btn);
      document.querySelectorAll(".tab").forEach(t =>
        t.classList.toggle("on", t.id === btn.dataset.t)
      );

      if (btn.dataset.t === "dash") renderDashboard();
      if (btn.dataset.t === "data") renderDatasets();

      reveal($(btn.dataset.t));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });

  window.addEventListener("resize", () =>
    pillTo(document.querySelector("#nav .on"))
  );
}

/* ════════════════════════════════════════════════════════════════
   AUTOCOMPLETE
   ════════════════════════════════════════════════════════════════ */
/** Bengaluru area label for a node */
const areaOf = n =>
  n.lat > 13.04  ? "North"
  : n.lat < 12.93 && n.lng < 77.6 ? "South-West"
  : n.lat < 12.93 ? "South"
  : n.lng > 77.66 ? "East"
  : n.lng < 77.56 ? "West"
  : "Central";

function pick(role, node) {
  SEL[role] = node;
  $(role).value = node.n;
  $(role).classList.add("ok");
  $(role + "L").classList.remove("on");
  drawMap(null, SEL);

  if (SEL.src && SEL.dst) {
    zoomTo(fitBox([{ a: NODES.indexOf(SEL.src), to: NODES.indexOf(SEL.dst) }]), 700);
  } else {
    zoomTo([0, 0, 620, 790], 700);
  }
}

async function onlineSearch(role, query) {
  toast(`Searching OpenStreetMap for "${query}"…`);
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1`
              + `&viewbox=77.40,13.25,77.85,12.75&bounded=1`
              + `&q=${encodeURIComponent(query + ", Bengaluru")}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.length) { toast("No match found inside Bengaluru. Try a nearby locality."); return; }

    const lat = +json[0].lat, lng = +json[0].lon;
    if (lat < 12.78 || lat > 13.23 || lng < 77.45 || lng > 77.82) {
      toast("That place is outside the Bengaluru area covered."); return;
    }
    addCustomNode(role, query.replace(/\b\w/g, c => c.toUpperCase()), lat, lng);
  } catch {
    toast("Online search needs an internet connection. Pick from suggestions.");
  }
}

function addCustomNode(role, name, lat, lng) {
  // Remove previous custom node for this role
  const filtered = NODES.filter(n => n.cu !== role);
  NODES.length = 0; NODES.push(...filtered);
  NODES.push({ n: name, lat, lng, w: 0.8, cu: role });
  buildGraph();

  // Re-validate existing selections
  ["src","dst"].forEach(k => {
    if (SEL[k] && !NODES.includes(SEL[k])) SEL[k] = null;
  });
  pick(role, NODES[NODES.length - 1]);
}

function setupAutocomplete(role) {
  const inp = $(role), box = $(role + "L");
  let active = -1, items = [];

  const show = () => {
    const q = inp.value.trim().toLowerCase();
    SEL[role] = SEL[role]?.n.toLowerCase() === q ? SEL[role] : null;
    inp.classList.toggle("ok", !!SEL[role]);

    items = q
      ? NODES.filter(n => n.n.toLowerCase().includes(q))
              .sort((a, b) => a.n.toLowerCase().indexOf(q) - b.n.toLowerCase().indexOf(q))
      : NODES.filter(n => n.w >= 1.1);
    items = items.slice(0, 8);
    active = -1;

    const onlineOpt = (q && !items.some(n => n.n.toLowerCase() === q))
      ? `<div data-i="o"><span>🔎 Search "${inp.value.trim()}" online</span><small>OpenStreetMap</small></div>`
      : "";

    box.innerHTML = items.map((n, i) =>
      `<div data-i="${i}"><span>${n.n}</span><small>${n.cu ? "online result" : areaOf(n)}</small></div>`
    ).join("") + onlineOpt;
    box.classList.add("on");
  };

  inp.oninput  = show;
  inp.onfocus  = show;
  inp.onblur   = () => setTimeout(() => box.classList.remove("on"), 180);

  box.onmousedown = e => {
    const d = e.target.closest("[data-i]");
    if (!d) return;
    d.dataset.i === "o" ? onlineSearch(role, inp.value.trim()) : pick(role, items[+d.dataset.i]);
  };

  inp.onkeydown = e => {
    const ds = [...box.children];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + ds.length) % ds.length;
      ds.forEach((d, i) => d.classList.toggle("act", i === active));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const d = ds[active >= 0 ? active : 0];
      if (d) d.dataset.i === "o" ? onlineSearch(role, inp.value.trim()) : pick(role, items[+d.dataset.i]);
      if (SEL.src && SEL.dst) setTimeout(() => runAnalysis(true), 50);
    }
  };
}

/* ════════════════════════════════════════════════════════════════
   PIPELINE ANIMATION + ROUTE ANALYSIS
   ════════════════════════════════════════════════════════════════ */
const PIPELINE_STEPS = [
  ["1 Collect",     "D2 form · D3 slot · D4 graph"],
  ["2 Preprocess",  "Snap places · align slots"],
  ["3 Estimate",    "D1 baseline × weather × D3"],
  ["4 Diagnose",    "Rank sections by delay"],
  ["5 Guide",       "What-if + nearby-road check"],
];

export async function runAnalysis(animate) {
  const msg = $("msg");
  const out  = $("out");

  // Validation
  if (!SEL.src || !SEL.dst) {
    const missing = !SEL.src ? "src" : "dst";
    msg.innerHTML = `<div class="card err rv"><b>Please pick both places from the suggestions</b>
      (or press Enter to search online).</div>`;
    reveal(msg); $(missing).focus(); return;
  }
  if (SEL.src === SEL.dst) {
    msg.innerHTML = `<div class="card err rv"><b>Source and destination are the same place.</b>
      Please choose a different destination.</div>`;
    reveal(msg); out.style.display = "none"; return;
  }
  if (!$("tm").value) {
    msg.innerHTML = `<div class="card err rv"><b>Please enter a departure time.</b></div>`;
    reveal(msg); return;
  }

  msg.innerHTML = "";

  // Pipeline animation
  if (animate) {
    out.style.display = "none";
    const pipe = $("pipe");
    pipe.classList.add("on");
    $("pst").innerHTML = PIPELINE_STEPS.map(s =>
      `<div class="ps"><b>${s[0]}</b><small>${s[1]}</small></div>`
    ).join("");
    pipe.scrollIntoView({ behavior: "smooth", block: "center" });

    for (const el of $("pst").children) {
      el.classList.add("on");
      await new Promise(r => setTimeout(r, 330));
      el.classList.remove("on");
      el.classList.add("done");
    }
    pipe.classList.remove("on");
  }

  compute(animate);
}

/* ════════════════════════════════════════════════════════════════
   CORE COMPUTATION
   ════════════════════════════════════════════════════════════════ */
function compute(animate) {
  const [hh, mm] = $("tm").value.split(":").map(Number);
  const startHr  = hh + mm / 60;
  const mode     = $("mode").value;
  const useLive  = $("live").checked;
  const srcIdx   = NODES.indexOf(SEL.src);
  const dstIdx   = NODES.indexOf(SEL.dst);

  CONFIG = { we: $("day").value === "we", wx: $("wx").value, inc: "" };

  let edges = findPath(srcIdx, dstIdx, startHr, CONFIG, useLive, null);
  if (!edges) {
    $("msg").innerHTML = `<div class="card err"><b>No route found</b> between these places.</div>`;
    return;
  }

  // Incident simulation
  let incidentText = "";
  if ($("inc").checked) {
    const mid = edges[Math.floor(edges.length / 2)];
    CONFIG.inc = mid.key;
    incidentText = `${NODES[mid.a].n} → ${NODES[mid.to].n}`;
    edges = findPath(srcIdx, dstIdx, startHr, CONFIG, useLive, null);
  }

  const cur     = evaluatePath(edges, startHr, mode, CONFIG, useLive, null);
  const primary = { rows: cur.rows, keys: cur.keys };

  // Alternate route (penalise primary keys → forces different roads)
  const penalty  = new Set(cur.keys);
  const altEdges = findPath(srcIdx, dstIdx, startHr, CONFIG, useLive, penalty);
  let alt = null;
  if (altEdges && altEdges.some(e => !cur.keys.has(e.key))) {
    alt = { es: altEdges, r: evaluatePath(altEdges, startHr, mode, CONFIG, useLive, primary) };
  }

  // What-if candidates
  const candidates = [];
  for (const offset of [-90,-60,-45,-30,-15,15,30,45,60,90]) {
    const s2 = startHr + offset / 60;
    if (s2 < 5 || s2 > 22) continue;
    candidates.push({
      off: Math.abs(offset), type: "Departure time",
      tm: s2,
      label: `Leave ${offset < 0 ? -offset + " min earlier" : offset + " min later"} (${fmtTime(s2)})`,
      r: evaluatePath(edges, s2, mode, CONFIG, false),
    });
  }
  if (alt) candidates.push({ type: "Route", label: "Use alternate route (dashed on map)", r: alt.r });
  Object.keys(MODE_LABELS).forEach(m => {
    if (m !== mode)
      candidates.push({ type: "Mode", rec: m === "bus", label: "Switch to " + MODE_LABELS[m].toLowerCase(), r: evaluatePath(edges, startHr, m, CONFIG, useLive) });
  });

  const valid    = candidates.filter(x => x.r.ok && x.rec !== false);
  const topSave  = valid.reduce((a, b) => !a || b.r.tot < a.r.tot ? b : a, null);
  const savings  = topSave ? cur.tot - topSave.r.tot : 0;
  const best     = savings > 0
    ? valid.filter(x => cur.tot - x.r.tot >= 0.7 * savings)
           .sort((a, b) => (a.off||0) - (b.off||0) || a.r.tot - b.r.tot)[0]
    : null;

  const bottleneck = cur.rows.reduce((a, b) => b.mins - b.fm > a.mins - a.fm ? b : a);

  RES = { es: edges, cur, alt, candidates, best, save: best ? cur.tot - best.r.tot : 0,
          bn: bottleneck, st: startHr, mode, live: useLive, incTxt: incidentText, srcIdx, dstIdx };

  renderResult(animate);
}

/* ════════════════════════════════════════════════════════════════
   RENDER RESULT
   ════════════════════════════════════════════════════════════════ */
function renderResult(animate) {
  const R   = RES;
  const cur = R.cur;
  const bn  = R.bn;
  $("out").style.display = "block";

  const delay  = Math.max(0, cur.tot - cur.free);
  const avgCg  = Math.round(cur.rows.reduce((a, r) => a + r.cg * r.len, 0) / cur.dist);
  const avgSpd = cur.dist / (cur.tot / 60);

  // Via corridors
  const corridorDist = {};
  R.es.forEach(e => { if (e.art) corridorDist[e.corr] = (corridorDist[e.corr] || 0) + e.len; });
  const viaCorridors = Object.entries(corridorDist).sort((a,b) => b[1]-a[1]).slice(0,3).map(x=>x[0]);

  $("via").innerHTML =
    `<span style="font-size:22px">🧭</span><div>
       <b>${SEL.src.n.split(" (")[0]} → ${SEL.dst.n.split(" (")[0]}</b>
       <div class="muted">${viaCorridors.length ? "via " + viaCorridors.join(", ") : "via local roads"}
         · ${R.es.length} road sections${R.incTxt ? " · incident on " + R.incTxt : ""}</div>
     </div>`;

  // KPI tiles
  const kpis = [
    [cur.tot,   0, " min",  `Estimated travel time (${MODE_LABELS[R.mode]})`],
    [cur.dist,  1, " km",   "Route distance"],
    [avgSpd,    0, " km/h", "Average speed"],
    [delay,     0, " min",  "Delay vs free flow", "+"],
    [avgCg,     0, "%",     `Congestion · ${congestionLabel(avgCg)}`, "", congestionColour(avgCg)],
    [null,      0, "",      "Estimated arrival", fmtTime(R.st + cur.tot / 60)],
  ];
  $("kpis").innerHTML = kpis.map(k =>
    `<div class="kpi rv"><b ${k[5] ? `style="color:${k[5]}"` : ""}>
       ${k[4] && k[4] !== "+" ? k[4] : (k[4] === "+" ? "+" : "")}<em style="font-style:normal" data-v="${k[0]}" data-d="${k[1]}" data-s="${k[2]}">${k[0] === null ? "" : "0"}</em></b><span>${k[3]}</span></div>`
  ).join("");
  $("kpis").querySelectorAll("em[data-v]").forEach(el => {
    if (el.dataset.v !== "null") animateCount(el, +el.dataset.v, +el.dataset.d, el.dataset.s);
  });

  // Bottleneck reason
  const reason = R.incTxt && bn.e.key === CONFIG.inc
    ? "an incident has been reported here (D2 reports, D3 speed drop)"
    : CONFIG.wx !== "clear" && bn.cg >= 30
    ? (CONFIG.wx === "heavy" ? "heavy rain" : "rain") + " slows traffic on top of normal demand (D4 weather)"
    : bn.cg >= 55
    ? `peak-hour demand: about ${bn.veh} vehicles per 5 min on a ${bn.e.fs} km/h road (D1 pattern, D3 count)`
    : "traffic is flowing without a major delay";

  $("bn").innerHTML =
    `<h2><span class="ic">🚧</span>Bottleneck</h2>
     <p style="margin:0 0 8px"><b>${bn.from.split(" (")[0]} → ${bn.to.split(" (")[0]}</b>
       ${bn.e.corr ? `<span class="muted">· ${bn.e.corr}</span>` : ""}
       <span class="pill" style="background:${congestionColour(bn.cg)}">${bn.cg}% ${congestionLabel(bn.cg)}</span>
     </p>
     <p style="margin:0">Estimated speed ${(bn.len/(bn.mins/60)).toFixed(0)} km/h, delay +${(bn.mins-bn.fm).toFixed(1)} min.
       Reason: ${reason}. About ${Math.max(1, Math.round(bn.cg/12))} volunteer trips this hour reported a delay here (D2).</p>`;

  // Suggestion card
  let sg = "";
  const b = R.best;
  if (b && R.save >= 3) {
    sg = `<h2><span class="ic">💡</span>Suggestion</h2>
      <p style="margin:0 0 8px;font-size:17px"><b>${b.label}</b></p>
      <p style="margin:0">Expected travel time ${Math.round(b.r.tot)} min instead of ${Math.round(cur.tot)} min,
        saving about <b>${Math.round(R.save)} min</b>.
        ${b.type==="Route" ? "Nearby-road check passed: no section goes above 75% congestion."
          : b.type==="Mode" ? "Check the bus timetable before relying on this."
          : "Based on the predicted congestion pattern."}</p>
      ${b.type === "Departure time"
        ? `<p style="margin:12px 0 0"><button class="btn" id="apply">Apply this time</button></p>` : ""}`;
  } else {
    sg = `<h2><span class="ic">💡</span>Suggestion</h2>
      <p style="margin:0;font-size:17px"><b>Keep your current plan.</b></p>
      <p style="margin:6px 0 0">No alternative saves more than 3 minutes.</p>`;
  }

  const rejected = R.candidates.find(x => x.type === "Route" && !x.r.ok && x.r.tot < cur.tot - 3);
  if (rejected)
    sg += `<p class="muted" style="margin:10px 0 0">Spill-over check: the alternate route would be faster,
      but it would push nearby roads to ${Math.max(...rejected.r.rows.map(r=>r.sp))}% congestion,
      so it is not suggested.</p>`;
  $("sg").innerHTML = sg;
  if ($("apply")) $("apply").onclick = () => { $("tm").value = fmtTime(b.tm); runAnalysis(false); };

  // Section-wise table
  $("secs").innerHTML =
    `<table><thead><tr><th>#</th><th>Section</th><th>Passes at</th>
       <th>Length</th><th>Speed</th><th>Time</th><th>Delay</th><th>Congestion</th>
     </tr></thead><tbody>` +
    cur.rows.map((r, i) =>
      `<tr style="--i:${i}">
         <td>${i+1}</td>
         <td class="wr"><b>${r.from.split(" (")[0]} → ${r.to.split(" (")[0]}</b>
           ${r.e.corr ? `<div class="muted">${r.e.corr}</div>` : ""}
           ${r===bn&&bn.cg>=30 ? ' <span class="pill" style="background:var(--ink)">bottleneck</span>' : ""}
         </td>
         <td>${fmtTime(r.clk)}</td>
         <td>${r.len.toFixed(1)} km</td>
         <td>${(r.len/(r.mins/60)).toFixed(0)} km/h</td>
         <td>${r.mins.toFixed(1)} min</td>
         <td>+${(r.mins-r.fm).toFixed(1)} min</td>
         <td><div style="display:flex;gap:8px;align-items:center">
           <div class="bar" style="flex:1"><i style="width:${r.cg}%;background:${congestionColour(r.cg)}"></i></div>
           <b>${r.cg}%</b></div></td>
       </tr>`
    ).join("") + "</tbody></table>";

  renderChart();

  // What-if comparison table
  const row = (label, r, type, ok, tm) =>
    `<tr class="${tm ? "clk" : ""}" ${tm ? `data-tm="${tm}"` : ""}>
       <td class="wr">${label}<div class="muted">${type}</div></td>
       <td>${Math.round(r.tot)} min</td>
       <td style="color:${r.tot-cur.tot>0.5?"var(--r)":r.tot-cur.tot<-0.5?"var(--g)":"inherit"}">
         ${Math.round(r.tot-cur.tot)>0?"+":""}${Math.round(r.tot-cur.tot)} min</td>
       <td>${fmtTime(r.st+r.tot/60)}</td>
       <td>${ok ? '<span class="pill" style="background:var(--g)">OK</span>'
               : '<span class="pill" style="background:var(--r)">Rejected</span>'}</td>
     </tr>`;

  $("cmp").innerHTML =
    `<table><thead><tr><th>Option</th><th>Time</th><th>Change</th><th>Arrival</th><th>Spill-over</th></tr></thead>
     <tbody>${row(`<b>Current plan</b>`, cur, `${MODE_LABELS[R.mode]} · leave ${fmtTime(R.st)}`, true)}
       ${R.candidates.map(x => row(x.label, x.r, x.type, x.r.ok, x.tm||"")).join("")}
     </tbody></table>`;
  $("cmp").querySelectorAll("[data-tm]").forEach(tr => {
    if (tr.dataset.tm) tr.onclick = () => { $("tm").value = fmtTime(+tr.dataset.tm); runAnalysis(false); };
  });

  // Dataset trace
  $("trace").innerHTML =
    `<div class="tc rv"><b>D1 Historical data</b><br>Baseline index for ${R.es.length} road sections at ${fmtTime(R.st)} (hour and weekday pattern).</div>
     <div class="tc rv ${R.live ? "" : "fb"}"><b>D3 Live feed</b><br>${R.live
       ? "Current 5-minute slot blended in (65% live, 35% baseline)."
       : "Not available. Fallback: D1 patterns corrected by D2 trip times (×1.03)."}</div>
     <div class="tc rv"><b>D4 Road network &amp; weather</b><br>City graph of ${NODES.length} places, route length ${cur.dist.toFixed(1)} km, weather: ${$("wx").selectedOptions[0].text.toLowerCase()}.</div>
     <div class="tc rv"><b>D2 Commuter trips</b><br>${R.incTxt ? "Incident report applied on " + R.incTxt + ". " : ""}Delay reports explain the bottleneck; your trip joins D2 when saved.</div>
     <div class="tc rv"><b>D5 Corridor summary</b><br>Updated when trips are saved (see Corridor Dashboard).</div>`;

  $("saved").textContent = "";
  reveal($("out"));
  drawMap(R, SEL);
  zoomTo(fitBox(R.es.concat(R.alt ? R.alt.es : [])), 1100);
  if (animate) setTimeout(() => $("via").scrollIntoView({ behavior: "smooth", block: "start" }), 200);
}

/* ════════════════════════════════════════════════════════════════
   TRAVEL-TIME CHART
   ════════════════════════════════════════════════════════════════ */
function renderChart() {
  const R = RES;
  const pts = [];
  for (let h = 5; h <= 22; h += 0.25)
    pts.push([h, evaluatePath(R.es, h, R.mode, CONFIG, false).tot]);

  const mx = Math.max(...pts.map(p=>p[1])) * 1.1;
  const mn = Math.min(...pts.map(p=>p[1])) * 0.88;
  const W = 640, H = 220, P = 38;
  const X = h => P + (h-5)/17*(W-P-12);
  const Y = v => H-28-(v-mn)/(mx-mn)*(H-50);

  let o = `<svg id="csv" viewBox="0 0 ${W} ${H}" width="100%">
    <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#14b8a6" stop-opacity=".35"/>
      <stop offset="1" stop-color="#14b8a6" stop-opacity="0"/>
    </linearGradient></defs>`;

  for (let k=0; k<=4; k++) {
    const v = mn+(mx-mn)*k/4;
    o += `<line x1="${P}" x2="${W-12}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e8eef3"/>
          <text x="${P-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="#5b6b7e">${Math.round(v)}</text>`;
  }
  for (let h=5; h<=22; h+=3)
    o += `<text x="${X(h)}" y="${H-8}" text-anchor="middle" font-size="11" fill="#5b6b7e">${fmtTime(h)}</text>`;

  const pl = pts.map(p => `${X(p[0])},${Y(p[1])}`).join(" ");
  o += `<polygon points="${X(5)},${H-28} ${pl} ${X(22)},${H-28}" fill="url(#ar)" style="animation:fadeIn 1.4s"/>
        <polyline pathLength="1" class="rt" style="animation-duration:1.8s" points="${pl}"
          fill="none" stroke="#14b8a6" stroke-width="3.2" stroke-linejoin="round"/>
        <g id="mk" style="transition:transform .5s cubic-bezier(.3,.8,.3,1)"
          transform="translate(${X(R.st)},0)">
          <line y1="10" y2="${H-28}" stroke="#e0443a" stroke-dasharray="4 4"/>
          <circle cy="${Y(R.cur.tot)}" r="6" fill="#e0443a" stroke="#fff" stroke-width="2"/>
          <text y="20" x="6" font-size="11" fill="#e0443a">your departure</text>
        </g>
        <text x="12" y="${H/2}" font-size="11" fill="#5b6b7e"
          transform="rotate(-90 12 ${H/2})" text-anchor="middle">minutes</text>
        <text id="ct" font-size="12" font-weight="700" fill="#0f1b2d" x="0" y="-20"></text>
        <rect id="hit" x="${P}" y="0" width="${W-P}" height="${H-28}" fill="transparent" style="cursor:crosshair"/>
        </svg>`;

  $("chart").innerHTML = o;
  $("sl").value = R.st;
  $("slt").textContent = "Drag the slider to change the departure time: " + fmtTime(R.st);

  const svg = $("csv"), hit = $("hit");
  const hFromX = ev => {
    const rect = svg.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width * W;
    return Math.max(5, Math.min(22, 5 + (x-P)/(W-P-12)*17));
  };

  hit.onmousemove = ev => {
    const h = Math.round(hFromX(ev)*4)/4;
    const p = pts.find(q => Math.abs(q[0]-h) < 0.01);
    if (p) {
      const t = $("ct");
      t.textContent = `${fmtTime(h)} → ${Math.round(p[1])} min`;
      t.setAttribute("x", Math.min(X(h)+8, W-130));
      t.setAttribute("y", Y(p[1])-10);
    }
  };
  hit.onmouseleave = () => { $("ct").textContent = ""; };
  hit.onclick = ev => { $("tm").value = fmtTime(Math.round(hFromX(ev)*4)/4); runAnalysis(false); };
}

/* Slider sync */
function setupSlider() {
  $("sl").oninput = function() {
    $("slt").textContent = "Departure time: " + fmtTime(+this.value);
    const mk = $("mk");
    if (mk) mk.setAttribute("transform", `translate(${38+(+this.value-5)/17*(640-38-12)},0)`);
    clearTimeout(this._t);
    this._t = setTimeout(() => { $("tm").value = fmtTime(+this.value); runAnalysis(false); }, 350);
  };
}

/* ════════════════════════════════════════════════════════════════
   DASHBOARD TAB
   ════════════════════════════════════════════════════════════════ */
function gaussian(h, mean, sigma) {
  return Math.exp(-((h-mean)**2)/(2*sigma*sigma));
}

function renderDashboard() {
  const popCoeff = c => 0.6 + seededHash(c) * 0.6;
  const tripCounts = {};
  TRIPS.forEach(t => t.corr.forEach(c => {
    const k = c + "-" + Math.floor(t.st);
    tripCounts[k] = (tripCounts[k] || 0) + 1;
  }));

  const cc = { we: false, wx: "clear", inc: "" };
  let total = 0, shown = 0, worst = { d: 0 };

  // Build heatmap
  let html = `<div class="heat" style="grid-template-columns:190px repeat(16,1fr)">
    <div class="h"></div>` +
    [...Array(16)].map((_, i) => `<div class="h">${String(i + 6).padStart(2, "0")}</div>`).join("");
  let idx = 0;

  CORRIDORS.forEach(([nm]) => {
    const edges = [];
    ADJ.forEach(m => m.forEach(e => {
      if (e.corr === nm && e.a < e.to) edges.push(e);
    }));
    if (!edges.length) return;

    html += `<div class="rl">${nm}</div>`;
    for (let t = 6; t < 22; t++) {
      const n = Math.round((2 + 13 * (gaussian(t, 8.8, 1.2) + gaussian(t, 18.3, 1.5))) * popCoeff(nm)) + (tripCounts[nm + "-" + t] || 0);
      total += n;
      const dl = edges.reduce((a, e) => a + (e.len / e.fs) * 60 * (ttiEstimate(e, t + 0.5, cc, false) - 1), 0) / edges.length;
      const freeTime = edges.reduce((a, e) => a + (e.len / e.fs) * 60, 0) / edges.length;
      const tt = 1 + dl / freeTime;

      if (n >= 5) {
        shown++;
        if (dl > worst.d) worst = { d: dl, nm, t };
        html += `<div style="background:${congestionColour(congestionPct(tt))};animation-delay:${(idx++ % 40) * 18}ms" title="${n} trips">${dl.toFixed(1)}</div>`;
      } else {
        html += `<div class="na" title="Hidden: fewer than 5 trips">—</div>`;
      }
    }
  });

  $("heat").innerHTML = html + "</div>";

  const totalPossible = CORRIDORS.length * 16;
  const kpiData = [
    [total,        "Trips in the weekday summary (sample + saved)"],
    [shown,        `Section-hours shown (group size ≥ 5, of ${totalPossible})`],
    [null,         `Highest average delay: ${worst.nm ? worst.nm + " at " + String(worst.t).padStart(2, "0") + ":00 (" + worst.d.toFixed(1) + " min)" : "–"}`, worst.nm ? worst.nm.split(" (")[0] : "–"],
    [TRIPS.length, "Trips saved in this session"],
  ];

  $("dk").innerHTML = kpiData.map(k =>
    `<div class="kpi rv"><b style="${k[0] === null ? "font-size:18px" : ""}">
       <em style="font-style:normal" data-v="${k[0]}">${k[0] === null ? k[2] : 0}</em>
     </b><span>${k[1]}</span></div>`
  ).join("");
  $("dk").querySelectorAll("em[data-v]").forEach(e => {
    if (e.dataset.v !== "null") animateCount(e, +e.dataset.v);
  });

  if (TRIPS.length) {
    $("trips").innerHTML =
      `<table><thead><tr><th>Trip ID</th><th>User ID</th><th>Route</th>
         <th>Start</th><th>Mode</th><th>Est. time</th><th>Consent</th>
       </tr></thead><tbody>` +
      TRIPS.map((t, i) =>
        `<tr style="--i:${i}"><td>${t.id}</td><td>${t.u}</td><td class="wr">${t.r}</td>
         <td>${fmtTime(t.st)}</td><td>${MODE_LABELS[t.m]}</td><td>${Math.round(t.tt)} min</td><td>Yes</td></tr>`
      ).join("") + "</tbody></table>" +
      `<p class="muted">Only random IDs and section-level locations are stored. No name, phone number or home address.</p>`;
  }
}

/* ════════════════════════════════════════════════════════════════
   DATASETS TAB
   ════════════════════════════════════════════════════════════════ */
function renderDatasets() {
  const stats = [
    [NODES.length,       "Places in the road graph"],
    [CORRIDORS.length,   "Mapped corridors"],
    [4,                  "Input datasets (D1–D4)"],
    [8,                  "Preprocessing steps"],
  ];
  $("st").innerHTML = stats.map(s =>
    `<div class="kpi rv"><b><em style="font-style:normal">0</em></b><span>${s[1]}</span></div>`
  ).join("");
  $("st").querySelectorAll("em").forEach((el, i) => animateCount(el, stats[i][0]));
}

/* ════════════════════════════════════════════════════════════════
   RIPPLE EFFECT (button click)
   ════════════════════════════════════════════════════════════════ */
function setupRipples() {
  document.addEventListener("click", e => {
    const btn = e.target.closest(".btn,.swap");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const s = Math.max(rect.width, rect.height);
    const sp = document.createElement("span");
    sp.className = "rip";
    sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX-rect.left-s/2}px;top:${e.clientY-rect.top-s/2}px`;
    btn.appendChild(sp);
    setTimeout(() => sp.remove(), 600);
  });
}

/* ════════════════════════════════════════════════════════════════
   TRIP SAVE  (D2)
   ════════════════════════════════════════════════════════════════ */
function setupTripSave() {
  $("cons").onchange = () => { $("save").disabled = !$("cons").checked; };
  $("save").onclick  = () => {
    if (!RES || !$("cons").checked) return;
    const n = TRIPS.length + 1;
    const corridors = new Set(RES.es.filter(e=>e.art).map(e=>e.corr));
    TRIPS.push({
      id:   "T-" + String(400 + n*7).padStart(4,"0"),
      u:    "U-" + String(10 + n).padStart(3,"0"),
      r:    `${SEL.src.n.split(" (")[0]} → ${SEL.dst.n.split(" (")[0]}`,
      st:   RES.st, m: RES.mode, tt: RES.cur.tot,
      corr: [...corridors],
    });
    $("saved").textContent = "✔ Saved. See the Corridor Dashboard tab.";
    $("cons").checked = false;
    $("save").disabled = true;
    toast("Trip saved anonymously (T-" + String(400+n*7).padStart(4,"0") + ")");
  };
}

/* ════════════════════════════════════════════════════════════════
   EXAMPLE TRIPS (chips)
   ════════════════════════════════════════════════════════════════ */
const EXAMPLES = [
  ["Whitefield", "Electronic City"],
  ["Yelahanka",  "Jayanagar"],
  ["Kengeri",    "Indiranagar"],
  ["Kempegowda Airport (BLR)", "MG Road"],
  ["Hebbal",     "Silk Board"],
];

function setupExamples() {
  $("ex").innerHTML =
    `<span style="color:#9fb2cc;font-size:12.5px;align-self:center">Try:</span>` +
    EXAMPLES.map((e, i) =>
      `<span class="chip" data-i="${i}">${e[0].split(" (")[0]} → ${e[1].split(" (")[0]}</span>`
    ).join("");

  $("ex").onclick = e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const [s, d] = EXAMPLES[+chip.dataset.i];
    SEL.src = NODES.find(n => n.n === s);
    SEL.dst = NODES.find(n => n.n === d);
    $("src").value = s; $("dst").value = d;
    $("src").classList.add("ok"); $("dst").classList.add("ok");
    $("tm").value = "08:30";
    runAnalysis(true);
  };
}

/* ════════════════════════════════════════════════════════════════
   MAP INTERACTIONS
   ════════════════════════════════════════════════════════════════ */
function setupMapInteractions() {
  $("mapw").onclick = e => {
    const dot = e.target.closest(".nd");
    if (!dot) return;
    const node = NODES.find(n => n.n === dot.dataset.n);
    if (!SEL.src || (SEL.src && SEL.dst)) {
      pick("src", node); SEL.dst = null; $("dst").value = ""; $("dst").classList.remove("ok");
    } else {
      pick("dst", node);
    }
    toast((SEL.dst ? "Destination" : "Source") + " set: " + node.n);
  };

  $("fit").onclick  = () => RES ? zoomTo(fitBox(RES.es.concat(RES.alt ? RES.alt.es : []))) : toast("Analyse a trip first");
  $("city").onclick = () => zoomTo([0, 0, 620, 790]);
}

/* ════════════════════════════════════════════════════════════════
   GEOLOCATION
   ════════════════════════════════════════════════════════════════ */
function setupGeolocation() {
  $("loc").onclick = () => {
    if (!navigator.geolocation) { toast("Location not available in this browser."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: la, longitude: lo } }) => {
        if (la < 12.78 || la > 13.23 || lo < 77.45 || lo > 77.82) {
          toast("Your location is outside the Bengaluru area covered."); return;
        }
        addCustomNode("src", "My location", la, lo);
      },
      () => toast("Location permission was denied.")
    );
  };
}

/* ════════════════════════════════════════════════════════════════
   FORM REACTIVITY
   ════════════════════════════════════════════════════════════════ */
function setupFormReactivity() {
  $("go").onclick = () => runAnalysis(true);

  ["mode","day","wx","live","inc"].forEach(id =>
    $(id).onchange = () => { if (SEL.src && SEL.dst && RES) runAnalysis(false); }
  );
  $("tm").onchange = () => { if (SEL.src && SEL.dst && RES) runAnalysis(false); };

  $("swap").onclick = () => {
    [SEL.src, SEL.dst] = [SEL.dst, SEL.src];
    $("src").value = SEL.src ? SEL.src.n : "";
    $("dst").value = SEL.dst ? SEL.dst.n : "";
    $("src").classList.toggle("ok", !!SEL.src);
    $("dst").classList.toggle("ok", !!SEL.dst);
    if (SEL.src && SEL.dst && RES) runAnalysis(false);
    else drawMap(null, SEL);
  };
}

/* ════════════════════════════════════════════════════════════════
   ENTRY POINT
   ════════════════════════════════════════════════════════════════ */
export function init() {
  setupNav();
  setupAutocomplete("src");
  setupAutocomplete("dst");
  setupExamples();
  setupFormReactivity();
  setupSlider();
  setupGeolocation();
  setupMapInteractions();
  setupTripSave();
  setupRipples();
  drawMap(null, SEL);
  reveal($("plan"));
}
