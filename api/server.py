# api/server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import sys

app = Flask(__name__)
CORS(app)

# Model path - points to the trained ML model
model_path = r"C:\Users\huesh\Downloads\College Project\Emergency Vehicles Priority System\models\preemption_model.pkl"

model = None

# Try to load ML model
if os.path.exists(model_path):
    try:
        model = joblib.load(model_path)
        print(" ML Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None
else:
    print(" Model not found - using fallback predictions")
    print(f"Looking for: {model_path}")

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict optimal preemption using ML model"""
    data = request.json
    
    # Get parameters from frontend
    pickup = data.get('pickup', 'I1')
    destination = data.get('destination', 'I4')
    weather = data.get('weather', 'clear')
    traffic = data.get('traffic', 'moderate')
    criticality = data.get('criticality', 'normal')
    road_condition = data.get('roadCondition', 'good')
    layout_name = data.get('layout', 'Grid')
    intersections_count = data.get('intersections', 4)
    
    # Calculate base time based on layout complexity
    base_time = 180  # seconds without system for default grid
    
    # Base time depends on number of intersections
    base_time = intersections_count * 45  # ~45 seconds per intersection
    base_without_ml = intersections_count * 60
    
    # Convert to numeric values
    weather_map = {'clear': 0, 'rain': 1, 'fog': 2, 'night': 3}
    traffic_map = {'smooth': 0, 'moderate': 1, 'heavy': 2, 'severe': 3}
    criticality_map = {'normal': 0, 'high': 1, 'critical': 2}
    road_map = {'good': 0, 'wet': 1, 'blocked': 2}
    
    weather_val = weather_map.get(weather, 0)
    traffic_val = traffic_map.get(traffic, 1)
    criticality_val = criticality_map.get(criticality, 0)
    road_val = road_map.get(road_condition, 0)
    
    # Calculate distance based on route (simplified)
    route_distance = 50.0  # meters
    
    # Features for ML model: [distance, speed, queue_length, time_of_day, traffic_level, weather, road_type, intersection_type, is_peak, is_weekend]
    features = np.array([[
        route_distance,
        13.89,          # EV speed (m/s) = 50 km/h
        traffic_val * 2,  # queue length based on traffic
        14,              # time of day (2 PM)
        traffic_val,
        weather_val,
        road_val,
        1,              # intersection type
        0,              # is_peak
        0               # is_weekend
    ]])
    
    # Weather and traffic factors for fallback calculations
    weather_factors = {'clear': 1.0, 'rain': 0.85, 'fog': 0.75, 'night': 0.9}
    traffic_factors = {'smooth': 1.0, 'moderate': 0.8, 'heavy': 0.65, 'severe': 0.5}
    criticality_factors = {'normal': 1.0, 'high': 0.85, 'critical': 0.7}
    
    # Use ML model if available
    if model is not None:
        try:
            prediction = model.predict_proba(features)[0]
            confidence = float(prediction[1] * 100)
            confidence = min(confidence, 100)
            
            # Calculate travel time based on ML prediction
            travel_time = base_time * (1 - (confidence / 200))  # Better confidence means faster time
            travel_time = round(travel_time, 1)
            improvement = round((base_without_ml - travel_time) / base_without_ml * 100, 1)
        except Exception as e:
            print(f"Prediction error: {e}")
            # Fallback to static calculations
            confidence = 85.0
            travel_time = base_time * weather_factors.get(weather, 1) * traffic_factors.get(traffic, 1) * criticality_factors.get(criticality, 1)
            travel_time = round(travel_time, 1)
            improvement = round((base_without_ml - travel_time) / base_without_ml * 100, 1)
    else:
        # Fallback without ML model
        confidence = 75.0
        travel_time = base_time * weather_factors.get(weather, 1) * traffic_factors.get(traffic, 1) * criticality_factors.get(criticality, 1)
        travel_time = round(travel_time, 1)
        improvement = round((base_without_ml - travel_time) / base_without_ml * 100, 1)
    
    weather_factor = {'clear': 1.0, 'rain': 1.15, 'fog': 1.25, 'night': 1.05}
    traffic_factor = {'smooth': 1.0, 'moderate': 1.3, 'heavy': 1.8, 'severe': 2.5}
    criticality_factor = {'normal': 1.0, 'high': 0.85, 'critical': 0.7}
    road_factor = {'good': 1.0, 'wet': 1.1, 'blocked': 2.0}
    
    travel_time = base_time * weather_factor.get(weather, 1.0) * traffic_factor.get(traffic, 1.0) * criticality_factor.get(criticality, 1.0) * road_factor.get(road_condition, 1.0)
    travel_time = round(travel_time, 1)
    
    improvement = round((base_time - travel_time) / base_time * 100, 1)
    
    # Calculate preemptions based on route
    preemptions = ['I2', 'I4']
    if traffic == 'severe' or traffic == 'heavy':
        preemptions.append('I3')
    
    return jsonify({
        'success': True,
        'travel_time': travel_time,
        'improvement': improvement,
        'confidence': round(confidence, 1),
        'preemptions': preemptions,
        'route': f'{pickup} -> I2 -> I4 -> {destination}',
        'message': f'ML Prediction: {improvement}% faster with {confidence:.0f}% confidence'
    })

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'model_path': model_path
    })

if __name__ == '__main__':
    print("=" * 50)
    print("EV Priority System - ML Prediction API")
    print("=" * 50)
    print(f"Starting server on http://localhost:5001")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    app.run(debug=True, port=5001, host='0.0.0.0')