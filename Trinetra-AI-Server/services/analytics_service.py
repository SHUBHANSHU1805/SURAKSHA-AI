import sqlite3
import os
from datetime import datetime
from utils.helpers import get_severity_score, calculate_distance

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'crime_data.db')

class AnalyticsService:
    def _get_conn(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def get_crime_statistics(self, crimes=None):
        """Calculate crime statistics. Can run on a passed crimes list (fallback) or directly on SQLite (fast)"""
        # If a small list is passed and we aren't querying the database, process list
        if crimes is not None and len(crimes) < 1000:
            try:
                stats = {
                    'total_crimes': len(crimes),
                    'by_type': {},
                    'by_severity': {},
                    'by_status': {},
                    'by_state': {},
                    'resolution_rate': 0
                }
                resolved = 0
                for crime in crimes:
                    crime_type = crime.get('crimeType', 'Other')
                    stats['by_type'][crime_type] = stats['by_type'].get(crime_type, 0) + 1
                    
                    severity = crime.get('severity', 'Low')
                    stats['by_severity'][severity] = stats['by_severity'].get(severity, 0) + 1
                    
                    status = crime.get('status', 'Reported')
                    stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
                    
                    state = crime.get('location', {}).get('state', 'Unknown') if isinstance(crime.get('location'), dict) else 'Unknown'
                    stats['by_state'][state] = stats['by_state'].get(state, 0) + 1
                    
                    if status == 'Closed' or status == 'Resolved':
                        resolved += 1
                
                if stats['total_crimes'] > 0:
                    stats['resolution_rate'] = round((resolved / stats['total_crimes']) * 100, 2)
                return stats
            except Exception as e:
                print(f"Error calculating list stats: {e}")
                return {}

        # Direct high-performance SQLite aggregations
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            stats = {
                'total_crimes': 0,
                'by_type': {},
                'by_severity': {},
                'by_status': {},
                'by_state': {},
                'resolution_rate': 0
            }

            # Total count
            cursor.execute("SELECT COUNT(*) FROM firs")
            stats['total_crimes'] = cursor.fetchone()[0]

            if stats['total_crimes'] == 0:
                return stats

            # Group by type
            cursor.execute("SELECT crime_type, COUNT(*) FROM firs GROUP BY crime_type")
            stats['by_type'] = {r[0]: r[1] for r in cursor.fetchall()}

            # Group by severity
            cursor.execute("SELECT severity, COUNT(*) FROM firs GROUP BY severity")
            stats['by_severity'] = {r[0]: r[1] for r in cursor.fetchall()}

            # Group by status
            cursor.execute("SELECT status, COUNT(*) FROM firs GROUP BY status")
            stats['by_status'] = {r[0]: r[1] for r in cursor.fetchall()}

            # Group by state
            cursor.execute("SELECT state, COUNT(*) FROM firs GROUP BY state")
            stats['by_state'] = {r[0]: r[1] for r in cursor.fetchall()}

            # Resolution rate (Closed status)
            cursor.execute("SELECT COUNT(*) FROM firs WHERE status = 'Closed'")
            resolved = cursor.fetchone()[0]
            stats['resolution_rate'] = round((resolved / stats['total_crimes']) * 100, 2)

            return stats
        except Exception as e:
            print(f"Error calculating database statistics: {e}")
            return {}
        finally:
            conn.close()

    def get_time_analysis(self, crimes=None):
        """Analyze crimes by hour, weekday, and month"""
        if crimes is not None and len(crimes) < 1000:
            try:
                hourly = {}
                daily = {}
                monthly = {}
                for crime in crimes:
                    if 'createdAt' not in crime:
                        continue
                    try:
                        date_str = crime['createdAt']
                        if date_str.endswith('Z'):
                            date_str = date_str[:-1] + '+00:00'
                        crime_date = datetime.fromisoformat(date_str)
                        
                        hour = crime_date.hour
                        hourly[hour] = hourly.get(hour, 0) + 1
                        
                        day = crime_date.weekday()
                        daily[day] = daily.get(day, 0) + 1
                        
                        month = crime_date.month
                        monthly[month] = monthly.get(month, 0) + 1
                    except Exception as parse_err:
                        print(f"Error parsing date {crime.get('createdAt')}: {parse_err}")
                return {
                    'hourly': hourly,
                    'daily': daily,
                    'monthly': monthly
                }
            except Exception as e:
                print(f"Error analyzing list time: {e}")
                return {}

        # SQLite implementation
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            # Hourly
            cursor.execute("SELECT CAST(SUBSTR(created_at, 12, 2) AS INTEGER) AS hr, COUNT(*) FROM firs GROUP BY hr")
            hourly = {r[0]: r[1] for r in cursor.fetchall()}

            # Monthly
            cursor.execute("SELECT CAST(SUBSTR(created_at, 6, 2) AS INTEGER) AS mon, COUNT(*) FROM firs GROUP BY mon")
            monthly = {r[0]: r[1] for r in cursor.fetchall()}

            # Weekday: strftime('%w', ...) returns 0 for Sunday, 1 for Monday, etc.
            # Mapped to python datetime weekday: 0 is Monday, 6 is Sunday
            cursor.execute("SELECT CAST(strftime('%w', created_at) AS INTEGER) AS day, COUNT(*) FROM firs GROUP BY day")
            daily_raw = {r[0]: r[1] for r in cursor.fetchall()}
            
            # Map SQLite day values (0=Sunday, 1=Monday... 6=Saturday) to Python (0=Monday, 6=Sunday)
            daily = {}
            for sql_day, count in daily_raw.items():
                py_day = (sql_day - 1) % 7
                daily[py_day] = count

            return {
                'hourly': hourly,
                'daily': daily,
                'monthly': monthly
            }
        except Exception as e:
            print(f"Error analyzing database time: {e}")
            return {}
        finally:
            conn.close()

    def calculate_safety_index(self, crimes=None, location=None):
        """Calculate safety index for a location using a geospatial bounding box search"""
        if not location:
            return 100

        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            lat = float(location['lat'])
            lng = float(location['lng'])
            
            # Use bounding box first (~5km around location) to filter down 200k records to a tiny list
            # 1 degree lat is ~111 km, 1 degree lng is ~104 km.
            # 5 km bounding box is ~0.05 degrees
            lat_delta = 0.05
            lng_delta = 0.05
            
            cursor.execute("""
                SELECT severity, lat, lng FROM firs
                WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
            """, (lat - lat_delta, lat + lat_delta, lng - lng_delta, lng + lng_delta))
            
            nearby_rows = cursor.fetchall()
            
            nearby_crimes = 0
            severity_sum = 0
            
            for row in nearby_rows:
                c_lat = row['lat']
                c_lng = row['lng']
                
                # Precise geopy geodesic distance calculation
                dist = calculate_distance(lat, lng, c_lat, c_lng)
                if dist <= 1.0:  # Within 1 km
                    nearby_crimes += 1
                    severity_sum += get_severity_score(row['severity'])
            
            # Calculate index (0-100)
            safety_index = 100 - (nearby_crimes * 5 + severity_sum * 2)
            return max(0, min(100, safety_index))
        except Exception as e:
            print(f"Error calculating database safety index: {e}")
            return 50
        finally:
            conn.close()

    def get_state_detailed_analytics(self, state_name):
        """Get database-backed city stats, women safety zones, and patrol routes for a state"""
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            # 1. City Stats
            cursor.execute("""
                WITH CityCrimeTypeCounts AS (
                    SELECT city, crime_type, COUNT(*) as type_count,
                           ROW_NUMBER() OVER (PARTITION BY city ORDER BY COUNT(*) DESC) as rn
                    FROM firs
                    WHERE state = ?
                    GROUP BY city, crime_type
                ),
                CityStats AS (
                    SELECT city, COUNT(*) as total_crimes, AVG(severity_num) as avg_severity
                    FROM firs
                    WHERE state = ?
                    GROUP BY city
                )
                SELECT cs.city, cs.total_crimes, cs.avg_severity, cctc.crime_type as common_crime
                FROM CityStats cs
                JOIN CityCrimeTypeCounts cctc ON cs.city = cctc.city AND cctc.rn = 1
                ORDER BY cs.total_crimes DESC
            """, (state_name, state_name))
            
            cities_data = []
            for row in cursor.fetchall():
                avg_sev = row['avg_severity']
                if avg_sev >= 8.0:
                    sev_label = 'High'
                elif avg_sev >= 5.5:
                    sev_label = 'Medium'
                else:
                    sev_label = 'Low'
                
                safety_index = max(0, min(100, round(100 - (avg_sev * 10), 1)))
                
                cities_data.append({
                    'name': row['city'],
                    'crimes': row['total_crimes'],
                    'commonCrime': row['common_crime'],
                    'severity': sev_label,
                    'safetyIndex': safety_index
                })
                
            # 2. Women's safety zones
            cursor.execute("""
                SELECT city, SUM(women_crime_flag) as women_crimes, COUNT(*) as total_crimes
                FROM firs
                WHERE state = ?
                GROUP BY city
                ORDER BY women_crimes DESC
            """, (state_name,))
            
            women_safety_zones = []
            for row in cursor.fetchall():
                women_crimes = row['women_crimes'] or 0
                total_crimes = row['total_crimes'] or 1
                women_crime_rate = (women_crimes / total_crimes) * 100
                safety_score = max(0, min(100, round(100 - (women_crime_rate * 3.5), 1)))
                if safety_score >= 70:
                    color = 'green'
                elif safety_score >= 40:
                    color = 'yellow'
                else:
                    color = 'red'
                
                women_safety_zones.append({
                    'zone': f"{row['city']} Safe Zone",
                    'safety': safety_score,
                    'color': color
                })
            
            # 3. Patrol recommendations
            cursor.execute("""
                WITH ZoneHourCounts AS (
                    SELECT city, CAST(SUBSTR(created_at, 12, 2) AS INTEGER) as hr, COUNT(*) as hr_count,
                           ROW_NUMBER() OVER (PARTITION BY city ORDER BY COUNT(*) DESC) as rn
                    FROM firs
                    WHERE state = ?
                    GROUP BY city, hr
                ),
                ZonePatrolPriority AS (
                    SELECT city, patrol_priority, COUNT(*) as priority_count,
                           ROW_NUMBER() OVER (PARTITION BY city ORDER BY COUNT(*) DESC) as rn
                    FROM firs
                    WHERE state = ? AND patrol_priority IS NOT NULL
                    GROUP BY city, patrol_priority
                ),
                CityStats AS (
                    SELECT city, AVG(severity_num) as avg_severity
                    FROM firs
                    WHERE state = ?
                    GROUP BY city
                )
                SELECT zhc.city, zhc.hr, zpp.patrol_priority, cs.avg_severity
                FROM ZoneHourCounts zhc
                JOIN ZonePatrolPriority zpp ON zhc.city = zpp.city AND zpp.rn = 1
                JOIN CityStats cs ON zhc.city = cs.city
                WHERE zhc.rn = 1
                ORDER BY cs.avg_severity DESC
            """, (state_name, state_name, state_name))
            
            patrol_recommendations = []
            for row in cursor.fetchall():
                peak_hour = row['hr']
                start_hr = (peak_hour - 2) % 24
                end_hr = (peak_hour + 2) % 24
                time_window = f"{start_hr:02d}:00 - {end_hr:02d}:00"
                
                priority = row['patrol_priority']
                if priority in ('CRITICAL', 'HIGH'):
                    priority_label = 'High'
                elif priority == 'LOW':
                    priority_label = 'Low'
                else:
                    priority_label = 'Medium'
                
                patrol_recommendations.append({
                    'route': f"{row['city']} Patrol Route",
                    'priority': priority_label,
                    'time': time_window
                })
                
            return {
                'state': state_name,
                'cities': cities_data,
                'women_safety_zones': women_safety_zones[:10],
                'patrol_recommendations': patrol_recommendations[:10]
            }
        except Exception as e:
            print(f"Error detailed analytics for {state_name}: {e}")
            return {}
        finally:
            conn.close()

