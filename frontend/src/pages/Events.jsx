import { useState, useEffect } from 'react';
import { api } from '../services/api';
import ReservationForm from '../components/ReservationForm';
import { statusClass } from '../utils/status';
import './Events.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Events() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await api.getMyReservations();
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('¿Deseas cancelar esta reservación?')) return;
    try {
      await api.cancelReservation(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = async (data) => {
    try {
      await api.updateReservation(editing._id, data);
      setEditing(null);
      load();
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-content" style={{ textAlign: 'center' }}>Cargando eventos...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        <h1 className="section-title">Mis Eventos</h1>
        {error && <div className="alert alert-error">{error}</div>}

        {editing ? (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--color-brown)' }}>Editar reservación</h2>
            <ReservationForm
              initialData={editing}
              onSubmit={handleEdit}
              submitLabel="Guardar cambios"
            />
            <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setEditing(null)}>
              Cancelar edición
            </button>
          </div>
        ) : reservations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p>No tienes eventos reservados aún.</p>
          </div>
        ) : (
          <div className="events-list">
            {reservations.map((r) => (
              <div key={r._id} className="event-card card">
                <div className="event-header">
                  <span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
                  <span className="event-date">{formatDate(r.date)}</span>
                </div>
                <div className="event-body">
                  <p><strong>Tipo:</strong> {r.eventType}{r.customEventType ? ` - ${r.customEventType}` : ''}</p>
                  <p><strong>Servicio:</strong> {r.service}</p>
                  <p><strong>Hora:</strong> {r.startTime} ({r.duration} hrs)</p>
                  <p><strong>Descripción:</strong> {r.description}</p>
                </div>
                {r.status !== 'Cancelado' && r.status !== 'Completado' && (
                  <div className="event-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(r)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r._id)}>Cancelar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
