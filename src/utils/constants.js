// Crime Types
export const CRIME_TYPES = [
  'Robbery',
  'Theft',
  'Assault',
  'Burglary',
  'Vandalism',
  'Cyber Crime',
  'Other'
];

// Severity Levels
export const SEVERITY_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

// FIR Status
export const FIR_STATUS = [
  'Reported',
  'Under Investigation',
  'Resolved',
  'Closed'
];

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OFFICER: 'officer',
  ANALYST: 'analyst'
};

// Map Configuration
export const DEFAULT_MAP_CENTER = {
  lat: 19.0760,
  lng: 72.8777 // Mumbai
};

export const DEFAULT_MAP_ZOOM = 12;

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Timeout (in ms)
export const REQUEST_TIMEOUT = 30000;
export const DEBOUNCE_DELAY = 300;

// Chart Colors
export const CHART_COLORS = {
  'Robbery': '#ef4444',
  'Theft': '#f97316',
  'Assault': '#eab308',
  'Burglary': '#3b82f6',
  'Vandalism': '#8b5cf6',
  'Cyber Crime': '#06b6d4',
  'Other': '#6b7280'
};

// Severity Colors
export const SEVERITY_COLORS = {
  'Critical': '#c00000',
  'High': '#ff6600',
  'Medium': '#ffc000',
  'Low': '#00b050'
};

// All Indian States and UTs
export const STATES = [
  // States (28)
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories (9)
  'Andaman & Nicobar',
  'Chandigarh',
  'Dadra & Nagar Haveli',
  'Daman & Diu',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];