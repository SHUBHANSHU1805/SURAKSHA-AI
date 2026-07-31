from flask import Blueprint, request, jsonify
from services.firebase_service import FirebaseService
from services.analytics_service import AnalyticsService
from utils.helpers import success_response, error_response

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')
firebase_service = FirebaseService()
analytics_service = AnalyticsService()

@analytics_bp.route('/overall', methods=['GET'])
def get_overall_stats():
    """Get overall crime statistics"""
    try:
        stats = analytics_service.get_crime_statistics()
        
        return success_response(stats)
    except Exception as e:
        return error_response('Failed to fetch statistics', str(e), 500)

@analytics_bp.route('/time-analysis', methods=['GET'])
def get_time_analysis():
    """Get crime analysis by time"""
    try:
        analysis = analytics_service.get_time_analysis()
        
        return success_response(analysis)
    except Exception as e:
        return error_response('Failed to analyze time', str(e), 500)

@analytics_bp.route('/states', methods=['GET'])
def get_state_stats():
    """Get crime statistics by state"""
    try:
        states = firebase_service.get_states()
        
        return success_response({
            'states': states,
            'count': len(states)
        })
    except Exception as e:
        return error_response('Failed to fetch state statistics', str(e), 500)

@analytics_bp.route('/states/<state_name>/cities', methods=['GET'])
def get_city_stats(state_name):
    """Get crime statistics for cities in a state"""
    try:
        cities = firebase_service.get_cities_by_state(state_name)
        
        return success_response({
            'state': state_name,
            'cities': cities,
            'count': len(cities)
        })
    except Exception as e:
        return error_response('Failed to fetch city statistics', str(e), 500)

@analytics_bp.route('/safety-index', methods=['POST'])
def get_safety_index():
    """Calculate safety index for a location"""
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is empty', None, 400)
            
        location = data.get('location')
        if not location or 'lat' not in location or 'lng' not in location:
            return error_response('Missing location coordinates', None, 400)
        
        try:
            location = {
                'lat': float(location['lat']),
                'lng': float(location['lng'])
            }
        except ValueError:
            return error_response('Location coordinates must be numeric', None, 400)
            
        index = analytics_service.calculate_safety_index(location=location)
        
        return success_response({
            'location': location,
            'safety_index': round(index, 2),
            'level': 'Safe' if index >= 70 else 'Moderate' if index >= 40 else 'Unsafe'
        })
    except Exception as e:
        return error_response('Failed to calculate safety index', str(e), 500)

@analytics_bp.route('/states/<state_name>/details', methods=['GET'])
def get_state_details(state_name):
    """Get detailed database-backed analytics for a state"""
    try:
        details = analytics_service.get_state_detailed_analytics(state_name)
        return success_response(details)
    except Exception as e:
        return error_response(f'Failed to fetch detailed analytics for {state_name}', str(e), 500)

