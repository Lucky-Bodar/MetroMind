/**
 * data.js — MetroMind
 * ─────────────────────────────────────────────────────────────
 * Contains all static datasets used by the application:
 *   • RAW_NODES   – 80 Bengaluru localities with coordinates
 *                   and a traffic-weight multiplier
 *   • CORRIDORS   – 17 named road corridors and their node sequences
 *
 * These stand in for:
 *   D1 – Historical Bengaluru traffic (Kaggle 2022-24)
 *   D4 – Road network (OpenStreetMap graph)
 *
 * In a production build these would be fetched from an API / DB.
 */

/** @type {Array<{n:string, lat:number, lng:number, w:number}>} */
export const RAW_NODES = [
  // Central Business District
  { n: "MG Road",                       lat: 12.9756, lng: 77.6070, w: 1.10 },
  { n: "Majestic (KSR Station)",         lat: 12.9779, lng: 77.5726, w: 1.10 },
  { n: "Shivajinagar",                   lat: 12.9857, lng: 77.6057, w: 1.00 },
  { n: "Vidhana Soudha",                 lat: 12.9797, lng: 77.5907, w: 0.95 },
  { n: "Richmond Circle",                lat: 12.9657, lng: 77.5990, w: 0.95 },
  { n: "Lalbagh",                        lat: 12.9507, lng: 77.5848, w: 0.90 },
  { n: "Town Hall",                      lat: 12.9645, lng: 77.5800, w: 0.95 },
  // West / North-West
  { n: "Malleshwaram",                   lat: 13.0035, lng: 77.5710, w: 0.90 },
  { n: "Rajajinagar",                    lat: 12.9910, lng: 77.5520, w: 0.95 },
  { n: "Vijayanagar",                    lat: 12.9719, lng: 77.5300, w: 0.90 },
  // South
  { n: "Basavanagudi",                   lat: 12.9422, lng: 77.5738, w: 0.90 },
  { n: "Jayanagar",                      lat: 12.9250, lng: 77.5938, w: 0.95 },
  { n: "JP Nagar",                       lat: 12.9063, lng: 77.5857, w: 0.95 },
  { n: "BTM Layout",                     lat: 12.9166, lng: 77.6101, w: 1.05 },
  // South-East / East
  { n: "Koramangala",                    lat: 12.9352, lng: 77.6245, w: 1.10 },
  { n: "Indiranagar",                    lat: 12.9784, lng: 77.6408, w: 1.05 },
  { n: "Domlur",                         lat: 12.9609, lng: 77.6387, w: 1.00 },
  { n: "HAL Airport Road",               lat: 12.9585, lng: 77.6480, w: 0.95 },
  { n: "Ulsoor",                         lat: 12.9830, lng: 77.6200, w: 0.90 },
  { n: "Frazer Town",                    lat: 12.9980, lng: 77.6130, w: 0.85 },
  { n: "Shanthinagar",                   lat: 12.9570, lng: 77.6000, w: 0.90 },
  { n: "Vasanth Nagar",                  lat: 12.9890, lng: 77.5900, w: 0.90 },
  { n: "Sadashivanagar",                 lat: 13.0070, lng: 77.5800, w: 0.85 },
  // North
  { n: "Hebbal",                         lat: 13.0358, lng: 77.5970, w: 1.25 },
  { n: "Yelahanka",                      lat: 13.1007, lng: 77.5963, w: 0.95 },
  { n: "Kempegowda Airport (BLR)",        lat: 13.1986, lng: 77.7066, w: 0.85 },
  { n: "Sahakara Nagar",                 lat: 13.0624, lng: 77.5870, w: 0.85 },
  { n: "Jakkur",                         lat: 13.0770, lng: 77.6070, w: 0.80 },
  { n: "Thanisandra",                    lat: 13.0560, lng: 77.6340, w: 0.85 },
  { n: "Nagawara (Manyata Tech Park)",    lat: 13.0450, lng: 77.6200, w: 1.10 },
  { n: "Hennur",                         lat: 13.0360, lng: 77.6400, w: 1.00 },
  { n: "Kalyan Nagar",                   lat: 13.0250, lng: 77.6410, w: 0.90 },
  { n: "Banaswadi",                      lat: 13.0140, lng: 77.6510, w: 0.90 },
  { n: "RT Nagar",                       lat: 13.0210, lng: 77.5950, w: 0.85 },
  { n: "Mathikere",                      lat: 13.0300, lng: 77.5600, w: 0.85 },
  { n: "Yeshwanthpur",                   lat: 13.0285, lng: 77.5400, w: 1.05 },
  { n: "Jalahalli",                      lat: 13.0400, lng: 77.5200, w: 0.90 },
  { n: "Peenya",                         lat: 13.0285, lng: 77.5200, w: 0.95 },
  { n: "Dasarahalli",                    lat: 13.0450, lng: 77.5120, w: 0.85 },
  { n: "Nagasandra",                     lat: 13.0480, lng: 77.4980, w: 0.80 },
  { n: "Vidyaranyapura",                 lat: 13.0780, lng: 77.5550, w: 0.80 },
  { n: "Goraguntepalya",                 lat: 13.0330, lng: 77.5290, w: 1.00 },
  // South-West
  { n: "Nagarbhavi",                     lat: 12.9610, lng: 77.5110, w: 0.85 },
  { n: "Nayandahalli",                   lat: 12.9420, lng: 77.5200, w: 1.00 },
  { n: "Rajarajeshwari Nagar",           lat: 12.9270, lng: 77.5190, w: 0.85 },
  { n: "Kengeri",                        lat: 12.9140, lng: 77.4830, w: 0.85 },
  { n: "Banashankari",                   lat: 12.9255, lng: 77.5468, w: 1.00 },
  { n: "Uttarahalli",                    lat: 12.9020, lng: 77.5430, w: 0.85 },
  { n: "Konanakunte",                    lat: 12.8830, lng: 77.5700, w: 0.85 },
  { n: "Magadi Road (Sumanahalli)",       lat: 12.9810, lng: 77.5400, w: 0.90 },
  { n: "Jnanabharathi",                  lat: 12.9500, lng: 77.5040, w: 0.80 },
  // High-congestion South nodes
  { n: "Silk Board",                     lat: 12.9177, lng: 77.6233, w: 1.35 },
  { n: "Madiwala",                       lat: 12.9226, lng: 77.6174, w: 1.15 },
  { n: "HSR Layout",                     lat: 12.9116, lng: 77.6389, w: 1.00 },
  { n: "Bommanahalli",                   lat: 12.9060, lng: 77.6230, w: 0.95 },
  { n: "Arekere",                        lat: 12.8880, lng: 77.5970, w: 0.85 },
  { n: "Hulimavu",                       lat: 12.8760, lng: 77.6000, w: 0.80 },
  { n: "Begur",                          lat: 12.8780, lng: 77.6240, w: 0.80 },
  { n: "Singasandra",                    lat: 12.8780, lng: 77.6490, w: 0.90 },
  { n: "Electronic City",                lat: 12.8452, lng: 77.6602, w: 1.05 },
  { n: "Bommasandra",                    lat: 12.8150, lng: 77.6830, w: 0.85 },
  { n: "Agara",                          lat: 12.9250, lng: 77.6490, w: 1.00 },
  { n: "Bellandur",                      lat: 12.9260, lng: 77.6762, w: 1.20 },
  { n: "Kadubeesanahalli",               lat: 12.9370, lng: 77.6930, w: 1.15 },
  { n: "Kasavanahalli",                  lat: 12.9100, lng: 77.6800, w: 0.95 },
  { n: "Carmelaram",                     lat: 12.9050, lng: 77.7100, w: 0.85 },
  { n: "Sarjapur",                       lat: 12.8600, lng: 77.7830, w: 0.80 },
  // East / Whitefield
  { n: "Marathahalli",                   lat: 12.9569, lng: 77.7011, w: 1.20 },
  { n: "Brookefield",                    lat: 12.9660, lng: 77.7160, w: 0.95 },
  { n: "Varthur",                        lat: 12.9390, lng: 77.7410, w: 0.90 },
  { n: "Whitefield",                     lat: 12.9698, lng: 77.7500, w: 1.05 },
  { n: "ITPL (Whitefield)",              lat: 12.9856, lng: 77.7370, w: 1.00 },
  { n: "Hoodi",                          lat: 12.9920, lng: 77.7160, w: 1.00 },
  { n: "Mahadevapura",                   lat: 12.9910, lng: 77.6870, w: 1.05 },
  { n: "KR Puram",                       lat: 13.0075, lng: 77.6960, w: 1.25 },
  { n: "Ramamurthy Nagar",               lat: 13.0170, lng: 77.6760, w: 0.95 },
  { n: "CV Raman Nagar",                 lat: 12.9850, lng: 77.6640, w: 0.90 },
  { n: "Tin Factory",                    lat: 12.9960, lng: 77.6650, w: 1.20 },
  { n: "Baiyappanahalli",                lat: 12.9900, lng: 77.6420, w: 0.95 },
  { n: "Jeevan Bima Nagar",              lat: 12.9650, lng: 77.6500, w: 0.85 },
];

