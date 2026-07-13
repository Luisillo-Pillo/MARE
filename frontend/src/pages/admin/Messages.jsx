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
										<path d="M3 6h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M7 6h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M9 6v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M15 6v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</button>
								<div className="admin-item-header">
									<div className="subject-block">
										<div className="asunto">
											<strong className="subject">Asunto:</strong>
											<span className="subject" style={{ fontWeight: 500 }}>{m.subject}</span>
										</div>
										<div className="meta">
											<div>De: <span className="meta-name">{m.name}</span></div>
											<div>Correo: <span className="meta-name">{m.email}</span></div>
											<div>Teléfono: <span className="meta-name">{m.phone}</span></div>
										</div>
									</div>
									<span className="message-date">{formatDate(m.createdAt)}</span>
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
