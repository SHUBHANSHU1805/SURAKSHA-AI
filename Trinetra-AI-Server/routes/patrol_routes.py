from flask import Blueprint, request, jsonify
from services.firebase_service import FirebaseService
from services.ml_service import MLService
from services.route_service import RouteService
from utils.helpers import success_response, error_response
from utils.validators import validate_route_params

patrol_bp = Blueprint('patrol', __name__, url_prefix='/api/patrol')
firebase_service = FirebaseService()
ml_service = MLService()
route_service = RouteService()

@patrol_bp.route('/optimize', methods=['POST'])
def optimize_route():
    """Optimize patrol route"""
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is empty', None, 400)
            
        start_point = data.get('start_point')
        shift_duration = data.get('shift_duration', 8)
        avg_speed = data.get('avg_speed', 40)
        
        # Validate parameters
        is_valid, error_msg = validate_route_params(start_point, shift_duration, avg_speed)
        if not is_valid:
            return error_response(error_msg, None, 400)
            
        start_point = {
            'lat': float(start_point['lat']),
            'lng': float(start_point['lng'])
        }
        shift_duration = float(shift_duration)
        avg_speed = float(avg_speed)
        
        # Get crimes near the start point (radius of 50 km) for localized patrol planning
        crimes = firebase_service.get_nearby_firs(start_point['lat'], start_point['lng'], radius_km=50.0)
        
        # If not enough local crimes, fall back to general database listing
        if len(crimes) < 10:
            crimes = firebase_service.get_firs(None, 500)
            
        formatted_crimes = []
        for c in crimes:
            if 'location' in c and isinstance(c['location'], dict):
                c_lat = c['location'].get('lat')
                c_lng = c['location'].get('lng')
                if c_lat is not None and c_lng is not None:
                    formatted_crimes.append({
                        'lat': c_lat,
                        'lng': c_lng,
                        'severity': c.get('severity', 'Low')
                    })
        
        hotspots = ml_service.predict_crime_hotspots(formatted_crimes)
        
        # Optimize route
        optimized_route = route_service.optimize_patrol_route(
            hotspots,
            start_point,
            shift_duration,
            avg_speed
        )
        
        # Calculate stats
        stats = route_service.calculate_route_stats(optimized_route)
        
        return success_response({
            'route': optimized_route,
            'statistics': stats,
            'hotspots_count': len(hotspots)
        })
    except Exception as e:
        return error_response('Failed to optimize route', str(e), 500)