/**
 * Named road corridors.
 * Each entry is [corridorName, [node1, node2, …]] ordered along the road.
 * Used to build arterial edges (higher free-speed) in the graph and to
 * label the corridor dashboard heatmap rows.
 *
 * @type {Array<[string, string[]]>}
 */
export const CORRIDORS = [
  ["Outer Ring Road (East)",   ["Hebbal","Nagawara (Manyata Tech Park)","Hennur","Banaswadi","Ramamurthy Nagar","KR Puram","Mahadevapura","Marathahalli","Kadubeesanahalli","Bellandur","Agara","Silk Board"]],
  ["Outer Ring Road (West)",   ["Hebbal","Mathikere","Yeshwanthpur","Goraguntepalya","Peenya","Nagarbhavi","Nayandahalli","Banashankari","JP Nagar","BTM Layout","Silk Board"]],
  ["Bellary Road",             ["Shivajinagar","Sadashivanagar","Hebbal","Sahakara Nagar","Yelahanka","Kempegowda Airport (BLR)"]],
  ["Old Madras Road",          ["MG Road","Indiranagar","Baiyappanahalli","Tin Factory","KR Puram"]],
  ["Whitefield Road",          ["KR Puram","Mahadevapura","Hoodi","ITPL (Whitefield)","Whitefield"]],
  ["Old Airport Road",         ["MG Road","Domlur","HAL Airport Road","Marathahalli","Brookefield","Whitefield"]],
  ["Hosur Road",               ["Shanthinagar","Madiwala","Silk Board","Bommanahalli","Singasandra","Electronic City","Bommasandra"]],
  ["Bannerghatta Road",        ["Jayanagar","BTM Layout","Arekere","Hulimavu"]],
  ["Kanakapura Road",          ["Basavanagudi","JP Nagar","Konanakunte"]],
  ["Mysore Road",              ["Majestic (KSR Station)","Vijayanagar","Nayandahalli","Rajarajeshwari Nagar","Kengeri"]],
  ["Tumkur Road",              ["Majestic (KSR Station)","Rajajinagar","Yeshwanthpur","Jalahalli","Dasarahalli","Nagasandra"]],
  ["Central Business District",["Majestic (KSR Station)","Vidhana Soudha","MG Road","Ulsoor","Indiranagar"]],
  ["Sarjapur Road",            ["Koramangala","Agara","Kasavanahalli","Carmelaram","Sarjapur"]],
  ["Koramangala Link",         ["Domlur","Koramangala","Madiwala","HSR Layout","Agara"]],
  ["Old City Roads",           ["Majestic (KSR Station)","Town Hall","Richmond Circle","Shanthinagar","Lalbagh"]],
  ["Magadi Road",              ["Majestic (KSR Station)","Magadi Road (Sumanahalli)","Goraguntepalya"]],
  ["Varthur Road",             ["Marathahalli","Varthur","Whitefield"]],
];
