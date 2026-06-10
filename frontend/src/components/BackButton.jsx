import { useNavigate } from 'react-router-dom';

export default function BackButton({ alwaysHome = false }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (alwaysHome) {
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
    <button className="back-btn" onClick={handleBack} aria-label="Regresar">
      ←
    </button>
  );
}
