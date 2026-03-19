import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
// Using CDN to avoid Vite asset resolution issues
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationPicker({ onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || null);

  const handleSetPosition = (pos) => {
    setPosition(pos);
    if (onLocationSelect) {
      onLocationSelect({
        lat: pos.lat,
        lng: pos.lng,
      });
    }
  };

  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <MapContainer
        center={[27.7172, 85.324]} // Default to Kathmandu
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      ><TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /><LocationMarker position={position} setPosition={handleSetPosition} /></MapContainer>
      <div className="bg-black/20 p-2 text-center text-[10px] text-slate-400">
        Click on the map to set the auction item location
      </div>
    </div>
  );
}
