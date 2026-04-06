# Emergency Vehicle Priority System

An ML-enhanced Emergency Vehicle (EV) priority system built using **SUMO** (Simulation of Urban MObility) and **Python**. The system uses a trained **Random Forest** machine learning model to intelligently preempt traffic signals, reducing emergency vehicle response times.

## Features

- **ML-Based Signal Preemption** — A trained Random Forest classifier decides when to preempt traffic signals based on distance, speed, queue length, and traffic conditions
- **Rule-Based Fallback** — Falls back to distance-based preemption if no ML model is available
- **Cooldown Mechanism** — 30-second cooldown prevents repeated preemption of the same signal
- **Real-Time Tracking** — Tracks EV position, speed, and route progress throughout the simulation
- **Data Collection Pipeline** — Automated collection of training data across multiple simulation runs
- **Clean Terminal Output** — Essential info on terminal, detailed logs saved to file

## Project Structure

```
ev-priority-system/
├── config/
│   ├── network.net.xml        # SUMO road network (4 intersections)
│   ├── network.nod.xml        # Network node definitions
│   ├── network.edg.xml        # Network edge definitions
│   ├── signals.add.xml        # Traffic signal programs
│   ├── routes.rou.xml         # Vehicle routes and types
│   └── simulation.sumocfg     # SUMO simulation config
├── src/
│   ├── clean_runner.py        # Main simulation runner (clean output)
│   ├── run_with_path.py       # Original simulation runner
│   ├── ml_preemption.py       # ML-based preemption controller
│   ├── preemption_controller.py  # Rule-based preemption controller
│   ├── ml_data_collector.py   # Training data collection module
│   ├── collect_training_data.py  # Multi-run data collection script
│   └── train_ml_model.py      # ML model training script
├── models/
│   └── preemption_model.pkl   # Trained Random Forest model
├── data/
│   └── ml_training_data.csv   # Collected training data
├── results/                   # Simulation output (CSV, plots)
├── logs/                      # Detailed simulation logs
└── README.md
```

## How It Works

### 1. Data Collection
Run 50+ headless simulations to collect preemption event data:
```bash
python src/collect_training_data.py
```
This records features like distance to signal, EV speed, queue length, and traffic level.

### 2. Model Training
Train a Random Forest classifier on the collected data:
```bash
python src/train_ml_model.py
```
Outputs model accuracy, feature importance, and saves to `models/preemption_model.pkl`.

### 3. ML-Enhanced Simulation
Run the simulation with the trained ML model:
```bash
python src/clean_runner.py
```

## Sample Output

```
============================================================
   EMERGENCY VEHICLE PRIORITY SYSTEM
   ML-Enhanced Signal Preemption
============================================================

[OK] Loaded ML model

[ALERT] EMERGENCY VEHICLE DEPLOYED!
   Route: I1 -> I2 -> I4 -> I3

  [ML] [45.1s] PREEMPTED I2 (confidence: 100.0%)
  [ML] [55.1s] PREEMPTED I4 (confidence: 100.0%)
  [ML] [88.1s] PREEMPTED I4 (confidence: 100.0%)

[OK] EMERGENCY VEHICLE REACHED DESTINATION!

[RESULTS] SUMMARY
  - Travel Time:   71.2 seconds
  - Average Speed: 29.6 km/h
  - Max Speed:     53.0 km/h
  - Total Preemptions: 3
  - Signals Affected: I2, I4
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Traffic Simulation | SUMO 1.26.0 |
| ML Model | scikit-learn (Random Forest) |
| Data Processing | pandas, NumPy |
| Visualization | matplotlib |
| API | TraCI (Traffic Control Interface) |
| Language | Python 3.13 |

## Prerequisites

- [SUMO](https://sumo.dlr.de/) installed at `C:\Program Files (x86)\Eclipse\Sumo`
- Python 3.10+
- Required packages:
  ```bash
  pip install pandas matplotlib scikit-learn joblib
  ```

## Disclaimer

This is a college project demonstrating ML-enhanced traffic signal preemption for emergency vehicles.
