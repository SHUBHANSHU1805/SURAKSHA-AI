import { createSlice } from '@reduxjs/toolkit';

const mapSlice = createSlice({
  name: 'map',
  initialState: {
    center: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
    zoom: 12,
    mapType: 'roadmap',
    showHeatmap: true,
    showMarkers: true,
    showPatrolRoutes: false,
    showSafetyZones: false,
    selectedCrime: null,
    filters: {
      dateRange: null,
      crimeTypes: [],
      severity: []
    }
  },
  reducers: {
    setCenter: (state, action) => {
      state.center = action.payload;
    },
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
    setMapType: (state, action) => {
      state.mapType = action.payload;
    },
    toggleHeatmap: (state) => {
      state.showHeatmap = !state.showHeatmap;
    },
    toggleMarkers: (state) => {
      state.showMarkers = !state.showMarkers;
    },
    togglePatrolRoutes: (state) => {
      state.showPatrolRoutes = !state.showPatrolRoutes;
    },
    toggleSafetyZones: (state) => {
      state.showSafetyZones = !state.showSafetyZones;
    },
    setSelectedCrime: (state, action) => {
      state.selectedCrime = action.payload;
    },
    setMapFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearMapFilters: (state) => {
      state.filters = {
        dateRange: null,
        crimeTypes: [],
        severity: []
      };
    }
  }
});

export const {
  setCenter,
  setZoom,
  setMapType,
  toggleHeatmap,
  toggleMarkers,
  togglePatrolRoutes,
  toggleSafetyZones,
  setSelectedCrime,
  setMapFilters,
  clearMapFilters
} = mapSlice.actions;

export default mapSlice.reducer;