import mongoose from 'mongoose';

const PLACEHOLDER_URIS = [
  'mongodb+srv://usuario:contraseña@cluster.mongodb.net',
  'mongodb+srv://usuario:password@cluster.mongodb.net',
  'mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster0.xxxxx.mongodb.net',
];

function validateMongoUri(uri) {
  if (!uri?.trim()) {
    throw new Error(
      'MONGODB_URI no está configurada en backend/.env.\n' +
        'Usa MongoDB local: mongodb://127.0.0.1:27017/mare\n' +
        'O tu URI de MongoDB Atlas.'
    );
  }

  if (PLACEHOLDER_URIS.some((placeholder) => uri.includes(placeholder))) {
    throw new Error(
      'MONGODB_URI sigue con el valor de ejemplo en backend/.env.\n' +
        'Configura tu URI real de MongoDB Atlas o usa: mongodb://127.0.0.1:27017/mare'
    );
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  validateMongoUri(uri);

  try {
    await mongoose.connect(uri);
    console.log('MongoDB conectado');
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');
      throw new Error(
        isLocal
          ? 'No se pudo conectar a MongoDB local.\n' +
              'Asegúrate de que el servicio MongoDB esté corriendo en tu PC.\n' +
              'En Windows: abre "Servicios" y verifica que "MongoDB Server" esté iniciado.'
          : 'No se pudo conectar a MongoDB. Verifica la URI, usuario, contraseña y Network Access en Atlas.\n' +
              `Detalle: ${err.message}`
      );
    }
    if (err.syscall === 'querySrv') {
      throw new Error(
        'No se pudo resolver el host de MongoDB Atlas.\n' +
          'Verifica la URI en backend/.env y que tu IP esté permitida en Network Access.\n' +
          `Detalle: ${err.message}`
      );
    }
    throw err;
  }
}
