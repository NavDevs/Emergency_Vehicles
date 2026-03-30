"""
Minimal test - just open SUMO and run for 5 seconds
"""

import os
import traci
import time

project_root = r"C:\Users\huesh\Downloads\College Project\ev-priority-system"
sumo_config = os.path.join(project_root, "config", "simulation.sumocfg")
sumo_binary = r"C:\Program Files (x86)\Eclipse\Sumo\bin\sumo-gui.exe"

print("Starting SUMO...")
sumo_cmd = [sumo_binary, "-c", sumo_config]

try:
    traci.start(sumo_cmd)
    print("✅ SUMO is running!")
    
    print("Running for 10 seconds...")
    for step in range(100):  # 10 seconds at 0.1s steps
        traci.simulationStep()
        time.sleep(0.1)
        if step % 20 == 0:
            print(f"  Time: {traci.simulation.getTime():.1f}s")
    
    traci.close()
    print("✅ Test complete!")
    
except Exception as e:
    print(f"❌ Error: {e}")
