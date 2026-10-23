"""
ai/models/traffic_model.py
────────────────────────────────────────────────────────────────
MetroMind — AI/ML Traffic Prediction Model

Simulates a Random Forest Regressor trained on D1 (historical
Bengaluru traffic data, Kaggle 2022-24).

In production:
  • Train on D1 CSV (60/20/20 time-ordered train/val/test split)
  • Save model as traffic_rf.pkl using joblib
  • Load here and predict TTI for any (corridor, hour, day, weather)

Author : Alliance University – Design Project I (E1CSA313)
Sem    : 5th  |  Batch: 2023–27
"""

import math
import hashlib
import pickle
import os
from typing import Optional

# ── Try loading a trained model if it exists ──────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "traffic_rf.pkl")
_trained_model = None

def _load_model():
    global _trained_model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            _trained_model = pickle.load(f)
        print(f"[AI] Loaded trained model from {MODEL_PATH}")
    else:
        print("[AI] No trained model found — using simulation fallback.")


def _gaussian(h: float, mean: float, sigma: float) -> float:
    """Gaussian bell-curve for rush-hour peak modelling."""
    return math.exp(-((h - mean) ** 2) / (2 * sigma ** 2))


def _seeded_hash(seed: str) -> float:
    """Deterministic pseudo-random [0, 1) from a string seed."""
    h = int(hashlib.md5(seed.encode()).hexdigest(), 16)
    return (h % 10000) / 10000


# Weather multiplier lookup  (speed reduction, additive offset)
WEATHER_IMPACT = {
    "clear": (0.00, 0.00),
    "rain":  (0.25, 0.05),
    "heavy": (0.50, 0.12),
}


def predict_tti(
    corridor_key: str,
    hour: float,
    day_type: str = "weekday",
    weather_code: str = "clear",
    use_trained: bool = True,
) -> dict:
    """
    Predict the Traffic Time Index (TTI) for a road section.

    Parameters
    ----------
    corridor_key : str   – unique string identifying the road section
    hour         : float – decimal hour (e.g. 8.5 = 08:30)
    day_type     : str   – "weekday" | "weekend"
    weather_code : str   – "clear" | "rain" | "heavy"
    use_trained  : bool  – use the pkl model if available

    Returns
    -------
    dict: { tti, congestion_pct, confidence, source }
    """

    # ── Try trained RF model first ────────────────────────────
    if use_trained and _trained_model is not None:
        try:
            # Feature vector: hour, is_weekend, weather_idx, corridor_hash
            w_idx = {"clear": 0, "rain": 1, "heavy": 2}.get(weather_code, 0)
            c_hash = _seeded_hash(corridor_key)
            features = [[hour, int(day_type == "weekend"), w_idx, c_hash]]
            tti = float(_trained_model.predict(features)[0])
            tti = max(1.0, tti)
            cg  = min(100, round(100 * (1 - 1 / tti) * 1.7))
            return {
                "tti": round(tti, 3),
                "congestion_pct": cg,
                "confidence": 0.87,
                "source": "random_forest_d1",
            }
        except Exception as e:
            print(f"[AI] Trained model inference failed: {e}. Using simulation.")

    # ── Simulation fallback (mirrors JS routing.js logic) ────
    k1 = 0.8 + 0.4 * _seeded_hash(corridor_key + "a")
    k2 = 0.8 + 0.4 * _seeded_hash(corridor_key + "b")
    wd = 0.55 if day_type == "weekend" else 1.0

    peak = (
        0.95 * (_gaussian(hour, 8.8, 1.25) * k1 + _gaussian(hour, 18.3, 1.5) * k2)
        + 0.15 * _gaussian(hour, 13.0, 2.5)
    )

    tti = 1 + peak * wd
    wx  = WEATHER_IMPACT.get(weather_code, (0, 0))
    tti = 1 + (tti - 1) * (1 + wx[0]) + wx[1]
    tti = max(1.0, tti)

    cg = min(100, round(100 * (1 - 1 / tti) * 1.7))
    return {
        "tti": round(tti, 3),
        "congestion_pct": cg,
        "confidence": 0.72,   # lower confidence for simulation
        "source": "simulation_fallback",
    }


def evaluate_model_metrics() -> dict:
    """
    Return placeholder evaluation metrics (to be replaced by real
    metrics after the one-month pilot with D1 data).

    In production: compute RMSE, MAE, R² on the hold-out test set.
    """
    return {
        "rmse":          4.2,   # minutes
        "mae":           3.1,
        "r2":            0.81,
        "ranking_match": 0.88,  # fraction of bottleneck sections correctly ranked
        "sus_score":     74,    # System Usability Scale (target > 68)
        "note": "Placeholder metrics — will be updated after one-month pilot.",
    }


# Load model on module import
_load_model()
