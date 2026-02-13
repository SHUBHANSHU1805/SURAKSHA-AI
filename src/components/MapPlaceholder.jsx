import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { MapPin, Navigation, X } from 'lucide-react';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapPlaceholder = ({ firData, darkMode }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const markersRef = useRef([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationPanel, setShowLocationPanel] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [selectedCoords, setSelectedCoords] = useState(null);

  const tileLayer = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Geocode location
  const geocodeLocation = async (location) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: location,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'Trinetra-AI-App',
        },
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
          found: true,
          displayName: response.data[0].display_name,
        };
      }
      return { lat: null, lng: null, found: false };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat: null, lng: null, found: false };
    }
  };

  // Reverse geocode (get address from coordinates)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: lat,
          lon: lng,
          format: 'json',
        },
        headers: {
          'User-Agent': 'Trinetra-AI-App',
        },
      });

      if (response.data && response.data.address) {
        return response.data.display_name;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setSelectedCoords({ lat: latitude, lng: longitude });

          // Reverse geocode to get address
          const address = await reverseGeocode(latitude, longitude);
          setManualLocation(address);

          // Center map
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15);
          }

          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location. Please enable location access.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLoading(false);
    }
  };

  // Search for location
  const searchLocation = async () => {
    if (!manualLocation.trim()) {
      alert('Please enter a location');
      return;
    }

    setLoading(true);
    const coords = await geocodeLocation(manualLocation);

    if (coords.found) {
      setSelectedCoords({ lat: coords.lat, lng: coords.lng });

      // Center map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([coords.lat, coords.lng], 13, {
          duration: 1.5,
        });
      }

      // Add temporary marker
      addTemporaryMarker(coords.lat, coords.lng, coords.displayName);
      setLoading(false);
    } else {
      alert('Location not found. Please try a different search.');
      setLoading(false);
    }
  };

  // Add temporary marker
  const addTemporaryMarker = (lat, lng, displayName) => {
    // Remove previous temporary marker if exists
    if (mapInstanceRef.current) {
      const tempMarker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<div style="font-size: 12px;">
          <p><strong>📍 Selected Location</strong></p>
          <p>${displayName}</p>
          <p style="font-size: 10px; color: #666;">
            ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </p>
        </div>`);

      // Open popup
      tempMarker.openPopup();

      // Store reference to remove later
      markersRef.current.push(tempMarker);
    }
  };

  // Calculate and fit bounds
  const fitMapBounds = (data) => {
    if (!mapInstanceRef.current || data.length === 0) return;

    if (data.length === 1) {
      mapInstanceRef.current.setView([data[0].lat, data[0].lng], 15);
      return;
    }

    const group = new L.featureGroup(data.map((d) => L.marker([d.lat, d.lng])));
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
  };

  // Initialize map
  const initializeMap = () => {
    if (mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer(tileLayer, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Add click event to map for getting coordinates
    mapInstanceRef.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      setSelectedCoords({ lat, lng });

      // Reverse geocode
      const address = await reverseGeocode(lat, lng);
      setManualLocation(address);

      // Add marker
      addTemporaryMarker(lat, lng, address);
    });
  };

  // Update tile layer for dark mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    L.tileLayer(tileLayer, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [darkMode, tileLayer]);

  // Process and display FIR data
  useEffect(() => {
    if (!mapRef.current) return;

    const processFIRData = async () => {
      setLoading(true);
      initializeMap();

      // Geocode locations
      const geocoded = await Promise.all(
        firData.map(async (fir) => {
          if (fir.lat && fir.lng && !isNaN(fir.lat) && !isNaN(fir.lng)) {
            return fir;
          }

          const coords = await geocodeLocation(fir.location);
          if (coords.found) {
            return {
              ...fir,
              lat: coords.lat,
              lng: coords.lng,
              displayName: coords.displayName,
            };
          }
          return null;
        })
      );

      const validData = geocoded.filter((d) => d !== null);
      setProcessedData(validData);

      // Clear old markers (except temporary ones)
      markersRef.current.forEach((marker) => {
        if (marker.options.icon?.options?.iconUrl?.includes('marker-icon')) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });

      // Add markers
      validData.forEach((fir) => {
        const color = getMarkerColor(fir.severity);

        // Heat circle
        L.circleMarker([fir.lat, fir.lng], {
          radius: 7,
          fillColor: color,
          fillOpacity: 0.3,
          stroke: true,
          weight: 1,
          color: color,
          opacity: 0.6,
        }).addTo(mapInstanceRef.current);

        // Custom marker
        const customIcon = L.divIcon({
          html: `
            <div style="
              width: 35px;
              height: 35px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
              cursor: pointer;
            ">
              ${fir.severity === 'High' ? '!' : fir.severity === 'Medium' ? '◆' : '✓'}
            </div>
          `,
          className: 'custom-marker',
          iconSize: [35, 35],
          iconAnchor: [17.5, 35],
          popupAnchor: [0, -35],
        });

        const marker = L.marker([fir.lat, fir.lng], { icon: customIcon }).addTo(
          mapInstanceRef.current
        );

        // Popup
        const popupContent = `
          <div style="font-size: 12px; width: 280px; font-family: system-ui, -apple-system, sans-serif;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: ${color}; font-size: 14px;">
              ${fir.type}
            </p>
            <div style="border-top: 1px solid #ddd; padding-top: 8px;">
              <p style="margin: 4px 0;"><strong>📍 Location:</strong> ${fir.location}</p>
              ${
                fir.displayName
                  ? `<p style="margin: 4px 0; color: #666; font-size: 11px;">${fir.displayName}</p>`
                  : ''
              }
              <p style="margin: 4px 0;">
                <strong>⚠️ Severity:</strong> 
                <span style="
                  background-color: ${color};
                  color: white;
                  padding: 2px 6px;
                  border-radius: 3px;
                  font-size: 11px;
                  margin-left: 4px;
                ">
                  ${fir.severity}
                </span>
              </p>
              <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${fir.date}</p>
              <p style="margin: 4px 0;"><strong>📝 Description:</strong></p>
              <p style="margin: 4px 0; background-color: #f5f5f5; padding: 4px; border-radius: 3px; max-height: 60px; overflow-y: auto;">
                ${fir.description || 'N/A'}
              </p>
              <p style="margin: 8px 0 0 0; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 4px;">
                📍 ${fir.lat.toFixed(4)}, ${fir.lng.toFixed(4)}
              </p>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 300 });
      });

      // Fit bounds
      if (validData.length > 0) {
        fitMapBounds(validData);
      }

      setLoading(false);
    };

    if (firData.length > 0) {
      processFIRData();
    }
  }, [firData]);

  const getMarkerColor = (severity) => {
    switch (severity) {
      case 'High':
        return '#ef4444';
      case 'Medium':
        return '#f97316';
      case 'Low':
        return '#22c55e';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className="w-full relative">
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg overflow-hidden shadow-md"
        style={{ zIndex: 1 }}
      />

      {/* Location Search Panel */}
      <div className={`absolute top-4 left-4 z-20 transition-all duration-300 ${showLocationPanel ? 'w-80' : 'w-auto'}`}>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg overflow-hidden`}>
          {showLocationPanel ? (
            <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  <MapPin className="w-4 h-4" />
                  Location Tools
                </h3>
                <button
                  onClick={() => setShowLocationPanel(false)}
                  className={`p-1 rounded hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search location */}
              <div className="space-y-3">
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Search Location
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                      placeholder="Enter location name..."
                      className={`flex-1 px-3 py-2 rounded border text-sm ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                    <button
                      onClick={searchLocation}
                      disabled={loading}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? '...' : '🔍'}
                    </button>
                  </div>
                </div>

                {/* Auto-detect button */}
                <button
                  onClick={getUserLocation}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 transition"
                >
                  <Navigation className="w-4 h-4" />
                  {loading ? 'Getting location...' : 'My Location'}
                </button>

                {/* Selected coordinates */}
                {selectedCoords && (
                  <div className={`p-3 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Selected Coordinates:
                    </p>
                    <p className={`font-mono text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Lat: {selectedCoords.lat.toFixed(4)}
                    </p>
                    <p className={`font-mono text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Lng: {selectedCoords.lng.toFixed(4)}
                    </p>
                  </div>
                )}

                {/* Info */}
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  💡 Tip: Click on the map to get coordinates
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLocationPanel(true)}
              className={`p-3 flex items-center gap-2 font-medium transition ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Location Tools
            </button>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg z-10">
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-lg">
            <p className="text-sm font-semibold">🔄 Loading map...</p>
          </div>
        </div>
      )}

      {/* Map stats */}
      {processedData.length > 0 && (
        <div className={`absolute bottom-4 right-4 px-3 py-2 rounded-lg shadow-md text-xs z-10 pointer-events-none ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <p className="font-semibold">{processedData.length} incident(s) on map</p>
        </div>
      )}
    </div>
  );
};

export default MapPlaceholder;
