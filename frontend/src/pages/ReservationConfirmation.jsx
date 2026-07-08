import { Link } from 'react-router-dom';
import './ReservationConfirmation.css';

export default function ReservationConfirmation() {
  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: 700, textAlign: 'center' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h1 className="section-title">Reservación solicitada</h1>
          <p style={{ fontSize: '1.1rem', margin: '1.25rem 0' }}>
            Tu reservación fue solicitada correctamente. Nuestro equipo la revisará y te contactará pronto.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/eventos" className="btn btn-primary">Ver mis eventos</Link>
            <Link to="/" className="btn btn-secondary">Volver al inicio</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
