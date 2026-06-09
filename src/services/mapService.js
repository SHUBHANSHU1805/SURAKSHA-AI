import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// Set Mapbox access token
export const initializeMapbox = (accessToken) => {
  mapboxgl.accessToken = accessToken;
};

/**
 * Create and return a Mapbox map instance
 */
export const createMap = (container, options = {}) => {
  return new mapboxgl.Map({
    container,
    style: options.style || 'mapbox://styles/mapbox/streets-v12',
    center: options.center || [72.8777, 19.0760], // [lng, lat]
    zoom: options.zoom || 12,
    ...options
  });
};

/**
 * Add geocoder control to map
 */
export const addGeocoderControl = (map) => {
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder: 'Search for crimes or locations',
    proximity: {
      longitude: 72.8777,
      latitude: 19.0760
    }
  });

  map.addControl(geocoder);
  return geocoder;
};

/**
 * Get current location
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Add crime markers to map
 */
export const addCrimeMarkers = (map, crimes) => {
  crimes.forEach((crime, index) => {
    if (crime.location?.lat && crime.location?.lng) {
      const severityColor = {
        'Critical': '#c00000',
        'High': '#ff6600',
        'Medium': '#ffc000',
        'Low': '#00b050'
      };

      // Create a DOM element for the marker
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxNC4wODcgMCAxMi4xODU2IDAuNTg3NzUgMTAuNjMzNyAxLjY5MTAzQzkuMDgxODIgMi43OTQzMiA3LjkwMjE0IDQuMzU3NDMgNy4yNDI2NCA2LjE3NjU5QzYuNTgzMTQgNy45OTU3NSA2LjQ3NDA1IDkuOTkzNzIgNi45Mzk3MyAxMS44OTM3QzcuNDA1NDEgMTMuNzk0IDguNDExODEgMTUuNDQ4IDkuODk3OTEgMTYuNjcxMkMxMS4zODQgMTcuODk0NCAxMy4xNjU2IDE4LjYyNjMgMTUgMTguNjI2M0MxNi44MzQ0IDE4LjYyNjMgMTguNjE2IDE3Ljg5NDQgMjAuMTAyIDEGLjY3MTJDMjEuNTg4IDE1LjQ0OCAyMi41OTQ2IDEzLjc5NCAyMy4wNjAzIDExLjg5MzdDMjMuNTI2IDkuOTkzNzIgMjMuNDE2OSA3Ljk5NTc1IDIyLjc1NzQgNi4xNzY1OUMyMi4wOTc5IDQuMzU3NDMgMjAuOTE4MiAyLjc5NDMyIDE5LjM2NjMgMS42OTEwM0MxNy44MTQ0IDAuNTg3NzUgMTUuOTEzIDAgMTYgMFoiIGZpbGw9IiR7Q09MT1J9Ii8+PC9zdmc+)`;
      el.style.width = '32px';
      el.style.height = '48px';
      el.style.backgroundSize = '100%';
      el.style.cursor = 'pointer';
      el.style.filter = `hue-rotate(0deg) brightness(1)`;

      // Set color dynamically
      el.innerHTML = `
        <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C14.0870 0 12.1856 0.587755 10.6337 1.69103C9.08182 2.79432 7.90214 4.35743 7.24264 6.17659C6.58314 7.99575 6.47405 9.99372 6.93973 11.8937C7.40541 13.794 8.41181 15.448 9.89791 16.6712C11.384 17.8944 13.1656 18.6263 15 18.6263C16.8344 18.6263 18.616 17.8944 20.102 16.6712C21.5881 15.448 22.5945 13.794 23.0602 11.8937C23.526 9.99372 23.4169 7.99575 22.7574 6.17659C22.0979 4.35743 20.9182 2.79432 19.3663 1.69103C17.8144 0.587755 15.913 0 16 0Z" fill="${severityColor[crime.severity] || '#ff0000'}"/>
        </svg>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <strong>${crime.crimeType}</strong><br/>
          <small>${crime.location?.city}, ${crime.location?.state}</small><br/>
          <span style="color: ${severityColor[crime.severity]}">${crime.severity}</span>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([crime.location.lng, crime.location.lat])
        .setPopup(popup)
        .addTo(map);
    }
  });
};

/**
 * Create heatmap layer from crime data
 */
