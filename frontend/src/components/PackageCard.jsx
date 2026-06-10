import { Link } from 'react-router-dom';
import './PackageCard.css';

export default function PackageCard({ pkg }) {
  return (
    <div className="package-card">
      <h3>{pkg.title}</h3>
      <ul>
        {pkg.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Link to={`/reservar?paquete=${encodeURIComponent(pkg.id)}`} className="btn btn-primary">
        Reservar
      </Link>
    </div>
  );
}
