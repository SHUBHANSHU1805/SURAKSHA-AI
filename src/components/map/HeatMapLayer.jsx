import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useFIR } from '../../hooks/useFIR';
import { createHeatmapData, initializeGoogleMaps } from '../../services/mapService';

const HeatmapLayer = ({ map }) => {
  const { showHeatmap } = useSelector((state) => state.map);
  const { firs } = useFIR();
  const heatmapRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google) return;

    if (showHeatmap && firs.length > 0) {
      const heatmapData = createHeatmapData(firs);

      if (!heatmapRef.current) {
        heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map: map,
          radius: 30,
          opacity: 0.7,
          gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(63, 0, 255, 1)',
            'rgba(127, 0, 255, 1)',
            'rgba(191, 0, 255, 1)',
            'rgba(255, 0, 255, 1)',
            'rgba(255, 0, 191, 1)',
            'rgba(255, 0, 127, 1)',
            'rgba(255, 0, 63, 1)',
            'rgba(255, 0, 0, 1)'
          ]
        });
      } else {
        heatmapRef.current.setData(heatmapData);
      }
    } else if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
    }

    return () => {
      if (heatmapRef.current && !showHeatmap) {
        heatmapRef.current.setMap(null);
      }
    };
  }, [map, showHeatmap, firs]);

  return null; // Heatmap is rendered on the map object
};

export default HeatmapLayer;