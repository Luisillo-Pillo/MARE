const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('mare_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || 'Error en la solicitud');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  changePassword: (body) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
  updateProfile: (body) => request('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),

  sendContact: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
  getMessages: () => request('/contact/admin'),
  deleteMessage: (id) => request(`/contact/admin/${id}`, { method: 'DELETE' }),

  getMeta: () => request('/reservations/meta'),
  getMyReservations: () => request('/reservations/mine'),
  createReservation: (body) => request('/reservations', { method: 'POST', body: JSON.stringify(body) }),
  updateReservation: (id, body) => request(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  cancelReservation: (id) => request(`/reservations/${id}/cancel`, { method: 'PATCH' }),

  getAdminReservations: (status) =>
    request(`/reservations/admin/all${status ? `?status=${status}` : ''}`),
  createAdminReservation: (body) =>
    request('/reservations/admin', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminReservation: (id, body) =>
    request(`/reservations/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateReservationStatus: (id, status) =>
    request(`/reservations/admin/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteReservation: (id) => request(`/reservations/admin/${id}`, { method: 'DELETE' }),

  getClients: (filter) => request(`/users/admin/clients${filter ? `?filter=${filter}` : ''}`),
  getClientProfile: (id) => request(`/users/admin/clients/${id}`),
  updateClientRole: (id, role) =>
    request(`/users/admin/clients/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteClient: (id) => request(`/users/admin/clients/${id}`, { method: 'DELETE' }),
};
