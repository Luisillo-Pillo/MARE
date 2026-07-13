import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="page">
      <div className="page-content not-found-page">
        <div className="card not-found-card">
          <h1 className="section-title">404</h1>
          <p>La página que buscas no existe o fue movida.</p>
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
