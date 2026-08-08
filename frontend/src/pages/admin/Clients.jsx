import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './Clients.css';
import ConfirmModal from '../../components/ConfirmModal';
import ActionsMenu from '../../components/ActionsMenu';
import Avatar from '../../components/Avatar';
import { useToast } from '../../context/ToastContext';

function UserIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
			<path d="M4.5 20c1.4-3.5 4.5-5.5 7.5-5.5s6.1 2 7.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function ShieldIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
		</svg>
	);
}

function TrashIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7h10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function formatLastLogin(dateStr) {
	if (!dateStr) return '—';
	return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Fila de una tabla de clientes/administradores. Si es la cuenta del admin
// que tiene la sesión iniciada, se muestra igual pero con "Quitar admin" y
// "Eliminar" bloqueados: nadie puede degradarse o borrarse a sí mismo desde
// aquí (el backend ya lo impide; esto lo refleja en la interfaz).
function ClientRow({ client, isSelf, isMenuOpen, onMenuToggle, onMenuClose, onRoleChange, onDelete }) {
	return (
		<tr>
			<td data-label="Nombre">
				<div className="client-name-cell">
					<Avatar name={client.name} seed={client._id} size={36} />
					<span>{client.name}{isSelf ? ' (Tú)' : ''}</span>
				</div>
			</td>
			<td data-label="Correo">{client.email}</td>
			<td data-label="Teléfono">{client.phone}</td>
			<td data-label="Reservaciones">{client.reservationCount}</td>
			<td data-label="Conexión">{formatLastLogin(client.lastLoginAt)}</td>
			<td className="actions-cell" data-label="Acciones">
				<ActionsMenu open={isMenuOpen} onToggle={onMenuToggle} onClose={onMenuClose} label={`Acciones para ${client.name}`}>
					<Link to={`/admin/clientes/${client._id}`} className="actions-menu-item" role="menuitem" onClick={onMenuClose}>
						<UserIcon />
						Ver perfil
					</Link>
					{client.role !== 'admin' ? (
						<button type="button" className="actions-menu-item" role="menuitem" onClick={() => onRoleChange(client._id, 'admin')}>
							<ShieldIcon />
							Hacer admin
						</button>
					) : (
						<button
							type="button"
							className="actions-menu-item"
							role="menuitem"
							onClick={() => onRoleChange(client._id, 'usuario')}
							disabled={isSelf}
							title={isSelf ? 'No puedes quitarte tu propio rol de administrador' : undefined}
						>
							<ShieldIcon />
							Quitar admin
						</button>
					)}
					<button
						type="button"
						className="actions-menu-item danger"
						role="menuitem"
						onClick={() => onDelete(client._id, client.name)}
						disabled={isSelf}
						title={isSelf ? 'No puedes eliminar tu propia cuenta' : undefined}
					>
						<TrashIcon />
						Eliminar
					</button>
				</ActionsMenu>
			</td>
		</tr>
	);
}

export default function Clients() {
	const { user } = useAuth();
	const [clients, setClients] = useState([]);
	const [filter, setFilter] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [confirmState, setConfirmState] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [openMenuId, setOpenMenuId] = useState(null);
	const { showToast } = useToast();

	const load = async () => {
		setLoading(true);
		setOpenMenuId(null);
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

	const searchInputRef = useRef(null);

	const handleSearch = () => {
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}
		// normalize current term to trigger a consistent filter
		setSearchTerm((t) => t.trim());
	};

	useEffect(() => {
		load();
	}, [filter, user]);

	const handleRoleChange = async (id, role) => {
		setOpenMenuId(null);
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

	const handleDelete = (id, name) => {
		setOpenMenuId(null);
		setDeleteConfirm({ id, name });
	};

	const doDelete = async () => {
		if (!deleteConfirm) return;
		try {
			await api.deleteClient(deleteConfirm.id);
			showToast('Cliente eliminado', 'success');
			setDeleteConfirm(null);
			load();
		} catch (err) {
			setError(err.message);
			showToast(err?.message || 'Error al eliminar cliente', 'error');
			setDeleteConfirm(null);
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

	// El admin que tiene la sesión iniciada siempre va primero en su tabla.
	const adminClients = filteredClients
		.filter((c) => c.role === 'admin')
		.sort((a, b) => (a._id === user?._id ? -1 : b._id === user?._id ? 1 : 0));
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
					<div>
						<div className="search-input-wrapper">
							<input
								type="search"
								className="admin-search-input"
								ref={searchInputRef}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
								aria-label="Buscar cliente"
							/>
							<button type="button" className="search-icon-btn" onClick={handleSearch} aria-label="Buscar">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</button>
						</div>
					</div>
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
												<th>Reservaciones</th>
												<th>Conexión</th>
												<th>Acciones</th>
											</tr>
										</thead>
										<tbody>
											{adminClients.map((c) => (
												<ClientRow
													key={c._id}
													client={c}
													isSelf={c._id === user?._id}
													isMenuOpen={openMenuId === c._id}
													onMenuToggle={() => setOpenMenuId((id) => (id === c._id ? null : c._id))}
													onMenuClose={() => setOpenMenuId(null)}
													onRoleChange={handleRoleChange}
													onDelete={handleDelete}
												/>
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
												<th>Reservaciones</th>
												<th>Conexión</th>
												<th>Acciones</th>
											</tr>
										</thead>
										<tbody>
											{normalClients.map((c) => (
												<ClientRow
													key={c._id}
													client={c}
													isSelf={c._id === user?._id}
													isMenuOpen={openMenuId === c._id}
													onMenuToggle={() => setOpenMenuId((id) => (id === c._id ? null : c._id))}
													onMenuClose={() => setOpenMenuId(null)}
													onRoleChange={handleRoleChange}
													onDelete={handleDelete}
												/>
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
						<ConfirmModal
							open={!!deleteConfirm}
							title="Eliminar cliente"
							message={deleteConfirm ? `¿Eliminar a ${deleteConfirm.name} y todas sus reservaciones?` : ''}
							onConfirm={doDelete}
							onCancel={() => setDeleteConfirm(null)}
							confirmLabel="Eliminar"
						/>

					</>
				)}
			</div>
		</div>
	);
}
