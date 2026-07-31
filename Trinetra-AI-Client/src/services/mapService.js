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
 * @deprecated Use addPatrolRoutesInteractive for dataset-backed routes.
 * Kept for backward compatibility with the AI-optimized single route display.
 */
export const addPatrolRoute = (map, route, routeId = 'patrol-route') => {
  const coordinates = route.waypoints.map(wp => [wp.lng, wp.lat]);
  if (map.getSource(routeId)) {
    map.getSource(routeId).setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates }
    });
    return;
  }
  map.addSource(routeId, {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'LineString', coordinates } }
  });
  map.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    paint: { 'line-color': '#a78bfa', 'line-width': 5, 'line-opacity': 0.85 }
  });
};

// ─── Internal state for hover markers & popup ───────────────────────────────
let _hoverPopup    = null;
let _startMarker   = null;
let _endMarker     = null;
let _hoveredRouteId = null;

function _clearHoverElements() {
  if (_hoverPopup)  { _hoverPopup.remove();  _hoverPopup  = null; }
  if (_startMarker) { _startMarker.remove(); _startMarker = null; }
  if (_endMarker)   { _endMarker.remove();   _endMarker   = null; }
}

function _makeEndpointMarker(lngLat, color, letter) {
  const el = document.createElement('div');
  el.style.cssText = `
    width:28px; height:28px; border-radius:50%;
    background:${color}; border:3px solid #fff;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    font-size:12px; font-weight:800; color:#fff;
    font-family:sans-serif; pointer-events:none;
  `;
  el.textContent = letter;
  return new mapboxgl.Marker(el).setLngLat(lngLat);
}

const RISK_COLORS = {
  CRITICAL: '#ef4444',
  HIGH:     '#f97316',
  MEDIUM:   '#eab308',
  LOW:      '#22c55e',
};
const STATUS_COLORS = {
  Active:    '#22c55e',
  Scheduled: '#6366f1',
  Completed: '#6b7280',
  Cancelled: '#ef4444',
};

/**
 * Render all patrol routes from the API as an interactive GeoJSON layer.
 * Hover → route glows, popup with info, start(S) and end(E) markers appear.
 *
 * @param {mapboxgl.Map} map
 * @param {Array}        routes  - Array of route objects from GET /api/patrol/routes
 * @param {string}       sourceId - Mapbox source/layer namespace (default 'patrol-routes-ds')
 */
