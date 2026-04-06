"""
Clean Emergency Vehicle Priority System Runner
- Shows only essential info on terminal
- Saves detailed logs to file
"""

import os
import sys
import traci
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import logging

# Import ML preemption
from ml_preemption import MLPreemptionController

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class CleanEVTracker:
    """Tracks emergency vehicle with clean output"""
    
    def __init__(self, ev_id, logger):
        self.ev_id = ev_id
        self.logger = logger
        self.positions = []
        self.speeds = []
        self.times = []
        self.start_time = None
        self.end_time = None
        self.intersections_passed = []
    
    def record(self, sim_time):
        if self.ev_id in traci.vehicle.getIDList():
            pos = traci.vehicle.getPosition(self.ev_id)
            speed = traci.vehicle.getSpeed(self.ev_id)
            current_edge = traci.vehicle.getRoadID(self.ev_id)
            
            self.positions.append(pos)
            self.speeds.append(speed)
            self.times.append(sim_time)
            
            if current_edge.startswith('I') and current_edge not in self.intersections_passed:
                self.intersections_passed.append(current_edge)
                # Only log to file, not terminal
                self.logger.info(f"EV passed {current_edge} at {sim_time:.1f}s")
            
            if self.start_time is None:
                self.start_time = sim_time
        else:
            if self.start_time is not None and self.end_time is None:
                self.end_time = sim_time
    
    def get_travel_time(self):
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        return None
    
    def get_average_speed(self):
        if self.speeds:
            avg_ms = sum(self.speeds) / len(self.speeds)
            return avg_ms * 3.6
        return 0
    
    def save_to_csv(self, filename):
        df = pd.DataFrame({
            'time': self.times,
            'speed_mps': self.speeds,
            'speed_kph': [s * 3.6 for s in self.speeds],
            'x_pos': [p[0] for p in self.positions],
            'y_pos': [p[1] for p in self.positions]
        })
        df.to_csv(filename, index=False)
        return df


def setup_logger():
    """Setup logging to file only (not console)"""
    
    # Create logs folder
    os.makedirs('logs', exist_ok=True)
    
    # Create timestamp for log file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_filename = f"logs/simulation_log_{timestamp}.txt"
    
    # Create logger
    logger = logging.getLogger('EV_Simulation')
    logger.setLevel(logging.INFO)
    
    # File handler (only to file, not console)
    file_handler = logging.FileHandler(log_filename, mode='w')
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s', datefmt='%H:%M:%S'))
    
    logger.addHandler(file_handler)
    
    return logger, log_filename, timestamp


def print_banner():
    """Print clean banner to terminal"""
    print("\n" + "=" * 60)
    print("   EMERGENCY VEHICLE PRIORITY SYSTEM")
    print("   ML-Enhanced Signal Preemption")
    print("=" * 60)
    print()


def print_progress(current_time, ev_speed_kph, status):
    """Print clean progress to terminal"""
    print(f"  [{current_time:>5.0f}s] {status:<20} | Speed: {ev_speed_kph:>5.1f} km/h")


