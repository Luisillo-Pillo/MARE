import { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../../services/api';
import ReservationForm from '../../components/ReservationForm';
import { statusClass } from '../../utils/status';
import './AdminReservations.css';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const STATUS_FILTERS = ['todas', 'Pendiente', 'Confirmado', 'En proceso', 'Completado', 'Cancelado'];

function formatDate(dateStr) {
	return new Date(dateStr).toLocaleDateString('es-MX');
}

export default function AdminReservations() {
	const [reservations, setReservations] = useState([]);
	const [clients, setClients] = useState([]);
	const [statusFilter, setStatusFilter] = useState('todas');
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showCreate, setShowCreate] = useState(false);
	const [editing, setEditing] = useState(null);
	const [createUserId, setCreateUserId] = useState('');
	const { showToast } = useToast();
	const [deleteConfirm, setDeleteConfirm] = useState(null);

	const searchInputRef = useRef(null);

	const load = async () => {
		setLoading(true);
		setError(''); // Limpiar error anterior
		try {
			const [resData, clientsData] = await Promise.all([
				api.getAdminReservations(),
				api.getClients(),
			]);
			setReservations(resData);
			setClients(clientsData);
		} catch (err) {
			setError(err?.message || 'Error al cargar los datos');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const searchedReservations = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return reservations;

		return reservations.filter((r) => {
			const values = [
				r.user?.name,
				r.user?.email,
				formatDate(r.date),
				r.eventType,
				r.customEventType,
				r.service,
				r.description,
				r.address,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return values.includes(term);
		});
	}, [reservations, searchTerm]);

	const statusCounts = useMemo(() => {
		return searchedReservations.reduce((counts, r) => {
			const key = r.status || 'Sin estado';
			counts[key] = (counts[key] || 0) + 1;
			return counts;
		}, {});
	}, [searchedReservations]);

	const filteredReservations = useMemo(() => {
		if (statusFilter === 'todas') return searchedReservations;
		return searchedReservations.filter((r) => r.status === statusFilter);
	}, [searchedReservations, statusFilter]);

	const groupedReservations = useMemo(() => {
		const groups = filteredReservations.reduce((groups, reservation) => {
			const key = reservation.status || 'Sin estado';
			groups[key] = groups[key] || [];
			groups[key].push(reservation);
			return groups;
		}, {});

		// Ordenar cada grupo por fecha descendente
		Object.keys(groups).forEach((k) => {
			groups[k].sort((a, b) => new Date(b.date) - new Date(a.date));
		});

		return groups;
	}, [filteredReservations]);

	const handleSearch = () => {
		// Solo hace focus (el filtro es reactivo)
		searchInputRef.current?.focus();
	};

	const handleStatusChange = async (id, status) => {
		try {
			await api.updateReservationStatus(id, status);
			load();
			showToast('Estado actualizado', 'success');
		} catch (err) {
			setError(err?.message || 'Error al actualizar estado');
			showToast(err?.message || 'Error al actualizar estado', 'error');
		}
	};

	const handleDelete = (id) => {
		setDeleteConfirm({ id });
	};

	const doDelete = async () => {
		if (!deleteConfirm) return;
		try {
			await api.deleteReservation(deleteConfirm.id);
			showToast('Reservación eliminada correctamente', 'success');
			setDeleteConfirm(null);
			load();
		} catch (err) {
			setError(err?.message || 'Error al eliminar reservación');
			showToast(err?.message || 'Error al eliminar reservación', 'error');
			setDeleteConfirm(null);
		}
	};

	const handleCreate = async (data) => {
		if (!createUserId) {
			showToast('Debes seleccionar un cliente', 'error');
			return;
		}
		try {
			await api.createAdminReservation({ ...data, userId: createUserId });
			showToast('Reservación creada correctamente', 'success');
			setShowCreate(false);
			setCreateUserId('');
			load();
		} catch (err) {
			setError(err?.message || 'Error al crear reservación');
			showToast(err?.message || 'Error al crear reservación', 'error');
		}
	};

	const handleEdit = async (data) => {
		try {
			await api.updateAdminReservation(editing._id, {
				...data,
				userId: editing.user?._id || editing.user,
				status: editing.status,
			});
			showToast('Reservación actualizada correctamente', 'success');
			setEditing(null);
			load();
		} catch (err) {
			setError(err?.message || 'Error al actualizar reservación');
			showToast(err?.message || 'Error al actualizar reservación', 'error');
		}
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
								<span className="filter-count">
									{s === 'todas' ? searchedReservations.length : statusCounts[s] || 0}
								</span>
							</button>
						))}
					</div>
					<button className="btn btn-primary nueva-reservacion" onClick={() => { setShowCreate(true); setEditing(null); }}>
						Nueva reservación
					</button>
					<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
						<div className="search-input-reservation-wrapper">
							<input
								type="search"
								className="admin-search-input-reservation"
								ref={searchInputRef}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleSearch();
									}
								}}
								placeholder="Buscar reservación..."
								aria-label="Buscar reservación..."
							/>
							<button
								type="button"
								className="search-icon-btn-reservation"
								onClick={handleSearch}
								aria-label="Buscar"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									<circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
						</div>
					</div>
				</div>

				{showCreate && (
					<div className="card" style={{ marginBottom: '2rem', maxWidth: 700 }}>
						<h3 style={{ marginBottom: '1rem', color: 'var(--color-brown)' }}>Crear reservación</h3>
						<div className="form-group">
							<label>Cliente</label>
							<select
								value={createUserId}
								onChange={(e) => setCreateUserId(e.target.value)}
								required
							>
								<option value="">Selecciona cliente</option>
								{clients.map((c) => (
									<option key={c._id} value={c._id}>
										{c.name} — {c.email}
									</option>
								))}
							</select>
						</div>
						<ReservationForm onSubmit={handleCreate} submitLabel="Crear reservación" />
						<button
							className="btn btn-outline"
							style={{ marginTop: '1rem' }}
							onClick={() => { setShowCreate(false); setCreateUserId(''); }}
						>
							Cancelar
						</button>
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
						<button
							className="btn btn-outline"
							style={{ marginTop: '1rem' }}
							onClick={() => setEditing(null)}
						>
							Cancelar
						</button>
					</div>
				)}

				{loading ? (
					<p>Cargando reservaciones...</p>
				) : (
					<>
						{Object.keys(groupedReservations).length === 0 ? (
							<p>No se encontraron reservaciones que coincidan con tu búsqueda.</p>
						) : (
							Object.keys(groupedReservations).map((status) => (
								<section key={status} className="admin-reservation-section">
									<h2 style={{ marginBottom: '1rem', color: 'var(--color-brown)' }}>{status}</h2>
									<div className="admin-list">
										{groupedReservations[status].map((r) => (
											<div key={r._id} className="card admin-item">
												<div className="admin-item-header">
													<span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
													<select
														value={r.status || ''}
														onChange={(e) => handleStatusChange(r._id, e.target.value)}
														className="status-select"
													>
														{STATUS_FILTERS.filter((s) => s !== 'todas').map((s) => (
															<option key={s} value={s}>{s}</option>
														))}
													</select>
												</div>
												<p><strong>Cliente:</strong> {r.user?.name} ({r.user?.email})</p>
												<p><strong>Fecha:</strong> {formatDate(r.date)}</p>
												<p><strong>Horario:</strong> {r.startTime} - {r.endTime}</p>
												<p><strong>Tipo:</strong> {r.eventType}{r.customEventType ? ` - ${r.customEventType}` : ''}</p>
												<p><strong>Servicio:</strong> {r.service}</p>
												<p><strong>Ubicación:</strong> {r.address}</p>
												<p><strong>Descripción:</strong> {r.description}</p>
												<div className="actions-cell">
													<button
														className="btn btn-secondary btn-sm"
														onClick={() => { setEditing(r); setShowCreate(false); }}
													>
														Editar
													</button>
													<button
														className="btn btn-danger btn-sm"
														onClick={() => handleDelete(r._id)}
													>
														Eliminar
													</button>
												</div>
											</div>
										))}
									</div>
								</section>
							))
						)}

						<ConfirmModal
							open={!!deleteConfirm}
							title="Eliminar reservación"
							message="¿Eliminar esta reservación? Esta acción no se puede deshacer."
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