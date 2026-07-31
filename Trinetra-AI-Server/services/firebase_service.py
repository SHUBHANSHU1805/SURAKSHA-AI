import sqlite3
import os
import uuid
from datetime import datetime
from config import Config
from utils.helpers import get_severity_score, calculate_distance

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'crime_data.db')

class FirebaseService:
    def __init__(self):
        # We preserve the class name to avoid breaking imports in routes and ML files.
        # Check if database exists, if not try to warn or locate it
        if not os.path.exists(DB_PATH):
            print(f"WARNING: SQLite database not found at {DB_PATH}. Run import_dataset.py first.")

    def _get_conn(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _row_to_fir(self, row):
        """Convert a SQLite row to the FIR dict format expected by the frontend"""
        if not row:
            return None
        
        return {
            'id': row['id'],
            'crimeType': row['crime_type'],
            'severity': row['severity'],
            'severity_num': row['severity_num'],
            'status': row['status'],
            'createdAt': row['created_at'],
            'ipcSection': row['ipc_section'],
            'womenCrimeFlag': row['women_crime_flag'],
            'cyberCrimeFlag': row['cyber_crime_flag'],
            'patrolPriority': row['patrol_priority'],
            'location': {
                'state': row['state'],
                'city': row['city'],
                'lat': row['lat'],
                'lng': row['lng']
            }
        }

    def get_firs(self, filters=None, limit=100, offset=0):
        """Get FIRs from SQLite database with pagination and filtering"""
        conn = self._get_conn()
        cursor = conn.cursor()

        query = "SELECT * FROM firs"
        conditions = []
        params = []

        if filters:
            if filters.get('state'):
                conditions.append("state = ?")
                params.append(filters['state'])
            if filters.get('city'):
                conditions.append("city = ?")
                params.append(filters['city'])
            if filters.get('crimeType'):
                conditions.append("crime_type = ?")
                params.append(filters['crimeType'])
            if filters.get('severity'):
                conditions.append("severity = ?")
                params.append(filters['severity'])
            if filters.get('status'):
                conditions.append("status = ?")
                params.append(filters['status'])
            if filters.get('women_crime_flag') is not None:
                conditions.append("women_crime_flag = ?")
                params.append(int(filters['women_crime_flag']))
            if filters.get('cyber_crime_flag') is not None:
                conditions.append("cyber_crime_flag = ?")
                params.append(int(filters['cyber_crime_flag']))

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        try:
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [self._row_to_fir(row) for row in rows]
        except Exception as e:
            print(f"Error querying FIRs: {e}")
            return []
        finally:
            conn.close()

    def get_firs_count(self, filters=None):
        """Get total count of matching FIRs in SQLite database"""
        conn = self._get_conn()
        cursor = conn.cursor()

        query = "SELECT COUNT(*) FROM firs"
        conditions = []
        params = []

        if filters:
            if filters.get('state'):
                conditions.append("state = ?")
                params.append(filters['state'])
            if filters.get('city'):
                conditions.append("city = ?")
                params.append(filters['city'])
            if filters.get('crimeType'):
                conditions.append("crime_type = ?")
                params.append(filters['crimeType'])
            if filters.get('severity'):
                conditions.append("severity = ?")
                params.append(filters['severity'])
            if filters.get('status'):
                conditions.append("status = ?")
                params.append(filters['status'])
            if filters.get('women_crime_flag') is not None:
                conditions.append("women_crime_flag = ?")
                params.append(int(filters['women_crime_flag']))
            if filters.get('cyber_crime_flag') is not None:
                conditions.append("cyber_crime_flag = ?")
                params.append(int(filters['cyber_crime_flag']))

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        try:
            cursor.execute(query, params)
            return cursor.fetchone()[0]
        except Exception as e:
            print(f"Error counting FIRs: {e}")
            return 0
        finally:
            conn.close()

    def get_fir_by_id(self, fir_id):
        """Get a single FIR by its ID"""
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT * FROM firs WHERE id = ?", (fir_id,))
            row = cursor.fetchone()
            return self._row_to_fir(row)
        except Exception as e:
            print(f"Error fetching FIR {fir_id}: {e}")
            return None
        finally:
            conn.close()

    def add_fir(self, fir_data):
        """Insert a new FIR into the SQLite database"""
        conn = self._get_conn()
        cursor = conn.cursor()

        # Extract values and apply defaults
        fir_id = fir_data.get('id') or f"FIR{uuid.uuid4().hex[:7].upper()}"
        crime_type = fir_data.get('crimeType', 'Other')
        severity = fir_data.get('severity', 'Medium')
        severity_num = get_severity_score(severity)
        
        # Mapped Status
        status = fir_data.get('status', 'Under Investigation')
        if status == 'Open':
            status = 'Under Investigation'
        elif status == 'Closed':
            status = 'Closed'

        created_at = fir_data.get('createdAt') or datetime.now().isoformat()
        
        # Nested location attributes
        loc = fir_data.get('location') or {}
        state = loc.get('state', 'Unknown')
        city = loc.get('city', 'Unknown')
        lat = loc.get('lat', 19.0760)
        lng = loc.get('lng', 72.8777)

        # Flags
        ipc_section = fir_data.get('ipcSection') or 379
        women_crime_flag = int(fir_data.get('womenCrimeFlag') or fir_data.get('Women_Crime_Flag') or 0)
        cyber_crime_flag = int(fir_data.get('cyberCrimeFlag') or fir_data.get('Cyber_Crime_Flag') or 0)
        
        # Default Patrol Priority
        patrol_priority = fir_data.get('patrolPriority') or fir_data.get('Patrol_Priority')
        if not patrol_priority:
            if severity == 'Critical':
                patrol_priority = 'CRITICAL'
            elif severity == 'High':
                patrol_priority = 'HIGH'
            elif severity == 'Low':
                patrol_priority = 'LOW'
            else:
                patrol_priority = 'MEDIUM'

        try:
            cursor.execute("""
                INSERT INTO firs (id, state, city, crime_type, ipc_section, severity_num, lat, lng, 
                                 women_crime_flag, cyber_crime_flag, patrol_priority, severity, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (fir_id, state, city, crime_type, ipc_section, severity_num, lat, lng,
                  women_crime_flag, cyber_crime_flag, patrol_priority, severity, status, created_at))
            conn.commit()
            return fir_id
        except Exception as e:
            print(f"Error inserting FIR: {e}")
            return None
        finally:
            conn.close()

    def update_fir(self, fir_id, updates):
        """Update fields of an existing FIR"""
        conn = self._get_conn()
        cursor = conn.cursor()

        # Map frontend updates to SQLite column names
        column_mapping = {
            'status': 'status',
            'severity': 'severity',
            'crimeType': 'crime_type',
            'patrolPriority': 'patrol_priority'
        }

        # Extra nested updates
        set_clauses = []
        params = []

        for key, val in updates.items():
            if key in column_mapping:
                set_clauses.append(f"{column_mapping[key]} = ?")
                params.append(val)
                # If severity changes, also update severity_num
                if key == 'severity':
                    set_clauses.append("severity_num = ?")
                    params.append(get_severity_score(val))
            elif key == 'location' and isinstance(val, dict):
                if 'state' in val:
                    set_clauses.append("state = ?")
                    params.append(val['state'])
                if 'city' in val:
                    set_clauses.append("city = ?")
                    params.append(val['city'])
                if 'lat' in val:
                    set_clauses.append("lat = ?")
                    params.append(val['lat'])
                if 'lng' in val:
                    set_clauses.append("lng = ?")
                    params.append(val['lng'])

        if not set_clauses:
            return False

        query = f"UPDATE firs SET {', '.join(set_clauses)} WHERE id = ?"
        params.append(fir_id)

        try:
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating FIR: {e}")
            return False
        finally:
            conn.close()

    def delete_fir(self, fir_id):
        """Delete an FIR by ID"""
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM firs WHERE id = ?", (fir_id,))
            conn.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting FIR {fir_id}: {e}")
            return False
        finally:
            conn.close()

    def get_states(self):
        """Fetch distinct states from SQLite"""
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT DISTINCT state FROM firs WHERE state IS NOT NULL AND state != 'Unknown' ORDER BY state")
            rows = cursor.fetchall()
            return [{'id': r['state'].lower().replace(' ', '_'), 'name': r['state']} for r in rows]
        except Exception as e:
            print(f"Error fetching states: {e}")
            return []
        finally:
            conn.close()

    def get_cities_by_state(self, state_name):
        """Fetch distinct cities (zones) for a state from SQLite"""
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                SELECT DISTINCT city FROM firs 
                WHERE state = ? AND city IS NOT NULL AND city != 'Unknown' 
                ORDER BY city
            """, (state_name,))
            rows = cursor.fetchall()
            return [{'id': r['city'].lower().replace(' ', '_'), 'name': r['city'], 'state': state_name} for r in rows]
        except Exception as e:
            print(f"Error fetching cities for state {state_name}: {e}")
            return []
        finally:
            conn.close()

    def get_nearby_firs(self, lat, lng, radius_km=1.0):
        """Find FIRs near a point using bounding box and geodesic distance"""
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            # Lat/lng degrees conversion approximations:
            # 1 km lat is ~0.009 deg
            # 1 km lng is ~0.01 deg
            lat_delta = radius_km * 0.009
            lng_delta = radius_km * 0.01

            cursor.execute("""
                SELECT * FROM firs
                WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
            """, (lat - lat_delta, lat + lat_delta, lng - lng_delta, lng + lng_delta))
            
            rows = cursor.fetchall()
            nearby = []
            for row in rows:
                c_lat = row['lat']
                c_lng = row['lng']
                dist = calculate_distance(lat, lng, c_lat, c_lng)
                if dist <= radius_km:
                    fir = self._row_to_fir(row)
                    fir['distance'] = round(dist, 2)
                    nearby.append(fir)
            return nearby
        except Exception as e:
            print(f"Error searching nearby FIRs: {e}")
            return []
        finally:
            conn.close()
