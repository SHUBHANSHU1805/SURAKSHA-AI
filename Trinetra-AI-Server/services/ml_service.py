import numpy as np
import joblib
from datetime import datetime, timedelta
from config import Config
import os

class MLService:
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        """Load ML model from disk"""
        try:
            model_path = Config.MODEL_PATH
            # Ensure path is relative to server root
            if not os.path.isabs(model_path):
                BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                model_path = os.path.join(BASE_DIR, model_path)
                
            if os.path.exists(model_path):
                print(f"Loading trained ML model from {model_path}...")
                self.model = joblib.load(model_path)
            else:
                print("Trained model not found. Generating dummy model...")
                self.model = self.create_dummy_model()
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = self.create_dummy_model()

    def create_dummy_model(self):
        """Create a simple model for demonstration if not trained"""
        from sklearn.ensemble import RandomForestClassifier
        
        # Dummy training data
        X = np.random.rand(100, 5)  # 5 features
        y = np.random.randint(0, 2, 100)  # Binary classification
        
        model = RandomForestClassifier(n_estimators=10, random_state=42)
        model.fit(X, y)
        
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(BASE_DIR, Config.MODEL_PATH)
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump(model, model_path)
        
        return model

    def predict_crime_hotspots(self, crimes, grid_size=0.05):
        """Predict crime hotspots using ML predictions on historical coordinates"""
        try:
            if not crimes:
                return []

            # Filter out crimes without valid coordinates
            valid_crimes = [c for c in crimes if c.get('lat') is not None and c.get('lng') is not None]
            if not valid_crimes:
                return []

            # Create grid
            min_lat = min(c['lat'] for c in valid_crimes)
            max_lat = max(c['lat'] for c in valid_crimes)
            min_lng = min(c['lng'] for c in valid_crimes)
            max_lng = max(c['lng'] for c in valid_crimes)

            hotspots = []
            lat = min_lat
            
            # Grid traversal
            while lat <= max_lat:
                lng = min_lng
                while lng <= max_lng:
                    count = 0
                    severity_sum = 0
                    
                    for crime in valid_crimes:
                        c_lat = crime['lat']
                        c_lng = crime['lng']
                        
                        if lat <= c_lat < lat + grid_size and lng <= c_lng < lng + grid_size:
                            count += 1
                            severity_sum += self._get_severity_score(crime.get('severity'))
                    
                    if count > 0:
                        # Grid cell center
                        cell_lat = round(lat + grid_size/2, 4)
                        cell_lng = round(lng + grid_size/2, 4)
                        avg_sev_score = severity_sum / count
                        
                        avg_prob = 0.0
                        if self.model is not None:
                            try:
                                # Feature Vector: [lat, lng, hour, day_of_week, severity_score]
                                # Query the model at representative peak hours to find average risk
                                sample_features = []
                                test_hours = [4, 12, 18, 22]
                                for hr in test_hours:
                                    sample_features.append([cell_lat, cell_lng, hr, 4, avg_sev_score])
                                
                                probs = self.model.predict_proba(sample_features)
                                avg_prob = float(np.mean(probs[:, 1]))
                            except Exception as pred_err:
                                print(f"Prediction failed, falling back to heuristic: {pred_err}")
                                avg_prob = avg_sev_score / 4.0
                        else:
                            avg_prob = avg_sev_score / 4.0

                        # Map probability to Risk Level
                        if avg_prob >= 0.5:
                            risk_level = 'High'
                        elif avg_prob >= 0.25:
                            risk_level = 'Medium'
                        else:
                            risk_level = 'Low'
                        
                        hotspots.append({
                            'lat': cell_lat,
                            'lng': cell_lng,
                            'crime_count': count,
                            'risk_level': risk_level,
                            'avg_severity': round(avg_sev_score, 2),
                            'prediction_confidence': round(float(avg_prob), 2)
                        })
                    
                    lng += grid_size
                lat += grid_size
            
            # Sort by crime count/severity
            hotspots.sort(key=lambda x: (x['crime_count'], x['avg_severity']), reverse=True)
            return hotspots[:30]  # Return top 30
        
        except Exception as e:
            print(f"Error predicting hotspots: {e}")
            return []

    def predict_time_trend(self, crimes, days=30):
        """Predict crime trends for next N days"""
        try:
            if not crimes:
                return []

            daily_counts = {}
            today = datetime.now().date()
            
            for crime in crimes:
                if 'createdAt' in crime:
                    try:
                        crime_date = datetime.fromisoformat(crime['createdAt'].split('T')[0]).date()
                        days_diff = (today - crime_date).days
                        
                        if days_diff < 90:  # Last 90 days
                            if crime_date not in daily_counts:
                                daily_counts[crime_date] = 0
                            daily_counts[crime_date] += 1
                    except Exception as date_err:
                        print(f"Error parsing date {crime.get('createdAt')}: {date_err}")
            
            # Calculate average
            if daily_counts:
                avg = sum(daily_counts.values()) / len(daily_counts)
            else:
                avg = 0
            
            # Predict for next N days
            predictions = []
            for i in range(days):
                future_date = today + timedelta(days=i)
                # Simple trend: average with random variation
                predicted_count = max(0, int(avg + np.random.normal(0, 2)))
                
                predictions.append({
                    'date': str(future_date),
                    'predicted_crimes': predicted_count,
                    'confidence': 0.65
                })
            
            return predictions
        
        except Exception as e:
            print(f"Error predicting trends: {e}")
            return []

    @staticmethod
    def _get_severity_score(severity):
        """Convert severity to numeric score"""
        scores = {'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4}
        return scores.get(severity, 1)
