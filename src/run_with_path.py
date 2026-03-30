#!/usr/bin/env python3
"""
Emergency Vehicle Priority System - Phase 2: Signal Preemption
Tracks emergency vehicle through SUMO simulation with traffic light preemption
"""

import os
import sys
import traci
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
from preemption_controller import PreemptionController

# Set SUMO_HOME explicitly
os.environ['SUMO_HOME'] = r'C:\Program Files (x86)\Eclipse\Sumo'
os.environ['PATH'] = r'C:\Program Files (x86)\Eclipse\Sumo\bin' + os.pathsep + os.environ['PATH']


class EVTracker:
    """Tracks emergency vehicle movement"""
    
    def __init__(self, ev_id):
        self.ev_id = ev_id
        self.positions = []
        self.speeds = []
        self.times = []
        self.start_time = None
        self.end_time = None
        self.edge_history = []
        self.intersections_passed = []
        self.preemption_controller = None
    
    def record(self, sim_time):
        """Record current EV state"""
        if self.ev_id in traci.vehicle.getIDList():
            pos = traci.vehicle.getPosition(self.ev_id)
            speed = traci.vehicle.getSpeed(self.ev_id)
            current_edge = traci.vehicle.getRoadID(self.ev_id)
            
            self.positions.append(pos)
            self.speeds.append(speed)
            self.times.append(sim_time)
            self.edge_history.append(current_edge)
            
            if isinstance(current_edge, str) and current_edge.startswith('I') and current_edge not in self.intersections_passed:
                self.intersections_passed.append(current_edge)
                print(f"  [{sim_time:.1f}s] EV passed {current_edge}")
            
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
        """Save tracking data to CSV"""
        df = pd.DataFrame({
            'time': self.times,
            'speed_mps': self.speeds,
            'speed_kph': [s * 3.6 for s in self.speeds],
            'x_pos': [p[0] for p in self.positions],
            'y_pos': [p[1] for p in self.positions],
            'edge': self.edge_history
        })
        df.to_csv(filename, index=False)
        print(f"Data saved to: {filename}")
        return df
    
    def plot_speed(self, save_path=None):
        """Plot speed over time"""
        if not self.times:
            print("No data to plot")
            return
        
        plt.figure(figsize=(10, 6))
        plt.plot(self.times, [s * 3.6 for s in self.speeds], 'b-', linewidth=2)
        plt.xlabel('Time (seconds)')
        plt.ylabel('Speed (km/h)')
        plt.title('Emergency Vehicle Speed Profile')
        plt.grid(True, alpha=0.3)
        plt.axhline(y=50, color='r', linestyle='--', label='Speed Limit (50 km/h)')
        plt.legend()
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"Plot saved to: {save_path}")
        
        plt.show()


