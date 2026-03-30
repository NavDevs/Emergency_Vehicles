"""
Simple test to check if SUMO loads correctly
"""

import os
import traci

# IMPORTANT: Use raw string with quotes for paths with spaces
project_root = r"C:\Users\huesh\Downloads\College Project\ev-priority-system"
sumo_config = os.path.join(project_root, "config", "simulation.sumocfg")

print(f"Looking for config at: {sumo_config}")

# Check if file exists
if os.path.exists(sumo_config):
    print("✅ Config file found!")
    
    # Print file content to debug
    print("\n--- Config file content ---")
    with open(sumo_config, 'r') as f:
        print(f.read())
    print("--- End of config ---\n")
    
else:
    print(f"❌ Config file NOT found!")
    # List what's in config folder
    config_folder = os.path.join(project_root, "config")
    if os.path.exists(config_folder):
        print(f"\nFiles in config folder:")
        for f in os.listdir(config_folder):
            print(f"  - {f}")
    exit()

# Try to start SUMO
sumo_binary = r"C:\Program Files (x86)\Eclipse\Sumo\bin\sumo-gui.exe"
sumo_cmd = [sumo_binary, "-c", sumo_config, "--start"]

print(f"\nStarting SUMO with command: {sumo_cmd}")

try:
    traci.start(sumo_cmd)
    print("✅ SUMO started successfully!")
    
    print("Simulation running for 10 seconds...")
    import time
    for i in range(10):
        traci.simulationStep()
        time.sleep(1)
        print(f"  Step {i+1}, time: {traci.simulation.getTime():.1f}s")
    
    traci.close()
    print("✅ Test complete!")
    
except Exception as e:
    print(f"❌ Error: {e}")
