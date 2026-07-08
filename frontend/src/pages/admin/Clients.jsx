import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './Clients.css';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmState, setConfirmState] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const filterParam = filter === 'all' ? '' : filter === 'with' ? 'with' : 'without';
      const data = await api.getClients(filterParam);
      setClients(data.filter((c) => c._id !== user?._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter, user]);

  const handleRoleChange = async (id, role) => {
    // open confirm modal
    setConfirmState({ id, role });
  };

  const doRoleChange = async () => {
    if (!confirmState) return;
    const { id, role } = confirmState;
    setConfirmState(null);
    try {
      await api.updateClientRole(id, role);
      showToast('Rol actualizado', 'success');
      load();
    } catch (err) {
      console.error('updateClientRole error', err);
      const msg = err?.data?.message || err?.message || 'Error al cambiar el rol';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar a ${name} y todas sus reservaciones?`)) return;
    try {
      await api.deleteClient(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredClients = clients.filter((c) => {
    if (!normalizedSearch) return true;
    return [c.name, c.email, c.phone]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch);
  });

  const adminClients = filteredClients.filter((c) => c.role === 'admin');
  const normalClients = filteredClients.filter((c) => c.role !== 'admin');

  return (
    <div className="page">
      <div className="page-content">
        <h1 className="section-title">Clientes</h1>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="admin-toolbar">
          <div className="admin-filters">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todos</button>
            <button className={filter === 'with' ? 'active' : ''} onClick={() => setFilter('with')}>Con reservaciones</button>
            <button className={filter === 'without' ? 'active' : ''} onClick={() => setFilter('without')}>Sin reservaciones</button>
          </div>
          <input
            type="search"
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente por nombre, correo o teléfono"
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            {adminClients.length > 0 && (
              <section style={{ marginBottom: '2rem' }}>
                <h2 className="section-title">Administradores</h2>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Reservaciones</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminClients.map((c) => (
                        <tr key={c._id}>
                          <td>{c.name}</td>
                          <td>{c.email}</td>
                          <td>{c.phone}</td>
                          <td>{c.role}</td>
                          <td>{c.reservationCount}</td>
                          <td className="actions-cell">
                            <Link to={`/admin/clientes/${c._id}`} className="btn btn-secondary btn-sm">Ver perfil</Link>
                            {c.role !== 'admin' ? (
                              <button className="btn btn-primary btn-sm" onClick={() => handleRoleChange(c._id, 'admin')}>Hacer admin</button>
                            ) : (
                              <button className="btn btn-outline btn-sm" onClick={() => handleRoleChange(c._id, 'usuario')}>Quitar admin</button>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id, c.name)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section>
              <h2 className="section-title">Usuarios</h2>
              {normalClients.length === 0 ? (
                <p>No se encontraron usuarios con esos criterios.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Reservaciones</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normalClients.map((c) => (
                        <tr key={c._id}>
                          <td>{c.name}</td>
                          <td>{c.email}</td>
                          <td>{c.phone}</td>
                          <td>{c.role}</td>
                          <td>{c.reservationCount}</td>
                          <td className="actions-cell">
                            <Link to={`/admin/clientes/${c._id}`} className="btn btn-secondary btn-sm">Ver perfil</Link>
                            {c.role !== 'admin' ? (
                              <button className="btn btn-primary btn-sm" onClick={() => handleRoleChange(c._id, 'admin')}>Hacer admin</button>
                            ) : (
                              <button className="btn btn-outline btn-sm" onClick={() => handleRoleChange(c._id, 'usuario')}>Quitar admin</button>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id, c.name)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <ConfirmModal
              open={!!confirmState}
              title={confirmState?.role === 'admin' ? 'Asignar administrador' : 'Quitar administrador'}
              message={confirmState?.role === 'admin' ? '¿Asignar rol de administrador a este usuario?' : '¿Quitar rol de administrador de este usuario?'}
              onConfirm={doRoleChange}
              onCancel={() => setConfirmState(null)}
            />
          </>
        )}
      </div>
    </div>
  );
}
