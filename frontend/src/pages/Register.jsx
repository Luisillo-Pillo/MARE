import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import './Register.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
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
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
              <PasswordInput
                id="password"
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
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
