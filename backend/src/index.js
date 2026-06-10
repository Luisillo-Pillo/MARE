import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { corsOptions } from './config/cors.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import reservationRoutes from './routes/reservations.js';
import contactRoutes from './routes/contact.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET?.trim()) {
  console.error('❌ JWT_SECRET no está configurado en backend/.env');
  process.exit(1);
}

if (process.env.SMTP_PASS?.includes('contraseña_de_aplicacion')) {
  console.warn('⚠️  SMTP_PASS sigue con el valor de ejemplo. Los correos no se enviarán hasta configurarlo.');
}

app.use(cors(corsOptions()));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MARE API',
    frontendUrl: process.env.FRONTEND_URL ? 'configurado' : 'no configurado',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Servidor MARE en puerto ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ El puerto ${PORT} ya está en uso.`);
      console.error('Cierra la otra instancia del backend o cambia PORT en backend/.env\n');
      process.exit(1);
    }
    throw err;
  });
}

connectDB()
  .then(startServer)
  .catch((err) => {
    console.error('\n❌ Error al conectar MongoDB:\n');
    console.error(err.message || err);
    console.error('');
    process.exit(1);
  });
