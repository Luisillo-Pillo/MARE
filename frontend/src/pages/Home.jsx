import Carousel from '../components/Carousel';
import PackageCard from '../components/PackageCard';
import { PACKAGES } from '../constants/packages';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <Carousel />

      <section id="quienes-somos" className="about-section">
        <div className="page-content">
          <h2 className="section-title">¿Quiénes Somos?</h2>
          <div className="about-grid">
            <div className="about-text">
              <p>
                MARE es un negocio familiar el cual busca complacer y dar el mejor servicio en los eventos solicitados, superando las expectativas de sus clientes.
              </p>
              <p>
                Estamos disponibles para cualquier tipo de evento y dispuestos a dar todo de nosotros para satisfacer tus necesidades. Nos ajustamos a tu presupuesto.
              </p>
              <p>
                Contamos con todo lo necesario para realizar el evento de tus sueños.
              </p>
            </div>
            <div className="about-logo">
              <img src="/logo_mare.jpeg" alt="Logo MARE" />
            </div>
          </div>
        </div>
      </section>

      <section id="paquetes" className="packages-section">
        <div className="page-content">
          <h2 className="section-title">Nuestros Paquetes</h2>
          <div className="packages-grid">
            {PACKAGES.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          <p className="packages-note">Cotizamos tu evento acorde a tu necesidad y presupuesto</p>
        </div>
      </section>
    </div>
  );
}
