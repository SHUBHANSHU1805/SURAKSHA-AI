import { useSelector, useDispatch } from 'react-redux';
import {
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
} from '../redux/slices/mapSlice';

export const useMap = () => {
  const dispatch = useDispatch();
  const mapState = useSelector((state) => state.map);

  const updateCenter = (center) => {
    dispatch(setCenter(center));
  };

  const updateZoom = (zoom) => {
    dispatch(setZoom(zoom));
  };

  const changeMapType = (type) => {
    dispatch(setMapType(type));
  };

  const handleToggleHeatmap = () => {
    dispatch(toggleHeatmap());
  };

  const handleToggleMarkers = () => {
    dispatch(toggleMarkers());
  };

  const handleTogglePatrolRoutes = () => {
    dispatch(togglePatrolRoutes());
  };

  const handleToggleSafetyZones = () => {
    dispatch(toggleSafetyZones());
  };

  const selectCrime = (crime) => {
    dispatch(setSelectedCrime(crime));
  };

  const applyFilters = (filters) => {
    dispatch(setMapFilters(filters));
  };

  const resetFilters = () => {
    dispatch(clearMapFilters());
  };

  return {
    ...mapState,
    updateCenter,
    updateZoom,
    changeMapType,
    toggleHeatmap: handleToggleHeatmap,
    toggleMarkers: handleToggleMarkers,
    togglePatrolRoutes: handleTogglePatrolRoutes,
    toggleSafetyZones: handleToggleSafetyZones,
    selectCrime,
    applyFilters,
    resetFilters
  };
};