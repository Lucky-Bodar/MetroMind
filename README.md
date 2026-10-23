# MetroMind 🚦
**AI-Driven Traffic Optimisation for Bengaluru**

> **Design Project – I (E1CSA313)**  
> **Alliance University** (NAAC Grade A+ Accredited)  
> Department of Computer Science & Engineering · School of Advanced Computing  
> Semester 5 · Batch 2023–2027

---

## 👥 Project Team

| S.No | Student Name | Registration No. | Role |
|:---:|:---|:---:|:---|
| 1 | **Akshat Kishore** | `2411021060556` | Backend API & Database Architect |
| 2 | **Arya Utkarsh** | `2411021060543` | Frontend UI/UX & Routing Engine |
| 3 | **Bodar Lucky Kumar** | `2411021060517` | AI/ML Pipeline & Data Preprocessing |
| 4 | **D. Sai Shikhar Achari** | `2411021060542` | Spatial Graph Modeling & System Evaluation |

**Faculty Mentor:** **Dr. C. Viji**, Department of Computer Science & Engineering

---

## 📄 Base Paper Reference

> **Kumar, K. D., Anitha, M. L., & Veena, M. N. (2025)**  
> *"Real-time congestion prediction for Bengaluru city intersections using CNN, LSTM and SVR on 16,705 traffic records."*  
> *International Journal of Transport Development and Integration* (Scopus-indexed).

**MetroMind’s Extension:**
While the base paper trained offline models on historical Kaggle data without commuter interactivity, MetroMind bridges the gap by providing:
1. An interactive live commuter trip planner (responsive web application).
2. Segment-by-segment bottleneck diagnosis with natural language explanations.
3. What-if alternative routing with a **spill-over safety check** (ensuring redirected traffic does not push local roads above 75% congestion).
4. An anonymous, privacy-preserving corridor dashboard (Dataset D5, group size $\ge 5$).

---

## 📂 Project Structure

```
MetroMind/
│
├── frontend/               # Interactive Commuter Web Application (Vanilla JS + CSS3)
│   ├── index.html          # Main application page (Plan, Corridor Dashboard, Datasets)
│   ├── css/
│   │   └── style.css       # Design tokens, keyframe animations, responsive grid
│   └── js/
│       ├── app.js          # Client entry point (DOMContentLoaded bootstrap)
│       ├── ui.js           # UI state, autocomplete, chart rendering, tab navigation
│       ├── routing.js      # Dijkstra pathfinding, TTI estimation, spill-over verification
│       ├── map.js          # Vector SVG Bengaluru map with animated route visualization
│       └── data.js         # Spatial nodes (80 localities) & 17 arterial corridors
│
├── backend/                # Node.js + Express REST API
│   ├── server.js           # Express application entry point (port 3000)
│   ├── config/
│   │   └── db.js           # PostgreSQL connection pool configuration
│   ├── routes/
│   │   ├── trips.js        # POST /api/trips, GET /api/trips (anonymous logging)
│   │   ├── corridors.js    # GET /api/corridors, GET /api/corridors/heatmap (D5)
│   │   ├── weather.js      # GET /api/weather/current (D4 real-time weather)
│   │   ├── ai.js           # POST /api/ai/predict, POST /api/ai/route
│   │   └── auth.js         # POST /api/auth/login, POST /api/auth/register (JWT)
│   ├── controllers/
│   │   ├── tripController.js
│   │   ├── corridorController.js
│   │   ├── weatherController.js
│   │   ├── aiController.js
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js         # Bearer JWT verification
│   │   ├── errorHandler.js # Centralized HTTP error handler
│   │   └── rateLimiter.js  # 100 requests per 15 min rate limiter
│   └── models/
│       └── Trip.js         # Trip schema definition and validator
│
├── database/               # Relational Database Schema & Seeding (PostgreSQL 15+)
│   ├── schema/
│   │   └── schema.sql      # Tables (admins, trips, live_sensor_slots) + D5 materialized view
│   ├── migrations/
│   │   └── 001_initial_setup.sql
│   └── seeds/
│       └── seed.js         # Generates 200 sample trips for local development
│
├── ai/                     # Python AI/ML Microservice (Flask + scikit-learn)
│   ├── app.py              # Flask microservice (port 5001)
│   ├── train.py            # 8-step preprocessing pipeline & Random Forest training
│   ├── requirements.txt    # Python dependencies
│   ├── models/
│   │   ├── traffic_model.py # Model loader and TTI inference engine
│   │   └── traffic_rf.pkl   # Serialized trained Random Forest model artifact (R² = 0.98)
│   ├── data/
│   │   └── d1_bengaluru_traffic_sample.csv # D1 Kaggle sample dataset
│   └── utils/
│       ├── graph.py        # Python network representation
│       └── graph.js        # Node.js CommonJS bridge
│
├── env/
│   └── .env.example        # Environment variable configuration template
│
├── index.html              # Root redirect entry point
├── package.json            # Node.js project configuration and scripts
├── .gitignore              # Repository exclusion rules
└── README.md               # Project documentation
```