export const createHeatmapLayer = (map, crimes, layerId = 'crime-heatmap') => {
  // Convert crimes to GeoJSON format
  const geojson = {
    type: 'FeatureCollection',
    features: crimes
      .filter(crime => crime.location?.lat && crime.location?.lng)
      .map(crime => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [crime.location.lng, crime.location.lat]
        },
        properties: {
          severity: getSeverityWeight(crime.severity),
          crimeType: crime.crimeType,
          description: crime.description
        }
      }))
  };

  // Add source
  if (!map.getSource(layerId)) {
    map.addSource(layerId, {
      type: 'geojson',
      data: geojson
    });
  } else {
    map.getSource(layerId).setData(geojson);
  }

  // Add heatmap layer
  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: 'heatmap',
      source: layerId,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'severity'],
          0, 0,
          4, 1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 255, 255, 0)',
          0.2, 'rgba(0, 255, 255, 0.4)',
          0.4, 'rgba(0, 191, 255, 1)',
          0.6, 'rgba(0, 0, 255, 1)',
          0.8, 'rgba(255, 0, 255, 1)',
          1, 'rgba(255, 0, 0, 1)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 2,
          9, 20
        ],
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 1,
          9, 0.7
        ]
      }
    }, 'waterway-label');
  }
};

/**
 * Create safety zones (polygon layer)
 */
export const createSafetyZonesLayer = (map, zones, layerId = 'safety-zones') => {
  // Convert zones to GeoJSON polygons
  const geojson = {
    type: 'FeatureCollection',
    features: zones.map(zone => {
      const size = 0.025;
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [zone.lng - size, zone.lat - size],
            [zone.lng + size, zone.lat - size],
            [zone.lng + size, zone.lat + size],
            [zone.lng - size, zone.lat + size],
            [zone.lng - size, zone.lat - size]
          ]]
        },
        properties: {
          safetyIndex: zone.safetyIndex,
          crimeCount: zone.crimeCount,
          color: getZoneColor(zone.safetyIndex)
        }
      };
    })
  };

  // Add source
  if (!map.getSource(layerId)) {
    map.addSource(layerId, {
      type: 'geojson',
      data: geojson
    });
  } else {
    map.getSource(layerId).setData(geojson);
  }

  // Add fill layer
  if (!map.getLayer(`${layerId}-fill`)) {
    map.addLayer({
      id: `${layerId}-fill`,
      type: 'fill',
      source: layerId,
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.5
      }
    }, 'waterway-label');

    // Add stroke layer
    map.addLayer({
      id: `${layerId}-stroke`,
      type: 'line',
      source: layerId,
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2
      }
    }, 'waterway-label');

    // Add click handler
    map.on('click', `${layerId}-fill`, (e) => {
      const properties = e.features[0].properties;
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="padding: 8px;">
            <strong>Safety Index: ${properties.safetyIndex.toFixed(1)}</strong><br/>
            Crimes: ${properties.crimeCount}
          </div>
        `)
        .addTo(map);
    });

    // Change cursor on hover
    map.on('mouseenter', `${layerId}-fill`, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', `${layerId}-fill`, () => {
      map.getCanvas().style.cursor = '';
    });
  }
};

/**
 * Show/hide layers
 */
export const toggleLayer = (map, layerId, visible) => {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
};

/**
 * Fit bounds to features
 */
export const fitBounds = (map, features) => {
  if (features.length === 0) return;

  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  features.forEach(feature => {
    if (feature.location?.lng && feature.location?.lat) {
      minLng = Math.min(minLng, feature.location.lng);
      maxLng = Math.max(maxLng, feature.location.lng);
      minLat = Math.min(minLat, feature.location.lat);
      maxLat = Math.max(maxLat, feature.location.lat);
    }
  });

  if (minLng !== Infinity) {
    map.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding: 50 }
    );
  }
};

/**
 * Helper: Get severity weight
 */
const getSeverityWeight = (severity) => {
  const weights = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };
  return weights[severity] || 1;
};

/**
 * Helper: Get zone color
 */
const getZoneColor = (safetyIndex) => {
  if (safetyIndex >= 75) return '#00B050'; // Green
  if (safetyIndex >= 50) return '#FFC000'; // Yellow
  if (safetyIndex >= 25) return '#FF6600'; // Orange
  return '#C00000'; // Red
};

/**
 * Add drawing tools (optional)
 */
export const addDrawingTools = (map, MapboxDraw) => {
  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true
    }
  });

  map.addControl(draw);
  return draw;
};

/**
 * Create patrol routes (polyline)
 */
export const addPatrolRoute = (map, route, routeId = 'patrol-route') => {
  const coordinates = route.waypoints.map(wp => [wp.lng, wp.lat]);

  if (!map.getSource(routeId)) {
    map.addSource(routeId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    });

    map.addLayer({
      id: routeId,
      type: 'line',
      source: routeId,
      paint: {
        'line-color': '#6366f1',
        'line-width': 4,
        'line-opacity': 0.7
      }
    });
  }
};

/**
 * Get map center
 */
export const getMapCenter = (map) => {
  const center = map.getCenter();
  return {
    lng: center.lng,
    lat: center.lat
  };
};

/**
 * Get map zoom
 */
export const getMapZoom = (map) => {
  return map.getZoom();
};