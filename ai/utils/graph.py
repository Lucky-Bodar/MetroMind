"""
ai/utils/graph.py
────────────────────────────────────────────────────────────────
Shared graph data used by both the Python AI service and the
Node.js backend (via ai/utils/graph.js wrapper).

Mirrors the JavaScript data.js / routing.js datasets so the
Python model can perform routing logic independently.
"""

import math

# ─────────────────────────────────────────────────────────────
#  Node data  (80 Bengaluru localities)
#  Format: (name, lat, lng, traffic_weight)
# ─────────────────────────────────────────────────────────────
NODES_RAW = [
    ("MG Road",                      12.9756, 77.6070, 1.10),
    ("Majestic (KSR Station)",        12.9779, 77.5726, 1.10),
    ("Shivajinagar",                  12.9857, 77.6057, 1.00),
    ("Vidhana Soudha",                12.9797, 77.5907, 0.95),
    ("Richmond Circle",               12.9657, 77.5990, 0.95),
    ("Lalbagh",                       12.9507, 77.5848, 0.90),
    ("Town Hall",                     12.9645, 77.5800, 0.95),
    ("Malleshwaram",                  13.0035, 77.5710, 0.90),
    ("Rajajinagar",                   12.9910, 77.5520, 0.95),
    ("Vijayanagar",                   12.9719, 77.5300, 0.90),
    ("Basavanagudi",                  12.9422, 77.5738, 0.90),
    ("Jayanagar",                     12.9250, 77.5938, 0.95),
    ("JP Nagar",                      12.9063, 77.5857, 0.95),
    ("BTM Layout",                    12.9166, 77.6101, 1.05),
    ("Koramangala",                   12.9352, 77.6245, 1.10),
    ("Indiranagar",                   12.9784, 77.6408, 1.05),
    ("Silk Board",                    12.9177, 77.6233, 1.35),
    ("Hebbal",                        13.0358, 77.5970, 1.25),
    ("Whitefield",                    12.9698, 77.7500, 1.05),
    ("Electronic City",               12.8452, 77.6602, 1.05),
    ("Marathahalli",                  12.9569, 77.7011, 1.20),
    ("KR Puram",                      13.0075, 77.6960, 1.25),
    ("Yeshwanthpur",                  13.0285, 77.5400, 1.05),
    ("Kempegowda Airport (BLR)",      13.1986, 77.7066, 0.85),
    ("Yelahanka",                     13.1007, 77.5963, 0.95),
    ("Bellandur",                     12.9260, 77.6762, 1.20),
    ("Nagawara (Manyata Tech Park)",  13.0450, 77.6200, 1.10),
    ("Hosur Road",                    12.8780, 77.6490, 0.90),
    ("Kengeri",                       12.9140, 77.4830, 0.85),
    ("Banashankari",                  12.9255, 77.5468, 1.00),
]

NODES = [
    {"name": n[0], "lat": n[1], "lng": n[2], "weight": n[3]}
    for n in NODES_RAW
]

# ─────────────────────────────────────────────────────────────
#  Corridors  (17 named Bengaluru corridors)
# ─────────────────────────────────────────────────────────────
CORRIDORS = [
    ("Outer Ring Road (East)",   ["Hebbal","Nagawara (Manyata Tech Park)","KR Puram","Marathahalli","Bellandur","Silk Board"]),
    ("Outer Ring Road (West)",   ["Hebbal","Yeshwanthpur","Banashankari","BTM Layout","Silk Board"]),
    ("Bellary Road",             ["Shivajinagar","Hebbal","Yelahanka","Kempegowda Airport (BLR)"]),
    ("Old Madras Road",          ["MG Road","Indiranagar","KR Puram"]),
    ("Whitefield Road",          ["KR Puram","Whitefield"]),
    ("Old Airport Road",         ["MG Road","Marathahalli","Whitefield"]),
    ("Hosur Road",               ["MG Road","Silk Board","Electronic City"]),
    ("Mysore Road",              ["Majestic (KSR Station)","Kengeri"]),
    ("Tumkur Road",              ["Majestic (KSR Station)","Yeshwanthpur"]),
    ("Central Business District",["Majestic (KSR Station)","MG Road","Indiranagar"]),
    ("Sarjapur Road",            ["Koramangala","Bellandur"]),
    ("Koramangala Link",         ["Indiranagar","Koramangala","Silk Board"]),
    ("Bannerghatta Road",        ["Jayanagar","BTM Layout"]),
    ("Kanakapura Road",          ["Basavanagudi","JP Nagar"]),
    ("Old City Roads",           ["Majestic (KSR Station)","Town Hall","Richmond Circle"]),
    ("Magadi Road",              ["Majestic (KSR Station)"]),
    ("Varthur Road",             ["Marathahalli","Whitefield"]),
]


def haversine(a: dict, b: dict) -> float:
    """
    Great-circle distance (km) between two lat/lng dicts.
    """
    R = 6371
    r = math.pi / 180
    dl = (b["lat"] - a["lat"]) * r
    dg = (b["lng"] - a["lng"]) * r
    x  = math.sin(dl/2)**2 + math.cos(a["lat"]*r) * math.cos(b["lat"]*r) * math.sin(dg/2)**2
    return 2 * R * math.asin(math.sqrt(x))


def node_by_name(name: str) -> dict | None:
    return next((n for n in NODES if n["name"] == name), None)
