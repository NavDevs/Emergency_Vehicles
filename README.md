# Emergency Vehicles Priority System

This is an **on-going project** focused on implementing an Emergency Vehicle (EV) priority system using SUMO (Simulation of Urban MObility).

## Project Overview
The goal of this system is to reduce the response time of emergency vehicles by adjusting traffic light phases (preemption) and optimizing routes in a simulated urban environment.

## Current Progress
- [x] Basic SUMO network and route configurations (`config/`)
- [x] Preemption controller for traffic signals (`src/preemption_controller.py`)
- [x] Simulation runner with path analysis (`src/run_with_path.py`)
- [x] Initial simulation results and performance plotting (`results/`)

## How to Run
(Currently in development)
1. Ensure SUMO is installed.
2. Run the main simulation:
   ```bash
   python src/run_with_path.py
   ```

## Disclaimer
Note: This is a work in progress and part of a college project.
