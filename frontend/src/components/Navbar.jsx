import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img src="/logo_mare.jpeg" alt="MARE" className="navbar-logo" />
          <span>MARE</span>
        </Link>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={closeMenu}>Inicio</Link>
          {isAdmin ? (
            <>
              <Link to="/admin/mensajes" onClick={closeMenu}>Mensajes</Link>
              <Link to="/admin/clientes" onClick={closeMenu}>Clientes</Link>
              <Link to="/admin/reservaciones" onClick={closeMenu}>Reservaciones</Link>
            </>
          ) : (
            <>
              <Link to="/contacto" onClick={closeMenu}>Contáctanos</Link>
              <Link to="/reservar" onClick={closeMenu}>Reserva</Link>
            </>
          )}

          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.name} ▾
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <Link to="/perfil" onClick={() => { setDropdownOpen(false); closeMenu(); }}>Perfil</Link>
                  {!isAdmin && (
                    <Link to="/eventos" onClick={() => { setDropdownOpen(false); closeMenu(); }}>Reservaciones</Link>
                  )}
                  <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/iniciar-sesion" className="btn btn-primary btn-sm" onClick={closeMenu}>
              Iniciar sesión / Registrarse
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
