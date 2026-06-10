import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { statusClass } from '../../utils/status';
import './Admin.css';

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

  useEffect(() => {
    api.getClientProfile(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><div className="page-content">Cargando...</div></div>;
  if (error) return <div className="page"><div className="page-content"><div className="alert alert-error">{error}</div></div></div>;
  if (!data) return null;

  const { user, reservations } = data;

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
        </div>

        <h2 style={{ color: 'var(--color-brown)', marginBottom: '1rem' }}>Reservaciones</h2>
        {reservations.length === 0 ? (
          <div className="card"><p>Sin reservaciones</p></div>
        ) : (
          <div className="admin-list">
            {reservations.map((r) => (
              <div key={r._id} className="card admin-item">
                <span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
                <p><strong>Fecha:</strong> {formatDate(r.date)} — {r.startTime} ({r.duration} hrs)</p>
                <p><strong>Tipo:</strong> {r.eventType}{r.customEventType ? ` - ${r.customEventType}` : ''}</p>
                <p><strong>Servicio:</strong> {r.service}</p>
                <p><strong>Descripción:</strong> {r.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
