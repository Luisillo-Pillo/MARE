import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReservationForm from '../../components/ReservationForm';
import { api } from '../../services/api';
import { statusClass } from '../../utils/status';
import './UserProfile.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function UserProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileData = await api.getClientProfile(id);
      setData(profileData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (loading) return <div className="page"><div className="page-content">Cargando...</div></div>;
  if (error) return <div className="page"><div className="page-content"><div className="alert alert-error">{error}</div></div></div>;
  if (!data) return null;

  const { user, reservations } = data;

  const handleCreateReservation = async (formData) => {
    setCreating(true);
    setSuccessMessage('');
    try {
      await api.createAdminReservation({ ...formData, userId: user._id });
      setSuccessMessage('Reservación creada correctamente.');
      setShowCreate(false);
      await loadProfile();
    } catch (err) {
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page">
      <div className="page-content">
        <h1 className="section-title">Perfil de {user.name}</h1>

        <div className="card" style={{ maxWidth: 600, marginBottom: '2rem' }}>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Correo:</strong> {user.email}</p>
          <p><strong>Teléfono:</strong> {user.phone}</p>
          <p><strong>Rol:</strong> {user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
          <p><strong>Registrado:</strong> {formatDate(user.createdAt)}</p>
          {user.role !== 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowCreate((prev) => !prev)}>
              {showCreate ? 'Cancelar nueva reservación' : 'Agendar reservación'}
            </button>
          )}
        </div>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        {showCreate && user.role !== 'admin' && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-brown)' }}>Reservar para {user.name}</h3>
            <ReservationForm
              onSubmit={handleCreateReservation}
              submitLabel={creating ? 'Creando...' : 'Crear reservación'}
              loading={creating}
            />
          </div>
        )}

        <h2 style={{ color: 'var(--color-brown)', marginBottom: '1rem' }}>Reservaciones</h2>
        {reservations.length === 0 ? (
          <div className="card"><p>Sin reservaciones</p></div>
        ) : (
          <div className="admin-list">
            {reservations.map((r) => (
              <div key={r._id} className="card admin-item">
                <span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
                <p><strong>Fecha:</strong> {formatDate(r.date)} — {r.startTime} - {r.endTime}</p>
                <p><strong>Tipo:</strong> {r.eventType}{r.customEventType ? ` - ${r.customEventType}` : ''}</p>
                <p><strong>Servicio:</strong> {r.service === 'Otro' ? r.customService : r.service}</p>
                <p><strong>Descripción:</strong> {r.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
