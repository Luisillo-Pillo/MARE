import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await api.forgotPassword(email);
      setSuccess(data.message || 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-content auth-page">
        <div className="card auth-card">
          <h1>¿Olvidaste tu contraseña?</h1>
          {error && <div className="alert alert-error">{error}</div>}
          {success ? (
            <>
              <div className="alert alert-success">{success}</div>
              <p className="auth-link">
                <Link to="/iniciar-sesion">Volver a iniciar sesión</Link>
              </p>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '1rem', color: 'var(--color-text-light, #666)' }}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Correo</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
              <p className="auth-link">
                <Link to="/iniciar-sesion">Volver a iniciar sesión</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
