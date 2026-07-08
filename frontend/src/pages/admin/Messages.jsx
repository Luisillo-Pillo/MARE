import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Messages.css';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es-MX');
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast } = useToast();

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

  const handleDelete = (id) => {
    setDeleteConfirm({ id });
  };

  const doDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.deleteMessage(deleteConfirm.id);
      showToast('Mensaje eliminado', 'success');
      setDeleteConfirm(null);
      load();
    } catch (err) {
      setError(err.message);
      showToast(err?.message || 'Error al eliminar mensaje', 'error');
      setDeleteConfirm(null);
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
                <button className="trash-btn" title="Eliminar mensaje" onClick={() => handleDelete(m._id)} aria-label="Eliminar mensaje">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="admin-item-header">
                  <div className="subject-block">
                    <strong className="subject">{m.subject}</strong>
                    <div className="meta">De <span className="meta-name">{m.name}</span> — <a href={`mailto:${m.email}`}>{m.email}</a></div>
                  </div>
                  <span className="message-date">{formatDate(m.createdAt)}</span>
                </div>
                <div className="contact-row">
                  <div><strong>Teléfono:</strong> <a href={`tel:+52${m.phone}`}>{m.phone}</a></div>
                </div>
                <p className="message-body">{m.message}</p>
              </div>
            ))}
          </div>
        )}
        <ConfirmModal
          open={!!deleteConfirm}
          title="Eliminar mensaje"
          message="¿Eliminar este mensaje? Esta acción no se puede deshacer."
          onConfirm={doDelete}
          onCancel={() => setDeleteConfirm(null)}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
        />
      </div>
    </div>
  );
}
