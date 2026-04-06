"""
ML-Based Preemption Controller with Cooldown
"""

import joblib
import numpy as np
import os
import traci
import math
import warnings

# Suppress sklearn feature name warnings
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')

class MLPreemptionController:
    def __init__(self, ev_id, model_path='models/preemption_model.pkl', threshold=0.65):
        self.ev_id = ev_id
        self.threshold = threshold
        self.model = None
        self.preempted_signals = {}  # Store {signal_id: preempt_time}
        self.cooldown_duration = 30  # Don't preempt same signal for 30 seconds after recovery
        self.preemption_log = []
        
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                print(f"[OK] Loaded ML model")
            except:
                self.model = None
        else:
            self.model = None
    
    def should_preempt_ml(self, distance, speed, queue_length, time_of_day, traffic_level):
        if self.model is None:
            return distance < 80, 0.5
        
        # Create feature array without column names to avoid warning
        features = np.array([[distance, speed, queue_length, time_of_day % 3600, traffic_level]])
        
        try:
            prob = self.model.predict_proba(features)[0]
            return prob[1] > self.threshold, prob[1]
        except:
            return distance < 80, 0.5
    
    def get_green_phase_for_ev(self, tls_id, ev_edge):
        horizontal_roads = ["I1_to_I2", "I2_to_I1", "I3_to_I4", "I4_to_I3", "I2_to_I4", "I4_to_I2"]
        return 2 if ev_edge in horizontal_roads else 0
    
    def get_signal_position(self, tls_id):
        try:
            return traci.junction.getPosition(tls_id)
        except:
            return None
    
    def check_and_preempt(self, current_time, distance, speed, queue_length, time_of_day, traffic_level):
        if self.ev_id not in traci.vehicle.getIDList():
            return False
        
        ev_edge = traci.vehicle.getRoadID(self.ev_id)
        
        for tls_id in traci.trafficlight.getIDList():
            # Skip if in cooldown (preempted within last 30 seconds)
            if tls_id in self.preempted_signals:
                last_preempt_time = self.preempted_signals[tls_id]
                if current_time - last_preempt_time < self.cooldown_duration:
                    continue  # Still in cooldown, skip
                else:
                    # Cooldown expired, remove from dict
                    del self.preempted_signals[tls_id]
            
            # Get distance to signal
            sig_pos = self.get_signal_position(tls_id)
            if sig_pos is None:
                continue
            
            ev_pos = traci.vehicle.getPosition(self.ev_id)
            dist_to_signal = math.sqrt((ev_pos[0] - sig_pos[0])**2 + (ev_pos[1] - sig_pos[1])**2)
            
            # Only consider if within 100m
            if dist_to_signal > 100:
                continue
            
            should_preempt, confidence = self.should_preempt_ml(
                dist_to_signal, speed, queue_length, time_of_day, traffic_level
            )
            
            if should_preempt:
                green_phase = self.get_green_phase_for_ev(tls_id, ev_edge)
                current_phase = traci.trafficlight.getPhase(tls_id)
                
                if current_phase != green_phase:
                    traci.trafficlight.setPhase(tls_id, green_phase)
                    self.preempted_signals[tls_id] = current_time  # Store preempt time
                    self.preemption_log.append({
                        'time': current_time,
                        'signal': tls_id,
                        'distance': dist_to_signal,
                        'confidence': confidence
                    })
                    print(f"  [ML] [{current_time:.1f}s] PREEMPTED {tls_id} (confidence: {confidence:.1%})")
                    return True
        
        return False
    
    def recover_signals(self, current_time):
        """Recover signals - no need to manually recover, they'll auto-cycle"""
        # Signals will naturally cycle after preemption ends
        pass
    
    def get_summary(self):
        return {
            'total_preemptions': len(self.preemption_log),
            'log': self.preemption_log
        }
