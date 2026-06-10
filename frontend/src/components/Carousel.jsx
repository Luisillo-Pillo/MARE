import { useState, useEffect } from 'react';
import { CAROUSEL_IMAGES } from '../constants/packages';
import './Carousel.css';

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="carousel">
      {CAROUSEL_IMAGES.map((src, i) => (
        <div
          key={src}
          className={`carousel-slide ${i === current ? 'active' : ''}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="carousel-overlay">
        <h1>MARE</h1>
        <p>El mejor servicio para tus eventos</p>
      </div>
      <div className="carousel-dots">
        {CAROUSEL_IMAGES.map((_, i) => (
          <button
            key={i}
            className={i === current ? 'active' : ''}
            onClick={() => setCurrent(i)}
            aria-label={`Imagen ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