export const addPatrolRoutesInteractive = (map, routes, sourceId = 'patrol-routes-ds') => {
  // Build GeoJSON FeatureCollection — one LineString per route
  const geojson = {
    type: 'FeatureCollection',
    features: routes
      .filter(r => r.waypoints && r.waypoints.length >= 2)
      .map(r => ({
        type: 'Feature',
        id: r.id, // needed for feature-state
        geometry: {
          type: 'LineString',
          coordinates: r.waypoints.map(wp => [wp.lng, wp.lat])
        },
        properties: {
          route_id:           r.id,
          name:               r.name,
          state:              r.state,
          zone:               r.zone,
          patrol_type:        r.patrol_type,
          route_source:       r.route_source,
          risk_level:         r.risk_level,
          hotspot_score:      r.hotspot_score,
          crime_count:        r.crime_count,
          patrol_date:        r.patrol_date,
          patrol_shift:       r.patrol_shift,
          vehicle_type:       r.vehicle_type,
          assigned_officers:  r.assigned_officers,
          distance_km:        r.distance_km,
          estimated_duration: r.estimated_duration,
          status:             r.status,
          start_lat:          r.start.lat,
          start_lng:          r.start.lng,
          start_label:        r.start.label,
          end_lat:            r.end.lat,
          end_lng:            r.end.lng,
          end_label:          r.end.label,
          color: RISK_COLORS[r.risk_level] || '#6366f1'
        }
      }))
  };

  const layerBase  = `${sourceId}-line`;
  const layerGlow  = `${sourceId}-glow`;
  const layerHit   = `${sourceId}-hit`;  // wide invisible hit area

  // Update data if source already exists (re-render on filter change)
  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(geojson);
    return;
  }

  // ── Add GeoJSON source ──────────────────────────────────────────────────
  map.addSource(sourceId, {
    type: 'geojson',
    data: geojson,
    generateId: false // we supply our own ids via feature.id
  });

  // ── Glow layer (blurred wide line, hidden by default) ───────────────────
  map.addLayer({
    id: layerGlow,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color':   ['get', 'color'],
      'line-width':   16,
      'line-blur':    8,
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 0.55,
        0
      ]
    }
  });

  // ── Base route line ─────────────────────────────────────────────────────
  map.addLayer({
    id: layerBase,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 6,
        3
      ],
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 1,
        0.65
      ]
    }
  });

  // ── Wide transparent hit area (easier hovering) ─────────────────────────
  map.addLayer({
    id: layerHit,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color':   'transparent',
      'line-width':   20,
      'line-opacity': 0
    }
  });

  // ── Hover handlers ──────────────────────────────────────────────────────
  map.on('mousemove', layerHit, (e) => {
    if (!e.features || e.features.length === 0) return;
    map.getCanvas().style.cursor = 'pointer';

    const feat = e.features[0];
    const id   = feat.id ?? feat.properties.route_id;
    const p    = feat.properties;

    // Reset previous hover
    if (_hoveredRouteId !== null && _hoveredRouteId !== id) {
      map.setFeatureState({ source: sourceId, id: _hoveredRouteId }, { hover: false });
      _clearHoverElements();
    }

    _hoveredRouteId = id;
    map.setFeatureState({ source: sourceId, id }, { hover: true });

    // ── Start marker (green S) ────────────────────────────────────────
    if (!_startMarker) {
      _startMarker = _makeEndpointMarker(
        [parseFloat(p.start_lng), parseFloat(p.start_lat)],
        '#16a34a', 'S'
      ).addTo(map);
    } else {
      _startMarker.setLngLat([parseFloat(p.start_lng), parseFloat(p.start_lat)]);
    }

    // ── End marker (red E) ────────────────────────────────────────────
    if (!_endMarker) {
      _endMarker = _makeEndpointMarker(
        [parseFloat(p.end_lng), parseFloat(p.end_lat)],
        '#dc2626', 'E'
      ).addTo(map);
    } else {
      _endMarker.setLngLat([parseFloat(p.end_lng), parseFloat(p.end_lat)]);
    }

    // ── Popup ─────────────────────────────────────────────────────────
    const riskColor   = RISK_COLORS[p.risk_level]   || '#6366f1';
    const statusColor = STATUS_COLORS[p.status]      || '#6b7280';
    const midCoords   = feat.geometry.coordinates[
      Math.floor(feat.geometry.coordinates.length / 2)
    ];

    const popupHTML = `
      <div style="
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        min-width:220px; padding:2px;
      ">
        <div style="
          background:linear-gradient(135deg,#1e1b4b,#312e81);
          color:#fff; padding:10px 12px; border-radius:6px 6px 0 0;
          margin:-8px -8px 8px -8px;
        ">
          <div style="font-size:13px;font-weight:700;margin-bottom:2px">${p.name}</div>
          <div style="font-size:10px;opacity:.75">${p.state} · ${p.zone}</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
          <div style="background:#f8fafc;border-radius:5px;padding:6px 8px">
            <div style="font-size:9px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Risk</div>
            <div style="font-size:12px;font-weight:700;color:${riskColor}">${p.risk_level}</div>
          </div>
          <div style="background:#f8fafc;border-radius:5px;padding:6px 8px">
            <div style="font-size:9px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Status</div>
            <div style="font-size:12px;font-weight:700;color:${statusColor}">${p.status}</div>
          </div>
          <div style="background:#f8fafc;border-radius:5px;padding:6px 8px">
            <div style="font-size:9px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Distance</div>
            <div style="font-size:12px;font-weight:700;color:#1e293b">${p.distance_km} km</div>
          </div>
          <div style="background:#f8fafc;border-radius:5px;padding:6px 8px">
            <div style="font-size:9px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Duration</div>
            <div style="font-size:12px;font-weight:700;color:#1e293b">${p.estimated_duration} min</div>
          </div>
        </div>

        <div style="border-top:1px solid #e2e8f0;padding-top:8px;font-size:11px;color:#475569">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="width:10px;height:10px;border-radius:50%;background:#16a34a;flex-shrink:0"></span>
            <strong>Start:</strong>&nbsp;${parseFloat(p.start_lat).toFixed(5)}, ${parseFloat(p.start_lng).toFixed(5)}
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="width:10px;height:10px;border-radius:50%;background:#dc2626;flex-shrink:0"></span>
            <strong>End:</strong>&nbsp;${parseFloat(p.end_lat).toFixed(5)}, ${parseFloat(p.end_lng).toFixed(5)}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            <span style="background:#ede9fe;color:#5b21b6;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:600">${p.vehicle_type}</span>
            <span style="background:#dbeafe;color:#1d4ed8;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:600">👮 ${p.assigned_officers} Officers</span>
            <span style="background:#dcfce7;color:#166534;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:600">${p.patrol_shift}</span>
          </div>
        </div>
      </div>
    `;

    if (_hoverPopup) {
      _hoverPopup.setLngLat(midCoords).setHTML(popupHTML);
    } else {
      _hoverPopup = new mapboxgl.Popup({
        closeButton:    false,
        closeOnClick:   false,
        offset:         12,
        maxWidth:       '280px',
        className:      'patrol-route-popup'
      })
        .setLngLat(midCoords)
        .setHTML(popupHTML)
        .addTo(map);
    }
  });

  map.on('mouseleave', layerHit, () => {
    map.getCanvas().style.cursor = '';
    if (_hoveredRouteId !== null) {
      map.setFeatureState({ source: sourceId, id: _hoveredRouteId }, { hover: false });
      _hoveredRouteId = null;
    }
    _clearHoverElements();
  });
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