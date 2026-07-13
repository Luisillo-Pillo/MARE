import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExists(false);
    setLoading(true);
    // Validate phone digits and length
    const digits = (form.phone || '').replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos.');
      setLoading(false);
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }
    if (form.password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      if (err.status === 409) {
        setExists(true);
        setError('Este correo ya está registrado.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-content auth-page">
        <div className="card auth-card">
          <h1>Registrarse</h1>
          {error && <div className="alert alert-error">{error}</div>}
          {exists && (
            <p className="auth-link">
              ¿Ya tienes cuenta? <Link to="/iniciar-sesion">Inicia sesión aquí</Link>
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono (10 dígitos)</label>
              <input
                id="phone"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm({ ...form, phone: onlyDigits });
                }}
                required
                placeholder="4491234567"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10.58 10.58A3 3 0 0 0 13.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.86 12.12C4.71 7.78 8.7 5 12 5c2.03 0 3.9.79 5.46 2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14.54 14.54C13.4 15.68 11.8 16.2 10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10.58 10.58A3 3 0 0 0 13.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.86 12.12C4.71 7.78 8.7 5 12 5c2.03 0 3.9.79 5.46 2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14.54 14.54C13.4 15.68 11.8 16.2 10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
          <p className="auth-link">
            ¿Ya tienes cuenta? <Link to="/iniciar-sesion">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
