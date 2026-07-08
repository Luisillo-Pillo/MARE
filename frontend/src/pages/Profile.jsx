import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: 600 }}>
        <h1 className="section-title">Mi Perfil</h1>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form className="card" onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo</label>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input id="phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0,10) })} required />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <input value={user?.role === 'admin' ? 'Administrador' : 'Usuario'} disabled />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Guardar cambios
          </button>
        </form>

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

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/eventos" className="btn btn-secondary">Mis Eventos</Link>
          <button className="btn btn-outline" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}