---

## 📊 The Five Datasets (D1 to D5)

| ID | Dataset Name | Type & Source | Role in MetroMind |
|:---:|:---|:---|:---|
| **D1** | Historical Bengaluru Traffic | Secondary (Kaggle 2022–2024) | Offline baseline training (Random Forest, 60/20/20 time-ordered split). |
| **D2** | Commuter Trip Data | Primary (Volunteer in-app submissions) | Incident reporting, fallback correction factor ($\times 1.03$), user trip logs. |
| **D3** | Live Corridor Feed | Simulated / Traffic Authority Feed | Blends real-time sensor speed into estimation (65% live, 35% baseline). |
| **D4** | Road Network & Weather | OpenStreetMap + Weather API | Graph nodes, section lengths, speed limits, rain multiplier. |
| **D5** | Anonymous Corridor Summary | Derived Materialized View (from D2 + D3) | Feeds corridor heatmap; minimum group threshold ($k \ge 5$) protects commuter privacy. |

---

## ⚙️ 8-Step Data Preprocessing Pipeline (`ai/train.py`)

1. **Validate**: Verifies data integrity (speed $0 < v \le 120\text{ km/h}$, non-negative volume, $\text{TTI} \ge 1.0$).
2. **Remove Duplicates**: Deduplicates records matching `(date, road_intersection)`.
3. **Handle Missing Values**: Median imputation per section and hour slot.
4. **Treat Outliers**: Interquartile range (IQR) capping to filter abnormal spikes.
5. **Align & Integrate**: Synchronizes data to 5-minute time slots.
6. **Feature Engineering**: Calculates peak flags, cyclic hour representations, and one-hot weather codes.
7. **Protect Privacy**: Anonymizes identifiers into randomized non-reversible hash keys.
8. **Scale & Split**: Min-Max scaling with strict **60/20/20 time-ordered split** (prevents lookahead leakage).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v26)
- **Python** 3.10+
- **PostgreSQL** 14+ (optional for local demo; automatic in-memory fallback enabled)

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd MetroMind

# Install Node.js backend dependencies
npm install

# Setup Python AI microservice environment
cd ai
pip install -r requirements.txt
python train.py      # Trains the Random Forest model and generates traffic_rf.pkl
cd ..
```

### 3. Environment Configuration
```bash
cp env/.env.example env/.env
# Edit env/.env with your preferred PORT and database credentials
```

### 4. Running the System

#### Option A: Full Stack Mode (Node Backend + Express Server)
```bash
# Terminal 1: Start Express backend & serve frontend
npm start
# Server runs at http://localhost:3000

# Terminal 2 (Optional): Start Python AI Microservice
npm run ai
# AI microservice runs at http://localhost:5001
```

#### Option B: Standalone Frontend Mode
Simply double-click `frontend/index.html` or open it with any static browser server (`Live Server`, `python3 -m http.server`, etc.). The built-in client routing engine and simulation models will run natively in the browser with zero external dependencies!

---

## 🧪 Model Performance (`ai/train.py`)

| Model | RMSE | MAE | $R^2$ Score |
|:---|:---:|:---:|:---:|
| **Baseline Linear Regression** | 0.2957 | 0.2391 | 0.2911 |
| **Random Forest Regressor (D1)** | **0.0464** | **0.0353** | **0.9825** |

---

## 🛡️ Privacy & Ethical Safeguards
- **Zero Personal Identifiers**: Commuter names, phone numbers, vehicle numbers, and IP addresses are never recorded.
- **Section-Level Precision**: Start and end points snap to nearest road intersections, avoiding exact residential coordinates.
- **$k$-Anonymity ($k \ge 5$)**: The corridor summary dashboard suppresses any cell with fewer than 5 contributing commuters.
- **No Hardware Control**: MetroMind provides advisory trip estimates only; it does not tamper with city traffic signaling infrastructure.

---

## 📚 Course Details
- **Course**: Design Project – I (`E1CSA313`)
- **Institution**: Alliance University, Bengaluru, Karnataka, India
- **Academic Year**: 2025–2026 (5th Semester)
