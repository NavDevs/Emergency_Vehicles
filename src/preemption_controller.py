"""
Signal Preemption Controller for Emergency Vehicles
Makes traffic lights turn green when EV approaches
"""

import traci
import math
import os

class PreemptionController:
    def __init__(self, ev_id, preempt_distance=80):
        self.ev_id = ev_id
        self.preempt_distance = preempt_distance
        self.preempted_signals = set()
        self.signal_positions = {}
        self.recovery_needed = {}
        self.preemption_log = []
    
    def get_signal_position(self, tls_id):
        """Get position of traffic signal junction"""
        if tls_id not in self.signal_positions:
            try:
                self.signal_positions[tls_id] = traci.junction.getPosition(tls_id)
            except:
                return None
        return self.signal_positions[tls_id]
    
    def get_green_phase_for_ev(self, tls_id, ev_edge):
        """
        Determine which phase gives green light to EV's direction
        For our 4-intersection grid:
        - Phase 0: North-South green
        - Phase 2: East-West green
        """
        # EV traveling on horizontal roads (east-west)
        horizontal_roads = ["I1_to_I2", "I2_to_I1", "I3_to_I4", "I4_to_I3", "I2_to_I4", "I4_to_I2"]
        # EV traveling on vertical roads (north-south)
        vertical_roads = ["I1_to_I3", "I3_to_I1", "I2_to_I4", "I4_to_I2", "I1_to_I2", "I2_to_I1"]
        
        if ev_edge in horizontal_roads:
            return 2  # Phase 2 is East-West green
        else:
            return 0  # Phase 0 is North-South green
    
    def check_and_preempt(self, current_time):
        """Check if EV is approaching any signal and preempt if needed"""
        if self.ev_id not in traci.vehicle.getIDList():
            return False
        
        ev_pos = traci.vehicle.getPosition(self.ev_id)
        ev_edge = traci.vehicle.getRoadID(self.ev_id)
        
        if ev_edge == "" or ev_edge is None:
            return False
        
        # Get all traffic lights
        for tls_id in traci.trafficlight.getIDList():
            # Skip if already preempted
            if tls_id in self.preempted_signals:
                continue
            
            # Get signal position
            sig_pos = self.get_signal_position(tls_id)
            if sig_pos is None:
                continue
            
            # Calculate distance
            distance = math.sqrt((ev_pos[0] - sig_pos[0])**2 + (ev_pos[1] - sig_pos[1])**2)
            
            # If close enough, preempt
            if distance < self.preempt_distance:
                # Get the green phase for EV's direction
                green_phase = self.get_green_phase_for_ev(tls_id, ev_edge)
                
                if green_phase is not None:
                    current_phase = traci.trafficlight.getPhase(tls_id)
                    
                    # Only preempt if not already on the correct green
                    if current_phase != green_phase:
                        traci.trafficlight.setPhase(tls_id, green_phase)
                        self.preempted_signals.add(tls_id)
                        self.recovery_needed[tls_id] = current_time
                        self.preemption_log.append({
                            'time': current_time,
                            'signal': tls_id,
                            'distance': distance,
                            'phase': green_phase
                        })
                        print(f"  [PREEMPT] [{current_time:.1f}s] PREEMPTED {tls_id} - Green for EV!")
                        return True
                    else:
                        print(f"  [GREEN] [{current_time:.1f}s] {tls_id} already green for EV")
        
        return False
    
    def recover_signals(self, current_time):
        """Recover signals after EV has passed"""
        for tls_id in list(self.preempted_signals):
            # Check if EV has passed this signal
            if self._ev_passed_signal(tls_id):
                # Return to phase 0 (normal cycle start)
                traci.trafficlight.setPhase(tls_id, 0)
                self.preempted_signals.remove(tls_id)
                del self.recovery_needed[tls_id]
                print(f"  [RECOVER] [{current_time:.1f}s] Recovered {tls_id} - Back to normal")
    
    def _ev_passed_signal(self, tls_id):
        """Check if EV has passed this signal"""
        if self.ev_id not in traci.vehicle.getIDList():
            return True
        
        ev_pos = traci.vehicle.getPosition(self.ev_id)
        sig_pos = self.get_signal_position(tls_id)
        
        if sig_pos is None:
            return False
        
        # Get EV's current edge
        ev_edge = traci.vehicle.getRoadID(self.ev_id)
        
        # If EV is not on a road connected to this intersection, assume passed
        if tls_id not in ev_edge and tls_id.replace('I', '') not in ev_edge:
            return True
        
        # Check if EV is moving away from signal
        ev_speed = traci.vehicle.getSpeed(self.ev_id)
        if ev_speed > 5:
            dx = ev_pos[0] - sig_pos[0]
            dy = ev_pos[1] - sig_pos[1]
            distance = math.sqrt(dx**2 + dy**2)
            if distance > self.preempt_distance + 20:
                return True
        
        return False
    
    def get_preemption_summary(self):
        """Return summary of preemptions"""
        return {
            'total_preemptions': len(self.preemption_log),
            'signals_affected': list(set([log['signal'] for log in self.preemption_log])),
            'log': self.preemption_log
        }
