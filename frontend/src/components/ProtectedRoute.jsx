import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="page">
        <div className="page-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
