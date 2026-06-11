import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useFIR } from '../hooks/useFIR';
import { useMap } from '../hooks/useMap';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  initializeMapbox,
  createMap,
  addGeocoderControl,
  addCrimeMarkers,
  createHeatmapLayer,
  createSafetyZonesLayer,
  toggleLayer,
  fitBounds
} from '../services/mapService';
import { 
  Layers, 
  Eye, 
  EyeOff,
  Plus,
  Minus,
  Navigation
} from 'lucide-react';

const MapPage = () => {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { loadFIRs, firs } = useFIR();
  const {
    showHeatmap,
    showMarkers,
    showSafetyZones,
    toggleHeatmap,
    toggleMarkers,
    toggleSafetyZones
  } = useMap();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [zones, setZones] = useState([]);

  // Initialize Mapbox and map
  useEffect(() => {
    loadFIRs({ limit: 500 });

    // Initialize Mapbox with access token
    initializeMapbox(process.env.REACT_APP_MAPBOX_ACCESS_TOKEN);

    // Create map instance
    map.current = createMap(mapContainer.current, {
      style: process.env.REACT_APP_MAPBOX_STYLE || 'mapbox://styles/mapbox/streets-v12',
      center: [72.8777, 19.0760],
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geocoder
    addGeocoderControl(map.current);

    // Handle map load
    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update layers when FIRs change
  useEffect(() => {
    if (!mapLoaded || !map.current || firs.length === 0) return;

    // Add markers
    if (showMarkers) {
      addCrimeMarkers(map.current, firs);
    }

    // Add heatmap
    if (showHeatmap) {
      createHeatmapLayer(map.current, firs);
    }

    // Calculate and add safety zones
    if (showSafetyZones) {
      const calculatedZones = calculateSafetyZones(firs);
      setZones(calculatedZones);
      createSafetyZonesLayer(map.current, calculatedZones);
    }
  }, [firs, mapLoaded, showMarkers, showHeatmap, showSafetyZones]);

  // Toggle heatmap
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    if (showHeatmap && firs.length > 0) {
      createHeatmapLayer(map.current, firs);
    } else {
      toggleLayer(map.current, 'crime-heatmap', false);
    }
  }, [showHeatmap, mapLoaded]);

  // Toggle safety zones
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    if (showSafetyZones && zones.length > 0) {
      createSafetyZonesLayer(map.current, zones);
    } else {
      toggleLayer(map.current, 'safety-zones-fill', false);
      toggleLayer(map.current, 'safety-zones-stroke', false);
    }
  }, [showSafetyZones, mapLoaded, zones]);

  // Calculate safety zones
  const calculateSafetyZones = (crimes) => {
    const gridSize = 0.05;
    const zoneMap = {};

    crimes.forEach(crime => {
      if (crime.location?.lat && crime.location?.lng) {
        const lat = Math.floor(crime.location.lat / gridSize) * gridSize;
        const lng = Math.floor(crime.location.lng / gridSize) * gridSize;
        const key = `${lat},${lng}`;

        if (!zoneMap[key]) {
          zoneMap[key] = { lat, lng, crimeCount: 0, severity: 0 };
        }
        zoneMap[key].crimeCount += 1;
        zoneMap[key].severity += getSeverityScore(crime.severity);
      }
    });

    return Object.values(zoneMap).map(zone => ({
      ...zone,
      avgSeverity: zone.severity / zone.crimeCount,
      safetyIndex: Math.max(0, 100 - (zone.crimeCount * 5 + (zone.severity / zone.crimeCount) * 10))
    }));
  };

  const getSeverityScore = (severity) => {
    const scores = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    return scores[severity] || 1;
  };

  const handleZoomIn = () => {
    map.current?.zoomTo(map.current.getZoom() + 1);
  };

  const handleZoomOut = () => {
    map.current?.zoomTo(map.current.getZoom() - 1);
  };

  const handleFitBounds = () => {
    if (firs.length > 0) {
      fitBounds(map.current, firs);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('map.crimeMap')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Interactive crime visualization powered by Mapbox
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={toggleHeatmap}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            showHeatmap
              ? 'bg-red-100 text-red-700 dark:bg-red-900/20'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700'
          }`}
        >
          {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Heatmap
        </button>

        <button
          onClick={toggleMarkers}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            showMarkers
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700'
          }`}
        >
          {showMarkers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Markers
        </button>

        <button
          onClick={toggleSafetyZones}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            showSafetyZones
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700'
          }`}
        >
          {showSafetyZones ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Safety Zones
        </button>

        <button
          onClick={handleFitBounds}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900/20 rounded-lg font-semibold transition-all hover:bg-purple-200"
        >
          <Navigation className="w-4 h-4" />
          Fit View
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleZoomIn}
            className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-screen rounded-lg shadow-lg bg-gray-200 dark:bg-gray-700 relative overflow-hidden"
      />

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Map Legend
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#c00000' }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ff6600' }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ffc000' }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#00b050' }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Low</span>
          </div>
        </div>

        {/* Safety Zones Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Safety Zones</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: '#00B050', opacity: 0.5 }}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Very Safe (75+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: '#FFC000', opacity: 0.5 }}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Moderate (50-75)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: '#FF6600', opacity: 0.5 }}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Unsafe (25-50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: '#C00000', opacity: 0.5 }}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Danger (0-25)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;