def run_simulation():
    """Run SUMO simulation with emergency vehicle and signal preemption"""
    
    print("=" * 60)
    print("EMERGENCY VEHICLE PRIORITY SYSTEM")
    print("Phase 2: Signal Preemption")
    print("=" * 60)
    
    # Path to SUMO config
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    sumo_config = os.path.join(project_root, "config", "simulation.sumocfg")
    
    if not os.path.exists(sumo_config):
        print(f"ERROR: Config file not found at {sumo_config}")
        print("Make sure you're running from project root directory")
        return None
    
    # Try sumo-gui first, fall back to headless sumo
    sumo_gui = r"C:\Program Files (x86)\Eclipse\Sumo\bin\sumo-gui.exe"
    sumo_headless = r"C:\Program Files (x86)\Eclipse\Sumo\bin\sumo.exe"
    
    use_gui = "--gui" in sys.argv
    sumo_binary = sumo_gui if use_gui else sumo_headless
    
    sumo_cmd = [sumo_binary, "-c", sumo_config]
    if use_gui:
        sumo_cmd += ["--start", "--quit-on-end"]
    
    print(f"Using SUMO at: {sumo_binary}")
    print(f"Config: {sumo_config}")
    
    try:
        traci.start(sumo_cmd)
        print("[SUCCESS] SUMO simulation started")
    except Exception as e:
        print(f"[ERROR] Error starting SUMO: {e}")
        return None
    
    # Variables
    ev_tracker = None
    ev_added = False
    step = 0
    max_steps = 36000
    preemption_controller = None
    
    print("\nRunning simulation...")
    print("-" * 60)
    
    while step < max_steps:
        sim_time = traci.simulation.getTime()
        
        # Add emergency vehicle at 30 seconds
        if not ev_added and sim_time >= 30:
            route_edges = ["I1_to_I2", "I2_to_I4", "I4_to_I3"]
            route_id = "ev_route"
            
            traci.route.add(route_id, route_edges)
            ev_id = "emergency_vehicle"
            traci.vehicle.add(ev_id, route_id, depart=sim_time, typeID="emergency_vehicle")
            traci.vehicle.setColor(ev_id, (255, 0, 0))
            
            ev_tracker = EVTracker(ev_id)
            preemption_controller = PreemptionController(ev_id)
            ev_tracker.preemption_controller = preemption_controller
            ev_added = True
            print(f"\n[{sim_time:.1f}s] EMERGENCY VEHICLE DEPLOYED!")
            print(f"   Route: {' -> '.join(route_edges)}")
        
        # Record EV data and handle preemption
        if ev_tracker:
            ev_tracker.record(sim_time)
        
        if preemption_controller:
            preemption_controller.check_and_preempt(sim_time)
            preemption_controller.recover_signals(sim_time)
        
        # Check if EV reached destination
        if ev_tracker and ev_tracker.start_time is not None and ev_tracker.ev_id not in traci.vehicle.getIDList():
            if ev_tracker.end_time is None:
                ev_tracker.end_time = sim_time
            print(f"\n[{sim_time:.1f}s] EMERGENCY VEHICLE REACHED DESTINATION!")
            break
        
        # Progress every 30 seconds
        if sim_time > 0 and sim_time % 30 < 0.1 and ev_tracker and ev_tracker.ev_id in traci.vehicle.getIDList():
            speed = traci.vehicle.getSpeed(ev_tracker.ev_id)
            pos = traci.vehicle.getPosition(ev_tracker.ev_id)
            print(f"   [{sim_time:.0f}s] EV at ({pos[0]:.0f}, {pos[1]:.0f}), speed: {speed:.1f} m/s")
        
        traci.simulationStep()
        step += 1
    
    traci.close()
    print("-" * 60)
    print("\nSIMULATION COMPLETE")
    
    return ev_tracker


def generate_report(tracker):
    """Generate performance report"""
    if not tracker:
        print("No data to report")
        return
    
    print("\n" + "=" * 60)
    print("PERFORMANCE REPORT")
    print("=" * 60)
    
    travel_time = tracker.get_travel_time()
    avg_speed = tracker.get_average_speed()
    max_speed = max(tracker.speeds) * 3.6 if tracker.speeds else 0
    min_speed = min(tracker.speeds) * 3.6 if tracker.speeds else 0
    
    print(f"\nKEY METRICS:")
    print(f"   Travel Time: {travel_time:.1f} seconds")
    print(f"   Average Speed: {avg_speed:.1f} km/h")
    print(f"   Max Speed: {max_speed:.1f} km/h")
    print(f"   Min Speed: {min_speed:.1f} km/h")
    print(f"   Intersections Passed: {len(tracker.intersections_passed)}")
    
    if tracker.intersections_passed:
        print(f"\nINTERSECTION LOG:")
        for i, inter in enumerate(tracker.intersections_passed, 1):
            print(f"   {i}. {inter}")
    
    # Preemption report
    if tracker.preemption_controller:
        preemption_summary = tracker.preemption_controller.get_preemption_summary()
        print(f"\nPREEMPTION SUMMARY:")
        print(f"   Total Preemptions: {preemption_summary['total_preemptions']}")
        print(f"   Signals Affected: {len(preemption_summary['signals_affected'])}")
        if preemption_summary['signals_affected']:
            print(f"   Signal List: {', '.join(preemption_summary['signals_affected'])}")
    
    # Save data
    os.makedirs("results", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path = f"results/ev_data_{timestamp}.csv"
    tracker.save_to_csv(csv_path)
    
    # Generate plot
    plot_path = f"results/ev_plot_{timestamp}.png"
    tracker.plot_speed(save_path=plot_path)
    
    print("\nReport generated successfully!")


def main():
    """Main entry point"""
    tracker = run_simulation()
    
    if tracker:
        generate_report(tracker)
    else:
        print("\nSimulation failed. Check SUMO installation.")
    
    print("\n" + "=" * 60)
    print("Phase 2 Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
