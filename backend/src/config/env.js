const REQUIRED = ['JWT_SECRET', 'MONGODB_URI'];

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());

  if (missing.length === 0) return;

  const isProduction = process.env.NODE_ENV === 'production';
  const where = isProduction
    ? 'el panel de Render → Environment (no usa el archivo .env local)'
    : 'backend/.env';

  console.error(`\n❌ Variables de entorno faltantes: ${missing.join(', ')}`);
  console.error(`   Configúralas en ${where}:\n`);

  if (missing.includes('JWT_SECRET')) {
    console.error('   JWT_SECRET = cadena aleatoria larga (mínimo 32 caracteres)');
  }
  if (missing.includes('MONGODB_URI')) {
    console.error('   MONGODB_URI = URI de MongoDB Atlas (no uses 127.0.0.1 en producción)');
  }
  console.error('');

  process.exit(1);
}