def run_simulation():
    """Run clean simulation with ML preemption"""
    
    print_banner()
    
    # Setup logger (logs to file only)
    logger, log_filename, timestamp = setup_logger()
    logger.info("=== SIMULATION START ===")
    logger.info(f"EV Route: I1_to_I2 -> I2_to_I4 -> I4_to_I3")
    
    sumo_config = os.path.join(PROJECT_ROOT, "config", "simulation.sumocfg")
    sumo_binary = r"C:\Program Files (x86)\Eclipse\Sumo\bin\sumo-gui.exe"
    sumo_cmd = [sumo_binary, "-c", sumo_config, "--start"]
    
    print("[SIM] Starting SUMO simulation...")
    logger.info("SUMO started")
    
    try:
        traci.start(sumo_cmd)
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return None, None, None
    
    ev_tracker = None
    preempt_controller = None
    ev_added = False
    step = 0
    max_steps = 36000
    
    print("\n[EV] Waiting for emergency vehicle deployment...")
    print("[LOG] Detailed logs are being saved to:", log_filename)
    print("-" * 60)
    
    while step < max_steps:
        sim_time = traci.simulation.getTime()
        
        # Add EV at 30 seconds
        if not ev_added and sim_time >= 30:
            route_edges = ["I1_to_I2", "I2_to_I4", "I4_to_I3"]
            route_id = "ev_route"
            traci.route.add(route_id, route_edges)
            ev_id = "emergency_vehicle"
            traci.vehicle.add(ev_id, route_id, depart=sim_time, typeID="emergency_vehicle")
            traci.vehicle.setColor(ev_id, (255, 0, 0))
            
            ev_tracker = CleanEVTracker(ev_id, logger)
            preempt_controller = MLPreemptionController(ev_id, threshold=0.65)
            ev_added = True
            
            print("\n" + "=" * 40)
            print("[ALERT] EMERGENCY VEHICLE DEPLOYED!")
            print(f"   Route: I1 -> I2 -> I4 -> I3")
            print("=" * 40)
            print()
            logger.info("EV DEPLOYED at 30.0s")
        
        # Record EV data (always call record so end_time gets set when EV leaves)
        if ev_tracker:
            ev_tracker.record(sim_time)
        
        # Check preemption only when EV is active
        if ev_tracker and ev_tracker.ev_id in traci.vehicle.getIDList():
            ev_speed = traci.vehicle.getSpeed(ev_tracker.ev_id)
            ev_speed_kph = ev_speed * 3.6
            
            # ML Preemption
            preempt_controller.check_and_preempt(
                sim_time, 80, ev_speed, 0, sim_time % 3600, 1
            )
            preempt_controller.recover_signals(sim_time)
            
            # Show progress every 30 seconds (clean terminal)
            if sim_time > 0 and sim_time % 30 < 0.1 and sim_time >= 30:
                status = "Traveling" if ev_speed > 5 else "At light"
                print_progress(sim_time, ev_speed_kph, status)
                logger.info(f"Progress: {sim_time:.0f}s, Speed: {ev_speed_kph:.1f} km/h")
        
        # Check if EV reached destination
        if ev_tracker and ev_tracker.end_time is not None:
            print("\n" + "=" * 40)
            print("[OK] EMERGENCY VEHICLE REACHED DESTINATION!")
            print("=" * 40)
            logger.info(f"EV REACHED DESTINATION at {sim_time:.1f}s")
            break
        
        traci.simulationStep()
        step += 1
    
    traci.close()
    logger.info("=== SIMULATION END ===")
    
    return ev_tracker, preempt_controller, timestamp


def print_results(tracker, preempt_controller, timestamp):
    """Print clean results to terminal"""
    if not tracker:
        return
    
    travel_time = tracker.get_travel_time()
    avg_speed = tracker.get_average_speed()
    max_speed = max(tracker.speeds) * 3.6 if tracker.speeds else 0
    
    print("\n" + "=" * 60)
    print("[RESULTS] SUMMARY")
    print("=" * 60)
    
    print(f"\n  [EV] Emergency Vehicle Performance:")
    if travel_time is not None:
        print(f"     - Travel Time:   {travel_time:.1f} seconds")
    else:
        print(f"     - Travel Time:   N/A (EV may still be in simulation)")
    print(f"     - Average Speed: {avg_speed:.1f} km/h")
    print(f"     - Max Speed:     {max_speed:.1f} km/h")
    
    print(f"\n  [SIGNAL] Preemption Statistics:")
    if preempt_controller:
        summary = preempt_controller.get_summary()
        print(f"     - Total Preemptions: {summary['total_preemptions']}")
        if summary['log']:
            signals = list(set([log['signal'] for log in summary['log']]))
            print(f"     - Signals Affected: {', '.join(signals)}")
    
    print(f"\n  [ROUTE] Route Completed:")
    for i, inter in enumerate(tracker.intersections_passed, 1):
        print(f"     {i}. {inter}")
    
    # Save CSV
    os.makedirs("results", exist_ok=True)
    csv_path = f"results/ev_data_{timestamp}.csv"
    tracker.save_to_csv(csv_path)
    print(f"\n  [SAVE] Data saved to: {csv_path}")
    
    print("\n" + "=" * 60)
    print("[OK] Simulation Complete!")
    print("=" * 60)


def main():
    """Main entry point"""
    tracker, preempt_controller, timestamp = run_simulation()
    
    if tracker:
        print_results(tracker, preempt_controller, timestamp)
        print(f"\n[LOG] Detailed log saved to: logs/simulation_log_{timestamp}.txt")
    else:
        print("\n[ERROR] Simulation failed")


if __name__ == "__main__":
    main()
