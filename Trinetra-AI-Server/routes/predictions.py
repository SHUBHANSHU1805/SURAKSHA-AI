from flask import Blueprint, request, jsonify
from services.firebase_service import FirebaseService
from services.ml_service import MLService
from utils.helpers import success_response, error_response

predictions_bp = Blueprint('predictions', __name__, url_prefix='/api/predictions')
firebase_service = FirebaseService()
ml_service = MLService()

@predictions_bp.route('/hotspots', methods=['GET'])
def predict_hotspots():
    """Predict crime hotspots"""
    try:
        crimes = firebase_service.get_firs(None, 500)
        
        # Convert Firestore crimes to format needed by ML
        formatted_crimes = []
        for crime in crimes:
            if 'location' in crime and isinstance(crime['location'], dict):
                c_lat = crime['location'].get('lat')
                c_lng = crime['location'].get('lng')
                if c_lat is not None and c_lng is not None:
                    formatted_crimes.append({
                        'lat': c_lat,
                        'lng': c_lng,
                        'severity': crime.get('severity', 'Low'),
                        'crimeType': crime.get('crimeType')
                    })
        
        hotspots = ml_service.predict_crime_hotspots(formatted_crimes)
        
        return success_response({
            'hotspots': hotspots,
            'count': len(hotspots)
        })
    except Exception as e:
        return error_response('Failed to predict hotspots', str(e), 500)

@predictions_bp.route('/trends', methods=['GET'])
def predict_trends():
    """Predict crime trends for next N days"""
    try:
        days = int(request.args.get('days', 30))
        crimes = firebase_service.get_firs(None, 500)
        
        predictions = ml_service.predict_time_trend(crimes, days)
        
        return success_response({
            'predictions': predictions,
            'days': days
        })
    except Exception as e:
        return error_response('Failed to predict trends', str(e), 500)
