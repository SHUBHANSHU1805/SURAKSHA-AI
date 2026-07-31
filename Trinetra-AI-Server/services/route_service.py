from utils.helpers import calculate_distance, haversine_distance
from datetime import timedelta

class RouteService:
    @staticmethod
    def optimize_patrol_route(hotspots, start_point, shift_duration=8, avg_speed=40):
        """Optimize patrol route using nearest neighbor algorithm"""
        try:
            if not hotspots:
                return []
            
            route = []
            current_location = start_point
            remaining_hotspots = list(hotspots)
            total_time = 0
            max_time = shift_duration * 60  # Convert to minutes
            
            while remaining_hotspots and total_time < max_time:
                # Find nearest hotspot
                nearest = None
                nearest_distance = float('inf')
                
                for hotspot in remaining_hotspots:
                    dist = calculate_distance(
                        current_location['lat'], current_location['lng'],
                        hotspot['lat'], hotspot['lng']
                    )
                    if dist < nearest_distance:
                        nearest = hotspot
                        nearest_distance = dist
                
                if nearest:
                    # Travel time in minutes
                    travel_time = (nearest_distance / avg_speed) * 60
                    stay_time = 15  # 15 minutes at each location
                    total_time += travel_time + stay_time
                    
                    if total_time <= max_time:
                        route.append({
                            'location': nearest,
                            'travel_distance': round(nearest_distance, 2),
                            'travel_time': round(travel_time, 2),
                            'stay_time': stay_time,
                            'arrival_time': round(travel_time, 2) if not route else round(route[-1]['arrival_time'] + route[-1]['stay_time'] + travel_time, 2)
                        })
                        
                        current_location = {'lat': nearest['lat'], 'lng': nearest['lng']}
                        remaining_hotspots.remove(nearest)
                    else:
                        break
                else:
                    break
            
            return route
        except Exception as e:
            print(f"Error optimizing route: {e}")
            return []

    @staticmethod
    def calculate_route_stats(route):
        """Calculate statistics for a patrol route"""
        try:
            if not route:
                return {
                    'total_distance': 0,
                    'total_travel_time': 0,
                    'total_stay_time': 0,
                    'total_time': 0,
                    'hotspots_covered': 0,
                    'efficiency': 0
                }
            
            total_distance = sum(leg['travel_distance'] for leg in route)
            total_travel_time = sum(leg['travel_time'] for leg in route)
            total_stay_time = sum(leg['stay_time'] for leg in route)
            total_time = total_travel_time + total_stay_time
            
            return {
                'total_distance': round(total_distance, 2),
                'total_travel_time': round(total_travel_time, 2),
                'total_stay_time': total_stay_time,
                'total_time': round(total_time, 2),
                'hotspots_covered': len(route),
                'efficiency': round((total_distance / total_time) if total_time > 0 else 0, 2)
            }
        except Exception as e:
            print(f"Error calculating route stats: {e}")
            return {}
