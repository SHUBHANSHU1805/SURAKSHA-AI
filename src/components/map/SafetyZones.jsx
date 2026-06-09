import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFIR } from '../../hooks/useFIR';

const SafetyZones = ({ map }) => {
  const { showSafetyZones } = useSelector((state) => state.map);
  const { firs } = useFIR();
  const zonesRef = useRef([]);
  const [zones, setZones] = useState([]);

  // Calculate safety zones based on crime density
  const calculateSafetyZones = (crimes) => {
    // Grid-based approach - divide map into zones and calculate safety score
    const gridSize = 0.05; // degrees
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
      safetyIndex: calculateSafetyIndex(zone.crimeCount, zone.severity / zone.crimeCount)
    }));
  };

  const getSeverityScore = (severity) => {
    const scores = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    return scores[severity] || 1;
  };

  const calculateSafetyIndex = (crimeCount, avgSeverity) => {
    // Safety index from 0-100 (100 = safest)
    return Math.max(0, 100 - (crimeCount * 5 + avgSeverity * 10));
  };

  const getZoneColor = (safetyIndex) => {
    if (safetyIndex >= 75) return '#00B050'; // Green - Safe
    if (safetyIndex >= 50) return '#FFC000'; // Yellow - Moderate
    if (safetyIndex >= 25) return '#FF6600'; // Orange - Unsafe
    return '#C00000'; // Red - Very Unsafe
  };

  useEffect(() => {
    if (!map || !showSafetyZones || firs.length === 0) {
      // Clear existing zones
      zonesRef.current.forEach(zone => zone.setMap(null));
      zonesRef.current = [];
      return;
    }

    const calculatedZones = calculateSafetyZones(firs);
    setZones(calculatedZones);

    // Clear old zones
    zonesRef.current.forEach(zone => zone.setMap(null));
    zonesRef.current = [];

    // Draw new zones
    calculatedZones.forEach(zone => {
      const rectangle = new window.google.maps.Rectangle({
        strokeColor: getZoneColor(zone.safetyIndex),
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: getZoneColor(zone.safetyIndex),
        fillOpacity: 0.3,
        map: map,
        bounds: {
          north: zone.lat + 0.025,
          south: zone.lat - 0.025,
          east: zone.lng + 0.025,
          west: zone.lng - 0.025
        }
      });

      // Add info window on click
      rectangle.addListener('click', () => {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div>
            <strong>Safety Index: ${zone.safetyIndex.toFixed(1)}</strong><br/>
            Crimes: ${zone.crimeCount}<br/>
            Avg Severity: ${zone.avgSeverity.toFixed(1)}/4
          </div>`
        });
        infoWindow.open(map, rectangle);
      });

      zonesRef.current.push(rectangle);
    });
  }, [map, showSafetyZones, firs]);

  return null;
};

export default SafetyZones;