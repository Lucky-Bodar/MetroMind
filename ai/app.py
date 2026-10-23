"""
ai/app.py
────────────────────────────────────────────────────────────────
MetroMind — Python AI Microservice (Flask)

Endpoints:
  GET  /health        → service health check
  POST /predict       → TTI prediction for one corridor + hour
  POST /route         → full multi-section route analysis
  GET  /metrics       → model evaluation metrics

Run:
  pip install -r requirements.txt
  python app.py

Author : Alliance University – Design Project I (E1CSA313)
Sem    : 5th  |  Batch: 2023–27
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from models.traffic_model import predict_tti, evaluate_model_metrics
from utils.graph import CORRIDORS, NODES, haversine
import os

app = Flask(__name__)
CORS(app)

PORT = int(os.environ.get("AI_PORT", 5001))


# ─────────────────────────────────────────────────────────────
#  Health check
# ─────────────────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({
        "status":  "ok",
        "service": "MetroMind AI Service",
        "version": "1.0.0",
    })


# ─────────────────────────────────────────────────────────────
#  Single-section TTI prediction
#  Body: { corridor_key, hour, day_type, weather_code }
# ─────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    corridor_key = data.get("corridor_key", "")
    hour         = float(data.get("hour", 8))
    day_type     = data.get("day_type", "weekday")
    weather_code = data.get("weather_code", "clear")

    if not corridor_key:
        return jsonify({"error": "corridor_key is required"}), 400

    result = predict_tti(corridor_key, hour, day_type, weather_code)
    return jsonify(result)


# ─────────────────────────────────────────────────────────────
#  Full route analysis
#  Body: { sections: [{key, from, to, length_km, free_speed_kmh}],
#          hour, mode, day_type, weather_code }
# ─────────────────────────────────────────────────────────────
@app.route("/route", methods=["POST"])
def analyse_route():
    data    = request.get_json(force=True)
    sections     = data.get("sections", [])
    hour         = float(data.get("hour", 8))
    mode         = data.get("mode", "car")
    day_type     = data.get("day_type", "weekday")
    weather_code = data.get("weather_code", "clear")

    if not sections:
        return jsonify({"error": "sections list is required"}), 400

    # Mode adjustment factors
    mode_factor = {"car": 1.0, "bike": 0.85, "bus": 1.1}
    mode_add    = {"car": 0,   "bike": 0,    "bus": 7}    # extra minutes for bus stops

    results = []
    clock   = hour
    total   = 0.0
    worst   = None

    for sec in sections:
        key      = sec.get("key", "unknown")
        length   = float(sec.get("length_km", 1))
        fs       = float(sec.get("free_speed_kmh", 30))

        pred    = predict_tti(key, clock, day_type, weather_code)
        tti     = pred["tti"]
        speed   = fs / tti
        mins    = (length / speed) * 60
        free    = (length / fs) * 60
        delay   = mins - free

        results.append({
            "from":        sec.get("from"),
            "to":          sec.get("to"),
            "tti":         tti,
            "congestion":  pred["congestion_pct"],
            "speed_kmh":   round(speed, 1),
            "time_min":    round(mins, 2),
            "delay_min":   round(delay, 2),
            "pass_at":     round(clock, 3),
        })

        if worst is None or delay > worst["delay_min"]:
            worst = results[-1]

        clock += mins / 60
        total += mins

    total_adj = total * mode_factor[mode] + mode_add[mode]

    return jsonify({
        "total_time_min": round(total_adj, 1),
        "sections":       results,
        "bottleneck":     worst,
        "mode":           mode,
        "hour":           hour,
    })


# ─────────────────────────────────────────────────────────────
#  Model metrics
# ─────────────────────────────────────────────────────────────
@app.route("/metrics")
def metrics():
    return jsonify(evaluate_model_metrics())


if __name__ == "__main__":
    print(f"\n🤖  MetroMind AI Service starting on port {PORT}…")
    app.run(host="0.0.0.0", port=PORT, debug=True)
