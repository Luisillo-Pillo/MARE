import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

function SunIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

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
