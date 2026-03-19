import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
// Using CDN to avoid Vite asset resolution issues
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function LocationDisplay({ lat, lng, title }) {
  if (!lat || !lng) return null;

  const position = [parseFloat(lat), parseFloat(lng)];

  return (
    <div className="h-48 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:h-64">
      <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="h-full w-full"><TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /><Marker position={position} /></MapContainer>
    </div>
  );
}
