"""
Run multiple simulations to collect training data for ML
"""

import os
import sys
import traci
import time
from ml_data_collector import MLDataCollector

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_single_simulation(run_num, collector):
    """Run one simulation and collect data"""
    
    sumo_config = os.path.join(PROJECT_ROOT, "config", "simulation.sumocfg")
    sumo_binary = r"C:\Program Files (x86)\Eclipse\Sumo\bin\sumo.exe"
    sumo_cmd = [sumo_binary, "-c", sumo_config, "--no-warnings", "--quit-on-end"]
    
    traci.start(sumo_cmd)
    
    ev_added = False
    step = 0
    max_steps = 36000
    
    while step < max_steps:
        sim_time = traci.simulation.getTime()
        
        if not ev_added and sim_time >= 30:
            route_edges = ["I1_to_I2", "I2_to_I4", "I4_to_I3"]
            route_id = f"ev_route_{run_num}"
            traci.route.add(route_id, route_edges)
            ev_id = f"emergency_vehicle_{run_num}"
            traci.vehicle.add(ev_id, route_id, depart=sim_time, typeID="emergency_vehicle")
            traci.vehicle.setColor(ev_id, (255, 0, 0))
            ev_added = True
        
        # Record preemption data at each intersection approach
        if ev_added and ev_id in traci.vehicle.getIDList():
            # Get EV position and speed
            ev_pos = traci.vehicle.getPosition(ev_id)
            ev_speed = traci.vehicle.getSpeed(ev_id)
            ev_edge = traci.vehicle.getRoadID(ev_id)
            
            # For each traffic light, record distance
            for tls_id in traci.trafficlight.getIDList():
                try:
                    sig_pos = traci.junction.getPosition(tls_id)
                    distance = ((ev_pos[0] - sig_pos[0])**2 + (ev_pos[1] - sig_pos[1])**2)**0.5
                    
                    if distance < 150:  # Only record when close
                        queue_length = traci.edge.getLastStepVehicleNumber(f"{tls_id}_approach") if f"{tls_id}_approach" in traci.edge.getIDList() else 0
                        
                        collector.record_event(
                            distance=distance,
                            speed=ev_speed,
                            queue_length=queue_length,
                            time_of_day=sim_time,
                            traffic_level=1,  # Medium traffic
                            preempted=True,
                            success=ev_speed > 5  # Success if moving faster than 5 m/s
                        )
                except:
                    pass
        
        traci.simulationStep()
        step += 1
    
    traci.close()
    return True

def collect_data(num_runs=50):
    """Run multiple simulations and collect data"""
    
    print("=" * 60)
    print("Collecting Training Data for ML Model")
    print("=" * 60)
    print(f"Will run {num_runs} simulations...")
    
    collector = MLDataCollector()
    
    for i in range(num_runs):
        print(f"Run {i+1}/{num_runs}...")
        try:
            run_single_simulation(i, collector)
        except Exception as e:
            print(f"  Error in run {i+1}: {e}")
        time.sleep(0.5)
    
    # Save collected data
    os.makedirs('data', exist_ok=True)
    collector.save_data('data/ml_training_data.csv')
    
    print(f"\nData collection complete!")
    print(f"Total samples: {collector.get_data_count()}")

if __name__ == "__main__":
    collect_data(50)
