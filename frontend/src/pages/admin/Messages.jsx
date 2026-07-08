import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Messages.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es-MX');
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await api.getMessages();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.deleteMessage(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-content">
        <h1 className="section-title">Mensajes</h1>
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p>Cargando...</p>
        ) : messages.length === 0 ? (
          <div className="card"><p>No hay mensajes</p></div>
        ) : (
          <div className="admin-list">
            {messages.map((m) => (
              <div key={m._id} className="card admin-item">
                <div className="admin-item-header">
                  <strong>{m.subject}</strong>
                  <span className="message-date">{formatDate(m.createdAt)}</span>
                </div>
                <p><strong>De:</strong> {m.name}</p>
                <p><strong>Correo:</strong> <a href={`mailto:${m.email}`}>{m.email}</a></p>
                <p><strong>Teléfono:</strong> <a href={`tel:+52${m.phone}`}>{m.phone}</a></p>
                <p className="message-body">{m.message}</p>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>Eliminar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
