from flask import Blueprint, request, jsonify
from services.firebase_service import FirebaseService
from services.ml_service import MLService
from services.route_service import RouteService
from utils.helpers import success_response, error_response
from utils.validators import validate_route_params
import pandas as pd
import json
import os

patrol_bp = Blueprint('patrol', __name__, url_prefix='/api/patrol')
firebase_service = FirebaseService()
ml_service = MLService()
route_service = RouteService()

# Path to the real patrol routes dataset
PATROL_CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'india_patrol_routes.csv')

def _load_patrol_df():
    """Load and cache patrol CSV as DataFrame."""
    df = pd.read_csv(PATROL_CSV_PATH)
    return df

@patrol_bp.route('/routes', methods=['GET'])
def get_patrol_routes():
    """
    GET /api/patrol/routes
    Query params:
      - state    : filter by state name (optional)
      - status   : filter by Route_Status (optional)
      - risk     : filter by Risk_Level (optional)
      - page     : page number (default 1)
      - per_page : results per page (default 50, max 200)
    """
    try:
        df = _load_patrol_df()

        # --- Filters ---
        state  = request.args.get('state', '').strip()
        status = request.args.get('status', '').strip()
        risk   = request.args.get('risk', '').strip()

        if state:
            df = df[df['State'].str.lower() == state.lower()]
        if status:
            df = df[df['Route_Status'].str.lower() == status.lower()]
        if risk:
            df = df[df['Risk_Level'].str.upper() == risk.upper()]

        total = len(df)

        # --- Pagination ---
        try:
            page     = max(1, int(request.args.get('page', 1)))
            per_page = min(200, max(1, int(request.args.get('per_page', 50))))
        except ValueError:
            page, per_page = 1, 50

        start_idx = (page - 1) * per_page
        end_idx   = start_idx + per_page
        page_df   = df.iloc[start_idx:end_idx]

        routes = []
        for _, row in page_df.iterrows():
            # Parse checkpoint JSON
            try:
                checkpoints = json.loads(row['Route_Checkpoints'])
                waypoints = [
                    {'lat': cp['latitude'], 'lng': cp['longitude']}
                    for cp in checkpoints
                ]
            except Exception:
                # Fallback: just use start/end if JSON parsing fails
                waypoints = [
                    {'lat': float(row['Start_Latitude']), 'lng': float(row['Start_Longitude'])},
                    {'lat': float(row['End_Latitude']),   'lng': float(row['End_Longitude'])}
                ]

            # Map Route_Status → frontend-friendly label
            status_map = {
                'In Progress': 'Active',
                'Scheduled':   'Scheduled',
                'Completed':   'Completed',
                'Cancelled':   'Cancelled'
            }
            display_status = status_map.get(str(row.get('Route_Status', '')), str(row.get('Route_Status', 'Unknown')))

            routes.append({
                'id':                   str(row['Route_ID']),
                'name':                 f"{row['Patrol_Type']} — {row['Zone_ID']}",
                'state':                str(row['State']),
                'zone':                 str(row['Zone_ID']),
                'patrol_type':          str(row['Patrol_Type']),
                'route_source':         str(row['Route_Source']),
                'risk_level':           str(row['Risk_Level']),
                'hotspot_score':        float(row['Hotspot_Score']),
                'crime_count':          int(row['Crime_Count']),
                'patrol_date':          str(row['Patrol_Date']),
                'patrol_shift':         str(row['Patrol_Shift']),
                'vehicle_type':         str(row['Vehicle_Type']),
                'assigned_officers':    int(row['Assigned_Officers']),
                'distance_km':          float(row['Distance_KM']),
                'estimated_duration':   int(row['Estimated_Duration_Minutes']),
                'total_checkpoints':    int(row['Total_Checkpoints']),
                'status':               display_status,
                'start': {
                    'lat': float(row['Start_Latitude']),
                    'lng': float(row['Start_Longitude']),
                    'label': f"{row['Zone_ID']} Start"
                },
                'end': {
                    'lat': float(row['End_Latitude']),
                    'lng': float(row['End_Longitude']),
                    'label': f"{row['Zone_ID']} End"
                },
                'waypoints': waypoints
            })

        return success_response({
            'routes':     routes,
            'total':      total,
            'page':       page,
            'per_page':   per_page,
            'total_pages': (total + per_page - 1) // per_page
        })

    except Exception as e:
        return error_response('Failed to load patrol routes', str(e), 500)


@patrol_bp.route('/states', methods=['GET'])
def get_patrol_states():
    """GET /api/patrol/states — Return list of distinct states in the dataset."""
    try:
        df = _load_patrol_df()
        states = sorted(df['State'].dropna().unique().tolist())
        return success_response({'states': states})
    except Exception as e:
        return error_response('Failed to load states', str(e), 500)


@patrol_bp.route('/optimize', methods=['POST'])
def optimize_route():
    """Optimize patrol route using AI hotspot prediction (existing)."""
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is empty', None, 400)

        start_point    = data.get('start_point')
        shift_duration = data.get('shift_duration', 8)
        avg_speed      = data.get('avg_speed', 40)

        is_valid, error_msg = validate_route_params(start_point, shift_duration, avg_speed)
        if not is_valid:
            return error_response(error_msg, None, 400)

        start_point = {
            'lat': float(start_point['lat']),
            'lng': float(start_point['lng'])
        }
        shift_duration = float(shift_duration)
        avg_speed      = float(avg_speed)

        crimes = firebase_service.get_nearby_firs(start_point['lat'], start_point['lng'], radius_km=50.0)
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
        optimized_route = route_service.optimize_patrol_route(
            hotspots, start_point, shift_duration, avg_speed
        )
        stats = route_service.calculate_route_stats(optimized_route)

        return success_response({
            'route':          optimized_route,
            'statistics':     stats,
            'hotspots_count': len(hotspots)
        })
    except Exception as e:
        return error_response('Failed to optimize route', str(e), 500)
