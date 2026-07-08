import { useState } from 'react';
import './Reservation.css';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReservationForm from '../components/ReservationForm';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Reservation() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const defaultService = searchParams.get('paquete') || '';
  const { showToast } = useToast();

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
    try {
      await api.createReservation(data);
      setLoading(false);
      showToast('Reservación solicitada correctamente', 'success');
      navigate('/reservacion-confirmada');
    } catch (err) {
      setLoading(false);
      showToast(err?.message || 'Error al crear reservación', 'error');
      throw err;
    }
  };

  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: 700 }}>
        <h1 className="section-title">Reservar</h1>
        <ReservationForm
          defaultService={defaultService}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
