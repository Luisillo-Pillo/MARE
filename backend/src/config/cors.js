function normalizeOrigin(url) {
  if (!url) return '';
  return url.trim().replace(/\/$/, '');
}

function getAllowedOrigins() {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
  return raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
}

function isVercelOrigin(origin) {
  return /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin);
}

function isAllowedOrigin(origin, allowedOrigins) {
  const normalized = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalized)) return true;

  // En producción, permitir cualquier despliegue de Vercel
  if (process.env.NODE_ENV === 'production' && isVercelOrigin(normalized)) return true;

  // Si FRONTEND_URL apunta a Vercel, permitir subdominios *.vercel.app
  const hasVercelInConfig = allowedOrigins.some((o) => o.includes('.vercel.app'));
  if (hasVercelInConfig && isVercelOrigin(normalized)) return true;

  return false;
}

export function corsOptions() {
  const allowedOrigins = getAllowedOrigins();

  if (process.env.NODE_ENV === 'production') {
    console.log('CORS — orígenes configurados:', allowedOrigins.join(', '));
    console.log('CORS — *.vercel.app permitido en producción');
  }

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin, allowedOrigins)) return callback(null, true);

      console.warn(`CORS rechazado: ${origin}`);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}
