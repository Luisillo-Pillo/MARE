import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

// Límite más permisivo para formularios públicos (contacto, reservaciones)
// que no requieren tantas restricciones como login/registro pero tampoco
// deben quedar sin protección contra spam o abuso.
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.' },
});
