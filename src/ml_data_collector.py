"""
ML Data Collector - Collects training data from simulation
"""

import pandas as pd
import os

class MLDataCollector:
    def __init__(self):
        self.data = []
    
    def record_event(self, distance, speed, queue_length, time_of_day, 
                     traffic_level, preempted, success):
        """Record a preemption event for ML training"""
        
        self.data.append({
            'distance_to_signal': distance,
            'ev_speed': speed,
            'queue_length': queue_length,
            'time_of_day': time_of_day % 3600,
            'traffic_level': traffic_level,
            'preempted': 1 if preempted else 0,
            'success': 1 if success else 0
        })
    
    def save_data(self, filename):
        """Save collected data to CSV"""
        if not self.data:
            print("No data to save")
            return
        
        df = pd.DataFrame(self.data)
        os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else '.', exist_ok=True)
        df.to_csv(filename, index=False)
        print(f"Saved {len(self.data)} samples to {filename}")
        return df
    
    def get_data_count(self):
        return len(self.data)
