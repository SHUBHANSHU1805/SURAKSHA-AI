import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// Set Mapbox access token - correct way
export const initializeMapbox = (accessToken) => {
  mapboxgl.accessToken = accessToken || process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
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

export const addCrimeMarkers = (map, crimes) => {
  const sourceId = 'crime-clusters';
  
  const geojson = {
    type: 'FeatureCollection',
    features: crimes
      .filter(crime => crime.location?.lat && crime.location?.lng)
      .map(crime => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(crime.location.lng), parseFloat(crime.location.lat)]
        },
        properties: {
          id: crime.id,
          crimeType: crime.crimeType,
          severity: crime.severity,
          status: crime.status,
          city: crime.location?.city || 'Unknown',
          state: crime.location?.state || 'Unknown'
        }
      }))
  };

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });
    
    // Cluster circles
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          'rgba(99, 102, 241, 0.6)', // 0-100: Indigo
          100,
          'rgba(245, 158, 11, 0.7)', // 100-500: Orange
          500,
          'rgba(239, 68, 68, 0.8)'  // 500+: Red
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          18,
          100,
          25,
          500,
          32
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Cluster count label
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Unclustered point circles
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'severity'],
          'Critical', '#c00000',
          'High', '#ff6600',
          'Medium', '#ffc000',
          'Low', '#00b050',
          '#6366f1' // default
        ],
        'circle-radius': 7,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Zoom on click of a cluster
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      map.getSource(sourceId).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }
      );
    });

    // Show popup on click of unclustered point
    map.on('click', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const props = e.features[0].properties;
      
      const severityColor = {
        'Critical': '#c00000',
        'High': '#ff6600',
        'Medium': '#ffc000',
        'Low': '#00b050'
      };

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="padding: 8px; font-family: sans-serif; min-width: 150px;">
            <strong style="display: block; font-size: 14px; margin-bottom: 4px;">${props.crimeType}</strong>
            <small style="display: block; color: #6b7280; margin-bottom: 4px;">Zone: ${props.city}, ${props.state}</small>
            <span style="display: block; font-size: 12px; margin-bottom: 2px;">Status: <strong>${props.status}</strong></span>
            <span style="display: block; font-size: 12px;">Severity: <strong style="color: ${severityColor[props.severity]}">${props.severity}</strong></span>
          </div>
        `)
        .addTo(map);
    });

    // Hover cursor changes
    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
  } else {
    map.getSource(sourceId).setData(geojson);
  }
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