def validate_coordinates(lat, lng):
    """Validate latitude and longitude values"""
    if lat is None or lng is None:
        return False, "Coordinates cannot be null"
    try:
        lat_f = float(lat)
        lng_f = float(lng)
        if not (-90.0 <= lat_f <= 90.0):
            return False, f"Latitude {lat} is out of bounds (-90 to 90)"
        if not (-180.0 <= lng_f <= 180.0):
            return False, f"Longitude {lng} is out of bounds (-180 to 180)"
        return True, None
    except ValueError:
        return False, "Coordinates must be numeric values"

def validate_route_params(start_point, shift_duration, avg_speed):
    """Validate parameters for route optimization"""
    if not start_point or 'lat' not in start_point or 'lng' not in start_point:
        return False, "Missing or invalid start point"
    
    valid_coords, err = validate_coordinates(start_point['lat'], start_point['lng'])
    if not valid_coords:
        return False, err
        
    try:
        duration = float(shift_duration)
        if duration <= 0 or duration > 24:
            return False, "Shift duration must be between 0 and 24 hours"
    except ValueError:
        return False, "Shift duration must be numeric"

    try:
        speed = float(avg_speed)
        if speed <= 0 or speed > 150:
            return False, "Average speed must be between 0 and 150 km/h"
    except ValueError:
        return False, "Average speed must be numeric"
        
    return True, None
