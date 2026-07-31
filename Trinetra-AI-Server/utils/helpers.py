from datetime import datetime, timedelta
import math
from geopy.distance import geodesic

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two coordinates in km"""
    try:
        coords1 = (lat1, lng1)
        coords2 = (lat2, lng2)
        return round(geodesic(coords1, coords2).km, 2)
    except Exception as e:
        print(f"Error calculating distance: {e}")
        return 0

def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance using Haversine formula"""
    R = 6371  # Earth radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def get_time_period(hour):
    """Get time period from hour"""
    from .constants import TIME_PERIODS
    
    for period, (start, end) in TIME_PERIODS.items():
        if start <= hour < end:
            return period
    return 'night'

def format_datetime(dt):
    """Format datetime to ISO string"""
    if isinstance(dt, str):
        return dt
    return dt.isoformat()

def get_severity_score(severity):
    """Convert severity to numeric score"""
    scores = {
        'Low': 1,
        'Medium': 2,
        'High': 3,
        'Critical': 4
    }
    return scores.get(severity, 1)

def calculate_crime_density(crimes, lat, lng, radius=1.0):
    """Calculate crime density around a point"""
    if not crimes:
        return 0
    
    count = 0
    total_severity = 0
    
    for crime in crimes:
        dist = calculate_distance(lat, lng, crime.get('lat'), crime.get('lng'))
        if dist <= radius:
            count += 1
            total_severity += get_severity_score(crime.get('severity', 'Low'))
    
    if count == 0:
        return 0
    
    return round((count * total_severity) / (radius * 10), 2)

def paginate(items, page, per_page):
    """Paginate a list of items"""
    total = len(items)
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        'items': items[start:end],
        'page': page,
        'per_page': per_page,
        'total': total,
        'pages': math.ceil(total / per_page)
    }

def success_response(data, message='Success', status_code=200):
    """Create a success response"""
    return {
        'success': True,
        'message': message,
        'data': data,
        'status': status_code
    }, status_code

def error_response(message, error=None, status_code=400):
    """Create an error response"""
    return {
        'success': False,
        'message': message,
        'error': str(error) if error else None,
        'status': status_code
    }, status_code
