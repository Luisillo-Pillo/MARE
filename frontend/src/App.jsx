import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Reservation from './pages/Reservation';
import ReservationConfirmation from './pages/ReservationConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Events from './pages/Events';
import Clients from './pages/admin/Clients';
import UserProfile from './pages/admin/UserProfile';
import AdminReservations from './pages/admin/AdminReservations';
import Messages from './pages/admin/Messages';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAuthPage = ['/iniciar-sesion', '/registro'].includes(location.pathname);
  const showBack = !isHome;
  const alwaysHomeBack = isAuthPage;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  return (
    <Layout showBack={showBack} alwaysHomeBack={alwaysHomeBack}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/reservar" element={<Reservation />} />
        <Route path="/reservacion-confirmada" element={<ReservationConfirmation />} />
        <Route path="/iniciar-sesion" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eventos"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clientes"
          element={
            <ProtectedRoute adminOnly>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clientes/:id"
          element={
            <ProtectedRoute adminOnly>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reservaciones"
          element={
            <ProtectedRoute adminOnly>
              <AdminReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mensajes"
          element={
            <ProtectedRoute adminOnly>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}
