import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Profile() {
	const { user, logout, refreshUser } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({
		name: user?.name || '',
		email: user?.email || '',
		phone: user?.phone || '',
	});
	const [editMode, setEditMode] = useState(false);
	const originalRef = useRef(form);

	useEffect(() => {
		setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
		originalRef.current = { name: user?.name || '', email: user?.email || '', phone: user?.phone || '' };
	}, [user]);
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleProfileSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setMessage('');
		setLoading(true);
		try {
			await api.updateProfile(form);
			await refreshUser();
			setMessage('Perfil actualizado correctamente');
			setEditMode(false);
			originalRef.current = { ...form };
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setMessage('');
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setError('Las contraseñas no coinciden');
			return;
		}
		setLoading(true);
		try {
			await api.changePassword({
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword,
			});
			setMessage('Contraseña actualizada');
			setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
			setShowPasswordForm(false);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	const isAdmin = user?.role === 'admin';
	const totalEvents = user?.reservations?.length ?? user?.reservationCount ?? 0;
	const showUserProfileStats = !isAdmin;

	return (
		<div className="page">
			<div className="page-content" style={{ maxWidth: 600 }}>
				<h1 className="section-title">Mi Perfil</h1>
				{error && <div className="alert alert-error">{error}</div>}
				{message && <div className="alert alert-success">{message}</div>}

				<div className="card profile-card">
					<div className="profile-header">
						<div>
							<h3 className="profile-name">{user?.name}
								<span className={`profile-role-badge ${isAdmin ? 'admin' : 'user'}`}>{isAdmin ? 'Administrador' : 'Usuario'}</span>
							</h3>
						</div>
						{!editMode ? (
							<button className="icon-btn edit-toggle" title="Editar perfil" onClick={() => setEditMode(true)} aria-label="Editar perfil">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M3 21h3l11-11-3-3L3 18v3z" stroke="none" fill="#fff" />
									<path d="M14.5 6.5l3 3" stroke="none" fill="#fff" />
								</svg>
							</button>
						) : null}
					</div>

					{!editMode ? (
						<div className="profile-view">
							{/* <div className="profile-row"><strong>Nombre:</strong> <span>{user?.name}</span></div> */}
							<div className="profile-row"><strong>Correo:</strong> <span>{user?.email}</span></div>
							<div className="profile-row"><strong>Teléfono:</strong> <span>{user?.phone || '-'}</span></div>
							{showUserProfileStats && (
								<>
									<div className="profile-row"><strong>Eventos:</strong> <span>{totalEvents}</span></div>
									<div className="profile-row"><strong>Miembro desde:</strong> <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span></div>
								</>
							)}
						</div>
					) : (
						<form onSubmit={handleProfileSubmit} className="profile-edit">
							<div className="form-group">
								<label>Nombre</label>
								<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
							</div>
							<div className="form-group">
								<label>Correo</label>
								<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
							</div>
							<div className="form-group">
								<label>Teléfono</label>
								<input inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
							</div>
							<div className="edit-actions">
								<button type="submit" className="btn btn-primary" disabled={loading || JSON.stringify(form) === JSON.stringify(originalRef.current)}>Guardar</button>
								<button type="button" className="btn btn-outline" onClick={() => { setForm({ ...originalRef.current }); setEditMode(false); }}>Cancelar</button>
							</div>
						</form>
					)}
				</div>

				{editMode && (
					<div className="card" style={{ marginTop: '1.5rem' }}>
						{!showPasswordForm ? (
							<button className="btn btn-outline" onClick={() => setShowPasswordForm(true)}>
								Cambiar contraseña
							</button>
						) : (
						<form onSubmit={handlePasswordSubmit}>
							<h3 style={{ marginBottom: '1rem', color: 'var(--color-brown)' }}>Cambiar contraseña</h3>
							<div className="form-group">
								<label>Contraseña actual</label>
								<input
									type="password"
									value={passwordForm.currentPassword}
									onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
									required
								/>
							</div>
							<div className="form-group">
								<label>Nueva contraseña</label>
								<input
									type="password"
									value={passwordForm.newPassword}
									onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
									required
								/>
							</div>
							<div className="form-group">
								<label>Confirmar nueva contraseña</label>
								<input
									type="password"
									value={passwordForm.confirmPassword}
									onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
									required
								/>
							</div>
							<div style={{ display: 'flex', gap: '0.75rem' }}>
								<button type="submit" className="btn btn-primary" disabled={loading}>Actualizar</button>
								<button type="button" className="btn btn-outline" onClick={() => setShowPasswordForm(false)}>Cancelar</button>
							</div>
						</form>
					)}
				</div>
				)}

				<div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
					{user?.role !== 'admin' && (
						<button className="btn btn-secondary" onClick={() => navigate('/eventos')}>Mis Eventos</button>
					)}
					<button className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
				</div>
			</div>
		</div>
	);
}
