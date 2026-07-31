import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import {
  Plus, MapPin, Compass, Calendar, User, TrendingUp,
  Activity, CheckCircle, ListTodo, Sparkles, RefreshCw, Filter
} from 'lucide-react';
import { initializeMapbox, createMap, addPatrolRoute, addPatrolRoutesInteractive } from '../services/mapService';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const PatrolPage = () => {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const mapInstance  = useRef(null);
  const startMarker  = useRef(null);
  const routesLoaded = useRef(false);

  const [showRouteForm, setShowRouteForm]   = useState(false);
  const [routeMode,     setRouteMode]       = useState('ai');
  const [isLoading,     setIsLoading]       = useState(false);
  const [loadingRoutes, setLoadingRoutes]   = useState(true);

  // Real dataset routes
  const [patrolRoutes, setPatrolRoutes]     = useState([]);
  const [totalRoutes,  setTotalRoutes]      = useState(0);
  const [states,       setStates]           = useState([]);
  const [filters,      setFilters]          = useState({ state: '', risk: '', status: '', page: 1 });

  // AI optimize form
  const [routeFormData, setRouteFormData]   = useState({
    name: '', officer: '', start: '', end: '',
    time: '18:00 - 22:00', shiftDuration: 8, avgSpeed: 40,
    startPoint: { lat: 19.0760, lng: 72.8777 }
  });
  const [optimizedResult, setOptimizedResult] = useState(null);

  // ── Load states for filter dropdown ──────────────────────────────────────
  useEffect(() => {
    axios.get(`${API}/patrol/states`)
      .then(res => { if (res.data?.success) setStates(res.data.data.states); })
      .catch(console.error);
  }, []);

  // ── Load routes from dataset API ─────────────────────────────────────────
  const loadRoutes = async (f = filters) => {
    setLoadingRoutes(true);
    try {
      const params = { page: f.page, per_page: 50 };
      if (f.state)  params.state  = f.state;
      if (f.risk)   params.risk   = f.risk;
      if (f.status) params.status = f.status;

      const res = await axios.get(`${API}/patrol/routes`, { params });
      if (res.data?.success) {
        const { routes, total } = res.data.data;
        setPatrolRoutes(routes);
        setTotalRoutes(total);

        // Draw on map when ready
        if (mapInstance.current) {
          const drawRoutes = () => addPatrolRoutesInteractive(mapInstance.current, routes);
          if (mapInstance.current.loaded()) drawRoutes();
          else mapInstance.current.once('load', drawRoutes);
        }
      }
    } catch (e) {
      console.error('Failed to load patrol routes', e);
    } finally {
      setLoadingRoutes(false);
    }
  };

  // ── Mapbox init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ||
      'pk.eyJ1IjoiaXRzLXNodWJoYW5zaHUxODA2IiwiYSI6ImNtbnEzYWo3cTAzMDQydHF3MjRtZmRhd28ifQ.IO6GE3YIol2xICknEhR-rQ';
    initializeMapbox(token);

    mapInstance.current = createMap(mapContainer.current, {
      style: process.env.REACT_APP_MAPBOX_STYLE || 'mapbox://styles/mapbox/dark-v11',
      center: [78.9629, 20.5937], // India center
      zoom: 4.5
    });
    mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapInstance.current.on('load', () => {
      if (!routesLoaded.current) {
        routesLoaded.current = true;
        loadRoutes();
      }
    });

    mapInstance.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setRouteFormData(prev => ({
        ...prev,
        startPoint: { lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) },
        start: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }));
      if (startMarker.current) {
        startMarker.current.setLngLat([lng, lat]);
      } else {
        const el = document.createElement('div');
        el.style.cssText = 'width:22px;height:22px;background:#ef4444;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.4)';
        el.textContent = 'S';
        startMarker.current = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(mapInstance.current);
      }
    });

    return () => {
      startMarker.current?.remove(); startMarker.current = null;
      mapInstance.current?.remove(); mapInstance.current = null;
      routesLoaded.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Apply filters ─────────────────────────────────────────────────────────
  const applyFilters = () => {
    const f = { ...filters, page: 1 };
    setFilters(f);
    loadRoutes(f);
  };

  // ── AI optimize ───────────────────────────────────────────────────────────
  const handleOptimizeRoute = async () => {
    setIsLoading(true); setOptimizedResult(null);
    try {
      const res = await axios.post(`${API}/patrol/optimize`, {
        start_point:    routeFormData.startPoint,
        shift_duration: parseFloat(routeFormData.shiftDuration),
        avg_speed:      parseFloat(routeFormData.avgSpeed)
      });
      if (res.data?.success) {
        const result = res.data.data;
        setOptimizedResult(result);
        if (result.route?.length > 0) {
          const waypoints = [routeFormData.startPoint,
            ...result.route.map(leg => ({ lat: leg.location.lat, lng: leg.location.lng }))];
          const map = mapInstance.current;
          if (map.getLayer('opt-route')) { map.removeLayer('opt-route'); map.removeSource('opt-route'); }
          addPatrolRoute(map, { waypoints }, 'opt-route');
          const bounds = new mapboxgl.LngLatBounds();
          waypoints.forEach(wp => bounds.extend([wp.lng, wp.lat]));
          map.fitBounds(bounds, { padding: 50 });
        }
      }
    } catch { alert('Error calling route optimizer. Ensure Flask backend is running.'); }
    finally { setIsLoading(false); }
  };

  // ── Save new route ────────────────────────────────────────────────────────
  const handleSubmitRoute = (e) => {
    e.preventDefault();
    if (!routeFormData.name || !routeFormData.officer) { alert('Please fill Route Name and Officer.'); return; }
    const waypoints = optimizedResult?.route
      ? [routeFormData.startPoint, ...optimizedResult.route.map(l => ({ lat: l.location.lat, lng: l.location.lng }))]
      : [routeFormData.startPoint,
         { lat: routeFormData.startPoint.lat + 0.01, lng: routeFormData.startPoint.lng + 0.01 }];

    const newRoute = {
      id: `MANUAL-${Date.now()}`, name: routeFormData.name, state: 'Manual',
      zone: 'Custom', patrol_type: 'Manual Patrol', route_source: 'Manual',
      risk_level: 'MEDIUM', hotspot_score: 0, crime_count: 0,
      patrol_date: new Date().toISOString().split('T')[0],
      patrol_shift: 'Custom', vehicle_type: 'Police Car', assigned_officers: 1,
      distance_km: 0, estimated_duration: routeFormData.shiftDuration * 60,
      total_checkpoints: waypoints.length, status: 'Scheduled',
      start: { lat: waypoints[0].lat, lng: waypoints[0].lng, label: routeFormData.start || 'Start' },
      end:   { lat: waypoints[waypoints.length-1].lat, lng: waypoints[waypoints.length-1].lng, label: routeFormData.end || 'End' },
      waypoints
    };

    setPatrolRoutes(prev => [newRoute, ...prev]);
    addPatrolRoutesInteractive(mapInstance.current, [newRoute, ...patrolRoutes]);
    setShowRouteForm(false);
    setOptimizedResult(null);
    setRouteFormData({ name:'', officer:'', start:'', end:'', time:'18:00 - 22:00', shiftDuration:8, avgSpeed:40, startPoint:{lat:19.0760,lng:72.8777} });
  };

  const focusRoute = (route) => {
    if (!mapInstance.current || !route.waypoints?.length) return;
    const bounds = new mapboxgl.LngLatBounds();
    route.waypoints.forEach(wp => bounds.extend([wp.lng, wp.lat]));
    mapInstance.current.fitBounds(bounds, { padding: 60 });
  };

  const activeCount    = patrolRoutes.filter(r => r.status === 'Active').length;
  const plannedCount   = patrolRoutes.filter(r => r.status === 'Scheduled').length;
  const completedCount = patrolRoutes.filter(r => r.status === 'Completed').length;

  const riskBadge = { CRITICAL:'bg-red-100 text-red-700', HIGH:'bg-orange-100 text-orange-700', MEDIUM:'bg-yellow-100 text-yellow-700', LOW:'bg-green-100 text-green-700' };
  const statusBadge = { Active:'bg-emerald-100 text-emerald-700', Scheduled:'bg-indigo-100 text-indigo-700', Completed:'bg-gray-100 text-gray-600', Cancelled:'bg-red-100 text-red-600' };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Compass className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
            {t('map.patrolRoutes') || 'Patrol Routes'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Live dataset: <strong>{totalRoutes.toLocaleString()}</strong> real patrol routes across India — hover any route on the map to inspect it.
          </p>
        </div>
        <button onClick={() => setShowRouteForm(!showRouteForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition shadow-lg flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-5 h-5" /> Plan New Route
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Active Patrols',  val: activeCount,          icon: Activity,    from:'from-indigo-500',  to:'to-indigo-600' },
          { label:'Planned Routes',  val: plannedCount,          icon: Calendar,    from:'from-purple-500',  to:'to-purple-600' },
          { label:'Completed Today', val: completedCount,        icon: CheckCircle, from:'from-emerald-500', to:'to-emerald-600' },
          { label:'Total Loaded',    val: patrolRoutes.length,   icon: ListTodo,    from:'from-orange-500',  to:'to-orange-600' },
        ].map(({ label, val, icon: Icon, from, to }) => (
          <div key={label} className={`bg-gradient-to-br ${from} ${to} rounded-2xl p-5 text-white shadow-md flex items-center justify-between`}>
            <div>
              <p className="text-white/75 text-xs font-semibold uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-extrabold mt-1">{val}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg"><Icon className="w-6 h-6 text-white" /></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <Filter className="w-4 h-4 text-gray-400 self-center" />
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">State</label>
          <select value={filters.state} onChange={e => setFilters(f => ({...f, state: e.target.value}))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Risk Level</label>
          <select value={filters.risk} onChange={e => setFilters(f => ({...f, risk: e.target.value}))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
            <option value="">All Risks</option>
            {['CRITICAL','HIGH','MEDIUM','LOW'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
          <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {['In Progress','Scheduled','Completed','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={applyFilters} disabled={loadingRoutes}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2">
          {loadingRoutes ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
          Apply
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Panel */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">

          {/* New Route Form */}
          {showRouteForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl p-5">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" /> Configure Patrol Dispatch
              </h2>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
                {['ai','manual'].map(m => (
                  <button key={m} type="button" onClick={() => setRouteMode(m)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${routeMode===m?'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm':'text-gray-500'}`}>
                    {m === 'ai' ? 'AI-Predicted Route' : 'Manual Route'}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmitRoute} className="space-y-3">
                <input required type="text" placeholder="Route Name" value={routeFormData.name}
                  onChange={e => setRouteFormData({...routeFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="text" placeholder="Officer Name" value={routeFormData.officer}
                    onChange={e => setRouteFormData({...routeFormData, officer: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                  <input type="text" placeholder="Shift Time" value={routeFormData.time}
                    onChange={e => setRouteFormData({...routeFormData, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-4 h-4 text-red-500" /> Start Point
                  </span>
                  <p className="text-xs text-gray-400 mb-1">Click the map to set start coordinates.</p>
                  <input readOnly value={routeFormData.start || 'Click on map to select'}
                    className="w-full px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-300 border-none" />
                </div>
                {routeMode === 'ai' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" min="1" max="24" placeholder="Shift Hours" value={routeFormData.shiftDuration}
                      onChange={e => setRouteFormData({...routeFormData, shiftDuration: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" min="10" max="100" placeholder="Avg Speed km/h" value={routeFormData.avgSpeed}
                      onChange={e => setRouteFormData({...routeFormData, avgSpeed: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                  </div>
                )}
                {routeMode === 'ai' && (
                  <button type="button" onClick={handleOptimizeRoute} disabled={isLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                    Optimize via AI
                  </button>
                )}
                {optimizedResult && (
                  <div className="grid grid-cols-2 gap-2 text-xs bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 p-3 rounded-xl">
                    {[
                      ['Distance', `${optimizedResult.statistics.total_distance} km`],
                      ['Shift Time', `${optimizedResult.statistics.total_time} min`],
                      ['Hotspots', `${optimizedResult.statistics.hotspots_covered}`],
                      ['Efficiency', `${optimizedResult.statistics.efficiency}`],
                    ].map(([k,v]) => (
                      <div key={k} className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="text-gray-400 block">{k}</span>
                        <strong className="text-gray-900 dark:text-white">{v}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-sm">
                    Confirm &amp; Dispatch
                  </button>
                  <button type="button" onClick={() => { setShowRouteForm(false); setOptimizedResult(null); }}
                    className="px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Route List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md p-5 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" />
              Patrol Fleet <span className="ml-auto text-xs font-normal text-gray-400">{patrolRoutes.length} shown · {totalRoutes.toLocaleString()} total</span>
            </h3>
            {loadingRoutes ? (
              <div className="flex-1 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-700 pr-1">
                {patrolRoutes.map(route => (
                  <div key={route.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate max-w-[180px]">
                          {route.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${statusBadge[route.status] || 'bg-gray-100 text-gray-600'}`}>
                          {route.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${riskBadge[route.risk_level] || 'bg-gray-100 text-gray-600'}`}>
                          {route.risk_level}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {route.state}</span>
                        <span>·</span>
                        <span>{route.distance_km} km</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><User className="w-3 h-3" /> {route.assigned_officers}</span>
                      </div>
                    </div>
                    <button onClick={() => focusRoute(route)}
                      className="text-[10px] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 mt-1">
                      Track →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md p-3 min-h-[520px] flex flex-col relative overflow-hidden">
          <div className="absolute top-5 left-5 z-10 bg-white/95 dark:bg-gray-800/95 border border-gray-100 dark:border-gray-700 px-3 py-2 rounded-xl shadow-md flex items-center gap-2 pointer-events-none">
            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Live Fleet Map — Hover routes for details</span>
          </div>
          <div className="absolute bottom-5 left-5 z-10 bg-white/90 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 px-3 py-2 rounded-xl shadow-md pointer-events-none">
            <div className="flex flex-col gap-1">
              {[['#ef4444','CRITICAL'],['#f97316','HIGH'],['#eab308','MEDIUM'],['#22c55e','LOW']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-2">
                  <span style={{background:c}} className="w-4 h-1.5 rounded-full inline-block" />
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div ref={mapContainer} className="w-full h-full flex-1 rounded-xl overflow-hidden min-h-[500px]" />
        </div>

      </div>
    </div>
  );
};

export default PatrolPage;
