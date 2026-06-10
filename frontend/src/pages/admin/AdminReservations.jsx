import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ReservationForm from '../../components/ReservationForm';
import { statusClass } from '../../utils/status';
import './Admin.css';

const STATUS_FILTERS = ['todas', 'Pendiente', 'Confirmado', 'En proceso', 'Completado', 'Cancelado'];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX');
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [createUserId, setCreateUserId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [resData, clientsData] = await Promise.all([
        api.getAdminReservations(statusFilter === 'todas' ? '' : statusFilter),
        api.getClients(),
      ]);
      setReservations(resData);
      setClients(clientsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateReservationStatus(id, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta reservación?')) return;
    try {
      await api.deleteReservation(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async (data) => {
    if (!createUserId) {
      throw new Error('Selecciona un cliente');
    }
    await api.createAdminReservation({ ...data, userId: createUserId });
    setShowCreate(false);
    setCreateUserId('');
    load();
  };

  const handleEdit = async (data) => {
    await api.updateAdminReservation(editing._id, {
      ...data,
      userId: editing.user?._id || editing.user,
      status: editing.status,
    });
    setEditing(null);
    load();
  };

  return (
    <div className="page">
      <div className="page-content">
        <h1 className="section-title">Reservaciones</h1>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="admin-toolbar">
          <div className="admin-filters">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                className={statusFilter === s ? 'active' : ''}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'todas' ? 'Ver todas' : s}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => { setShowCreate(true); setEditing(null); }}>
            Nueva reservación
          </button>
        </div>

        {showCreate && (
          <div className="card" style={{ marginBottom: '2rem', maxWidth: 700 }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-brown)' }}>Crear reservación</h3>
            <div className="form-group">
              <label>Cliente</label>
              <select value={createUserId} onChange={(e) => setCreateUserId(e.target.value)} required>
                <option value="">Selecciona cliente</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} — {c.email}</option>
                ))}
              </select>
            </div>
            <ReservationForm onSubmit={handleCreate} submitLabel="Crear reservación" />
            <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setShowCreate(false)}>Cancelar</button>
          </div>
        )}

        {editing && (
          <div className="card" style={{ marginBottom: '2rem', maxWidth: 700 }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-brown)' }}>Editar reservación</h3>
            <ReservationForm
              initialData={editing}
              onSubmit={handleEdit}
              submitLabel="Guardar cambios"
            />
            <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        )}

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="admin-list">
            {reservations.map((r) => (
              <div key={r._id} className="card admin-item">
                <div className="admin-item-header">
                  <span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    className="status-select"
                  >
                    {STATUS_FILTERS.filter((s) => s !== 'todas').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <p><strong>Cliente:</strong> {r.user?.name} ({r.user?.email})</p>
                <p><strong>Fecha:</strong> {formatDate(r.date)} — {r.startTime} ({r.duration} hrs)</p>
                <p><strong>Tipo:</strong> {r.eventType}{r.customEventType ? ` - ${r.customEventType}` : ''}</p>
                <p><strong>Servicio:</strong> {r.service}</p>
                <p><strong>Descripción:</strong> {r.description}</p>
                <div className="actions-cell">
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(r); setShowCreate(false); }}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
