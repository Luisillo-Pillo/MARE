import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import Avatar from '../components/Avatar';

export default function Profile() {
	const { user, logout, refreshUser } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({
		name: user?.name || '',
		email: user?.email || '',
		phone: user?.phone || '',
	});
	const [editMode, setEditMode] = useState(false);
	const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
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
		const emailChanged = form.email !== user?.email;
		if (emailChanged && !emailCurrentPassword) {
			setError('Ingresa tu contraseña actual para cambiar el correo');
			return;
		}
		setLoading(true);
		try {
			await api.updateProfile({
				...form,
				currentPassword: emailChanged ? emailCurrentPassword : undefined,
			});
			await refreshUser();
			setMessage('Perfil actualizado correctamente');
			setEditMode(false);
			setEmailCurrentPassword('');
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
		if (passwordForm.newPassword.length < 8) {
			setError('La nueva contraseña debe tener al menos 8 caracteres');
			return;
		}
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
						<div className="profile-identity">
							<Avatar name={user?.name} seed={user?._id} size={56} />
							<div>
								<h3 className="profile-name">{user?.name}</h3>
								<span className={`profile-role-badge ${isAdmin ? 'admin' : 'user'}`}>{isAdmin ? 'Administrador' : 'Usuario'}</span>
							</div>
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
							<div className="profile-row"><strong>Correo:</strong> <span>{user?.email}</span></div>
							<div className="profile-row"><strong>Teléfono:</strong> <span>{user?.phone || '-'}</span></div>
							{showUserProfileStats && (
								<div className="profile-row"><strong>Miembro desde:</strong> <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span></div>
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
							{form.email !== user?.email && (
								<div className="form-group">
									<label>Contraseña actual (requerida para cambiar el correo)</label>
									<PasswordInput
										value={emailCurrentPassword}
										onChange={(e) => setEmailCurrentPassword(e.target.value)}
										required
										autoComplete="current-password"
									/>
								</div>
							)}
							<div className="form-group">
								<label>Teléfono</label>
								<input inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
							</div>
							<div className="edit-actions">
								<button type="submit" className="btn btn-primary" disabled={loading || JSON.stringify(form) === JSON.stringify(originalRef.current)}>Guardar</button>
								<button type="button" className="btn btn-outline" onClick={() => { setForm({ ...originalRef.current }); setEmailCurrentPassword(''); setEditMode(false); }}>Cancelar</button>
							</div>
						</form>
					)}
				</div>

				{showUserProfileStats && !editMode && (
					<div className="profile-stats">
						<div className="stat-tile">
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
								<rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
								<path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
								<path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
								<path d="M8.5 13.5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							<div>
								<span className="stat-value">{totalEvents}</span>
								<span className="stat-label">{totalEvents === 1 ? 'Evento reservado' : 'Eventos reservados'}</span>
							</div>
						</div>
					</div>
				)}

				{showUserProfileStats && !editMode && (
					<div className="card profile-cta">
						<div className="profile-cta-icon" aria-hidden="true">
							<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M7 3v7a2 2 0 0 0 2 2v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M7 3v7M11 3v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M17 3c-1.5 2-2 4-2 6s.7 3 2 3v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<div className="profile-cta-text">
							<h3>¿Ya tienes tu próximo evento en mente?</h3>
							<p>Nosotros nos encargamos de la comida: desde taquizas hasta banquetes completos.</p>
						</div>
						<button className="btn btn-primary" onClick={() => navigate('/reservar')}>Reservar ahora</button>
					</div>
				)}

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
								<PasswordInput
									value={passwordForm.currentPassword}
									onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
									required
									autoComplete="current-password"
								/>
							</div>
							<div className="form-group">
								<label>Nueva contraseña (mínimo 8 caracteres)</label>
								<PasswordInput
									value={passwordForm.newPassword}
									onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
									minLength={8}
									required
									autoComplete="new-password"
								/>
							</div>
							<div className="form-group">
								<label>Confirmar nueva contraseña</label>
								<PasswordInput
									value={passwordForm.confirmPassword}
									onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
									required
									autoComplete="new-password"
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
