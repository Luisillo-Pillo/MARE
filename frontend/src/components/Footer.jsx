import { Link } from 'react-router-dom';
import { BUSINESS } from '../constants/packages';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo_mare.jpeg" alt="MARE" />
          <h3>MARE</h3>
          <p>Servicio de comida para eventos</p>
        </div>

        <div className="footer-contact">
          <h4>Contacto</h4>
          <p>{BUSINESS.address}</p>
          <p>
            <a href={`https://wa.me/52${BUSINESS.whatsapp}`} target="_blank" rel="noreferrer">
              WhatsApp: {BUSINESS.whatsapp.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
            </a>
          </p>
          <p>
            <a href={`tel:+52${BUSINESS.phone}`}>
              Tel: {BUSINESS.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
            </a>
          </p>
          <p>
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
          </p>
          <p>
            <a href={BUSINESS.facebook} target="_blank" rel="noreferrer">Facebook</a>
          </p>
        </div>

        <div className="footer-links">
          <h4>Enlaces</h4>
          <Link to="/">Inicio</Link>
          <Link to="/contacto">Contáctanos</Link>
          <Link to="/reservar">Reservar</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MARE. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
