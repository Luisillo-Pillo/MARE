import { BUSINESS } from '../constants/packages';
import './Map.css';

export default function Map() {
  const [lat, lng] = BUSINESS.coords;
  const src = `https://www.google.com/maps?q=${lat},${lng}&hl=es&z=16&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="map-wrapper">
      <iframe
        className="google-map"
        title="Ubicación de MARE en Google Maps"
        src={src}
        width="100%"
        height="350"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        className="btn directions-btn"
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
      >
        Cómo llegar
      </a>
    </div>
  );
}
