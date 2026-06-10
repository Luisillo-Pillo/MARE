import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReservationForm from '../components/ReservationForm';
import { api } from '../services/api';

export default function Reservation() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const defaultService = searchParams.get('paquete') || '';

  if (!user) {
    return (
      <div className="page">
        <div className="page-content" style={{ maxWidth: 600, textAlign: 'center' }}>
          <h1 className="section-title">Reservar</h1>
          <div className="card">
            <p>Para enviar una solicitud de reservación necesitas tener una sesión activa.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/iniciar-sesion" className="btn btn-primary">Iniciar sesión</Link>
              <Link to="/registro" className="btn btn-secondary">Registrarse</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data) => {
    setLoading(true);
    setSuccess('');
    try {
      await api.createReservation(data);
      setSuccess('¡Reservación enviada! Te notificaremos cuando sea confirmada.');
      setTimeout(() => navigate('/eventos'), 2000);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: 700 }}>
        <h1 className="section-title">Reservar</h1>
        {success && <div className="alert alert-success">{success}</div>}
        <ReservationForm
          defaultService={defaultService}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
