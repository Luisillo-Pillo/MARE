import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import './Admin.css';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const filterParam = filter === 'all' ? '' : filter === 'with' ? 'with' : 'without';
      const data = await api.getClients(filterParam);
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleRoleChange = async (id, role) => {
    try {
      await api.updateClientRole(id, role);
      load();
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="page">
      <div className="page-content">
        <h1 className="section-title">Clientes</h1>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="admin-filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todos</button>
          <button className={filter === 'with' ? 'active' : ''} onClick={() => setFilter('with')}>Con reservaciones</button>
          <button className={filter === 'without' ? 'active' : ''} onClick={() => setFilter('without')}>Sin reservaciones</button>
        </div>

        {loading ? (
          <p>Cargando...</p>
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
                {clients.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      <select
                        value={c.role}
                        onChange={(e) => handleRoleChange(c._id, e.target.value)}
                      >
                        <option value="usuario">Usuario</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{c.reservationCount}</td>
                    <td className="actions-cell">
                      <Link to={`/admin/clientes/${c._id}`} className="btn btn-secondary btn-sm">Ver perfil</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id, c.name)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
