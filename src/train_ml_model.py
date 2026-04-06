"""
Train Machine Learning Model for Preemption Decision
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def train_preemption_model(data_path='data/ml_training_data.csv'):
    """
    Train Random Forest model to predict optimal preemption timing
    """
    
    print("=" * 60)
    print("Training ML Model for Emergency Vehicle Preemption")
    print("=" * 60)
    
    if not os.path.exists(data_path):
        print(f"Training data not found at {data_path}")
        print("Run simulation with data collection first!")
        return None
    
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples")
    
    feature_cols = ['distance_to_signal', 'ev_speed', 'queue_length', 'time_of_day', 'traffic_level']
    X = df[feature_cols]
    y = df['success']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Failed', 'Success']))
    
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nFeature Importance:")
    for _, row in feature_importance.iterrows():
        print(f"  {row['feature']}: {row['importance']:.2%}")
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/preemption_model.pkl')
    print("\nModel saved to: models/preemption_model.pkl")
    
    return model, accuracy

if __name__ == "__main__":
    train_preemption_model()
