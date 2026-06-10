import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, showBack = false, alwaysHomeBack = false }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (alwaysHomeBack) {
      navigate('/');
      return;
    }
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <Navbar />
      {showBack && (
        <button className="back-btn" onClick={handleBack} aria-label="Regresar">
          ←
        </button>
      )}
      <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {children}
        <Footer />
      </main>
    </>
  );
}
