from flask import Blueprint, request, jsonify
from services.firebase_service import FirebaseService
from utils.helpers import success_response, error_response
import math

crimes_bp = Blueprint('crimes', __name__, url_prefix='/api/crimes')
firebase_service = FirebaseService()

@crimes_bp.route('/', methods=['GET'])
def get_crimes():
    """Get all crimes with filters and pagination"""
    try:
        # Build filters dictionary
        filters = {
            'state': request.args.get('state'),
            'city': request.args.get('city'),
            'crimeType': request.args.get('crimeType'),
            'severity': request.args.get('severity'),
            'status': request.args.get('status')
        }
        
        # Accept flags if provided
        women_flag = request.args.get('womenCrimeFlag') or request.args.get('women_crime_flag')
        if women_flag is not None and women_flag != '':
            try:
                filters['women_crime_flag'] = int(women_flag)
            except ValueError:
                pass
            
        cyber_flag = request.args.get('cyberCrimeFlag') or request.args.get('cyber_crime_flag')
        if cyber_flag is not None and cyber_flag != '':
            try:
                filters['cyber_crime_flag'] = int(cyber_flag)
            except ValueError:
                pass

        # Remove None/empty strings
        filters = {k: v for k, v in filters.items() if v is not None and v != ''}
        
        # Pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 100))
        offset = (page - 1) * limit
        
        # Query database
        firs = firebase_service.get_firs(filters, limit, offset)
        total_count = firebase_service.get_firs_count(filters)
        total_pages = math.ceil(total_count / limit) if limit > 0 else 1
        
        return success_response({
            'crimes': firs,
            'count': total_count,
            'page': page,
            'limit': limit,
            'pages': total_pages
        })
    except Exception as e:
        return error_response('Failed to fetch crimes', str(e), 500)

@crimes_bp.route('/', methods=['POST'])
def create_crime():
    """Create a new crime report (FIR)"""
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is empty', None, 400)
            
        fir_id = firebase_service.add_fir(data)
        if fir_id:
            # Fetch the newly created crime to return it
            fir = firebase_service.get_fir_by_id(fir_id)
            return success_response(fir, 'Crime report created successfully', 201)
        else:
            return error_response('Failed to create crime report', None, 500)
    except Exception as e:
        return error_response('Failed to create crime report', str(e), 500)

@crimes_bp.route('/<fir_id>', methods=['GET'])
def get_crime(fir_id):
    """Get single crime by ID"""
    try:
        fir = firebase_service.get_fir_by_id(fir_id)
        if not fir:
            return error_response('Crime not found', None, 404)
        
        return success_response(fir)
    except Exception as e:
        return error_response('Failed to fetch crime', str(e), 500)

@crimes_bp.route('/<fir_id>', methods=['PUT'])
def update_crime(fir_id):
    """Update crime status/details"""
    try:
        data = request.get_json()
        if not data:
            return error_response('No data provided', None, 400)
        
        success = firebase_service.update_fir(fir_id, data)
        if success:
            fir = firebase_service.get_fir_by_id(fir_id)
            return success_response(fir, 'Crime report updated successfully')
        else:
            return error_response('Failed to update crime report', None, 500)
    except Exception as e:
        return error_response('Failed to update crime report', str(e), 500)

@crimes_bp.route('/<fir_id>', methods=['DELETE'])
def delete_crime(fir_id):
    """Delete crime by ID"""
    try:
        success = firebase_service.delete_fir(fir_id)
        if success:
            return success_response({'id': fir_id}, 'Crime report deleted successfully')
        else:
            return error_response('Crime report not found or failed to delete', None, 404)
    except Exception as e:
        return error_response('Failed to delete crime report', str(e), 500)

@crimes_bp.route('/nearby', methods=['POST'])
def get_nearby_crimes():
    """Get crimes near a location using geofenced query"""
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is empty', None, 400)
            
        lat = data.get('lat')
        lng = data.get('lng')
        radius = data.get('radius', 1)  # km
        
        if lat is None or lng is None:
            return error_response('Missing coordinates', None, 400)
        
        try:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)
        except ValueError:
            return error_response('Coordinates and radius must be numeric', None, 400)
        
        # Use our high-performance bounding box query
        nearby = firebase_service.get_nearby_firs(lat, lng, radius)
        
        return success_response({
            'crimes': nearby,
            'count': len(nearby),
            'center': {'lat': lat, 'lng': lng}
        })
    except Exception as e:
        return error_response('Failed to fetch nearby crimes', str(e), 500)
