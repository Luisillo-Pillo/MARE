import { useState } from 'react';
import { EVENT_TYPES, PACKAGES, TIME_OPTIONS } from '../constants/packages';
import './ReservationForm.css';

function toFormState(initial = {}, defaultService = '') {
  const init = initial || {};
  const date = init.date ? new Date(init.date).toISOString().split('T')[0] : '';
  return {
    service: init.service || defaultService || '',
    customService: init.service === 'Otro' ? (init.customService || '') : init.customService || '',
    eventType: init.eventType || '',
    customEventType: init.customEventType || '',
    description: init.description || '',
    address: init.address || '',
    date,
    startTime: init.startTime || '',
    endTime: init.endTime || '',
    duration: String(init.duration || '2'),
  };
}

export default function ReservationForm({
  defaultService = '',
  initialData = null,
  onSubmit,
  submitLabel = 'Enviar solicitud',
  loading = false,
}) {
  const [form, setForm] = useState(() => toFormState(initialData, defaultService));
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({
        ...form,
        service: form.service === 'Otro' ? form.customService : form.service,
        duration: 2,
        address: form.address?.trim(),
        customEventType: form.eventType === 'Otro' ? form.customEventType : '',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="service">Servicio solicitado</label>
        <select id="service" name="service" value={form.service} onChange={handleChange} required>
          <option value="">Selecciona un paquete o elige otro servicio</option>
          {PACKAGES.map((p) => (
            <option key={p.id} value={p.id}>{p.id}</option>
          ))}
          <option value="Otro">Otro servicio personalizado</option>
        </select>
      </div>

      {form.service === 'Otro' && (
        <div className="form-group">
          <label htmlFor="customService">Describe el servicio</label>
          <input
            id="customService"
            name="customService"
            value={form.customService}
            onChange={handleChange}
            required
            placeholder="Ej. Taquizas de pastor para 100 personas"
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="eventType">Tipo de evento</label>
        <select id="eventType" name="eventType" value={form.eventType} onChange={handleChange} required>
          <option value="">Selecciona el tipo</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {form.eventType === 'Otro' && (
        <div className="form-group">
          <label htmlFor="customEventType">Especifica el tipo de evento</label>
          <input
            id="customEventType"
            name="customEventType"
            value={form.customEventType}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="description">Descripción del evento</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          placeholder="Cuéntanos sobre tu evento..."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Fecha</label>
          <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="startTime">Hora de inicio</label>
          <select id="startTime" name="startTime" value={form.startTime} onChange={handleChange} required>
            <option value="">Selecciona hora</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="address">Dirección</label>
          <input id="address" name="address" value={form.address} onChange={handleChange} required placeholder="Calle, número, colonia, ciudad" />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Enviando...' : submitLabel}
      </button>
    </form>
  );
}
