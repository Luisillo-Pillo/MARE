import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('mare_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.me();
      setUser(data);
    } catch (err) {
      // Solo cerramos la sesión si el servidor confirma que el token ya no es válido (401).
      // Cualquier otro error (red caída, backend despertando, 500, etc.) no debe desloguear al usuario.
      if (err?.status === 401) {
        localStorage.removeItem('mare_token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    // El cliente de API dispara este evento cuando cualquier request recibe
    // 401 con un token presente (sesión expirada o revocada en el servidor).
    const handleExpired = () => setUser(null);
    window.addEventListener('mare:auth-expired', handleExpired);
    return () => window.removeEventListener('mare:auth-expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('mare_token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const data = await api.register(formData);
    localStorage.setItem('mare_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('mare_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const data = await api.me();
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
