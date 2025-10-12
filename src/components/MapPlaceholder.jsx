import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapPlaceholder = ({ firData, darkMode }) => {
  const center = [19.076, 72.8777];

  const tileLayer = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const getIcon = (severity) =>
    new L.DivIcon({
      html: `<div style="
        background-color: ${
          severity === 'High'
            ? '#ef4444'
            : severity === 'Medium'
            ? '#f97316'
            : '#22c55e'
        };
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
      "></div>`,
      className: '',
      iconSize: [20, 20],
    });

  return (
    <MapContainer center={center} zoom={11} className="h-96 w-full">
      <TileLayer url={tileLayer} />
      <MarkerClusterGroup>
        {firData.map((fir) => (
          <Marker key={fir.id} position={[fir.lat, fir.lng]} icon={getIcon(fir.severity)}>
            <Popup>
              <div>
                <strong>{fir.type}</strong>
                <p>{fir.location}</p>
                <p>Severity: {fir.severity}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapPlaceholder;
