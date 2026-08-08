import { useState } from 'react';
import { api } from '../services/api';
import { BUSINESS } from '../constants/packages';
import Map from '../components/Map';
import { useAuth } from '../context/AuthContext';
import './Contact.css';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({ ...prev, phone: onlyDigits }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = user
        ? { name: user.name, email: user.email, phone: user.phone || '', subject: form.subject, message: form.message }
        : { ...form };
      await api.sendContact(payload);
      showToast('Mensaje enviado correctamente', 'success');
      setSuccess('¡Mensaje enviado! Nos pondremos en contacto contigo pronto.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
      showToast(err.message || 'Error al enviar mensaje', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-content">
        <h1 className="section-title">Contáctanos</h1>

        <div className="contact-grid">
          <div className="contact-info card">
            <h3>Información de contacto</h3>
            <p><strong>Dirección:</strong> {BUSINESS.address}</p>
            <p>
              <strong>WhatsApp:</strong>{' '}
              <a href={`https://wa.me/52${BUSINESS.whatsapp}`} target="_blank" rel="noreferrer">
                {BUSINESS.whatsapp.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
              </a>
            </p>
            <p>
              <strong>Teléfono:</strong>{' '}
              <a href={`tel:+52${BUSINESS.phone}`}>
                {BUSINESS.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
              </a>
            </p>
            <p>
              <strong>Correo:</strong>{' '}
              <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
            </p>
            <p>
              <strong>Facebook:</strong>{' '}
              <a href={BUSINESS.facebook} target="_blank" rel="noreferrer">Visitar página</a>
            </p>
            <div className="contact-map">
              <Map />
            </div>
          </div>

          <form className="card contact-form" onSubmit={handleSubmit}>
            <h3>Envíanos un mensaje</h3>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {!user && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Correo</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input id="phone" name="phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={handleChange} required />
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="subject">Asunto</label>
              <input id="subject" name="subject" value={form.subject} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" name="message" value={form.message} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
