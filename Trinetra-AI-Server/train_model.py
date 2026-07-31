import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

def map_severity_score(val):
    # Map CSV severity (4-10) to 1-4 scale
    if val in [4, 5]:
        return 1  # Low
    elif val == 6:
        return 2  # Medium
    elif val in [7, 8]:
        return 3  # High
    else:
        return 4  # Critical

def train_crime_model():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CSV_PATH = os.path.join(BASE_DIR, 'data', 'india_crime_dataset_200k.csv')
    
    print(f"Loading real crime dataset from {CSV_PATH}...")
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV file not found at {CSV_PATH}")
        
    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df)} records. Starting feature engineering...")

    # Extract features
    lats = df['Latitude'].values
    lngs = df['Longitude'].values
    hours = df['Hour'].values
    
    # Convert date to day of week (0 = Monday, 6 = Sunday)
    print("Parsing date column...")
    dates = pd.to_datetime(df['Date'])
    days_of_week = dates.dt.weekday.values
    
    # Map severity to 1-4 scale
    severities = df['Severity'].apply(map_severity_score).values

    # Target label: 1 (High/Critical Severity Crime), 0 (Low/Medium Severity Crime)
    y = np.where(severities >= 3, 1, 0)
    
    # X features: [lat, lng, hour, day_of_week, severity_score]
    # We will train on a subset or full dataset. 200k is easily handled by RandomForest in a few seconds.
    X = np.column_stack((lats, lngs, hours, days_of_week, severities))
    
    print(f"Training RandomForest model on {len(df)} records...")
    # Use max_depth=10 and n_estimators=50 to train quickly and avoid overfitting
    model = RandomForestClassifier(n_estimators=50, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X, y)
    
    model_dir = os.path.join(BASE_DIR, "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "crime_prediction_model.pkl")
    
    print(f"Saving model to {model_path}...")
    joblib.dump(model, model_path)
    print("Model training successfully completed!")

if __name__ == "__main__":
    train_crime_model()
