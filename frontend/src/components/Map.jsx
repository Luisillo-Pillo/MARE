import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { BUSINESS } from '../constants/packages';
import 'leaflet/dist/leaflet.css';
import './Map.css';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Map() {
  return (
    <MapContainer center={BUSINESS.coords} zoom={16} scrollWheelZoom={false} style={{ height: '350px', width: '100%', borderRadius: '12px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={BUSINESS.coords} icon={icon}>
        <Popup>
          <strong>MARE</strong>
          <br />
          {BUSINESS.address}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
