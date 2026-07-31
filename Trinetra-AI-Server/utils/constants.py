# Crime Types
CRIME_TYPES = [
    'Robbery',
    'Theft',
    'Assault',
    'Burglary',
    'Vandalism',
    'Cyber Crime',
    'Other'
]

# Severity Levels
SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical']

# FIR Status
FIR_STATUS = ['Reported', 'Under Investigation', 'Resolved', 'Closed']

# Weather Conditions (for ML features)
WEATHER_CONDITIONS = ['Clear', 'Rainy', 'Cloudy', 'Foggy']

# Time Periods
TIME_PERIODS = {
    'morning': (6, 12),
    'afternoon': (12, 18),
    'evening': (18, 24),
    'night': (0, 6)
}

# Geographic Boundaries
INDIA_BOUNDS = {
    'min_lat': 8.4,
    'max_lat': 35.0,
    'min_lng': 68.2,
    'max_lng': 97.0
}

# Default coordinates (Mumbai)
DEFAULT_LAT = 19.0760
DEFAULT_LNG = 72.8777

# Heatmap Configuration
HEATMAP_GRID_SIZE = 0.05  # 0.05 degree = ~5.5 km

# Patrol Route Configuration
AVERAGE_PATROL_SPEED = 40  # km/h
SHIFT_DURATION = 8  # hours

# Cache duration (in seconds)
CACHE_DURATION = 3600  # 1 hour

# Pagination
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
