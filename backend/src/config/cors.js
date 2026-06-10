function getAllowedOrigins() {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
  return raw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
}

export function corsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      // Peticiones sin origin (Postman, health checks, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  };
}
