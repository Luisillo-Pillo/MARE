import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotRegistered(false);
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      if (err.data?.notRegistered) {
        setNotRegistered(true);
        setError('Este correo no está registrado.');
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
          <h1>Iniciar sesión</h1>
          {error && <div className="alert alert-error">{error}</div>}
          {notRegistered && (
            <p className="auth-link">
              ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
          )}
          <form onSubmit={handleSubmit}>
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
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
          <p className="auth-link">
            ¿No tienes cuenta? <Link to="/registro">Registrarse</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
