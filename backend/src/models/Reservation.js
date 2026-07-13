import mongoose from 'mongoose';

const STATUSES = ['Pendiente', 'Confirmado', 'En proceso', 'Completado', 'Cancelado'];
const EVENT_TYPES = ['Boda', 'XV años', 'Corporativo', 'Cumpleaños', 'Bautizo', 'Otro'];
const PACKAGES = ['Paquete 1', 'Paquete 2', 'Paquete 3', 'Paquete 4'];

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: String, enum: [...PACKAGES, 'Otro'], required: true },
    customService: { type: String, trim: true, default: '' },
    eventType: { type: String, enum: EVENT_TYPES, required: true },
    customEventType: { type: String, trim: true, default: '' },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    endTime: { type: String, trim: true },
    duration: { type: Number, required: true, min: 0.5 },
    status: { type: String, enum: STATUSES, default: 'Pendiente' },
  },
  { timestamps: true }
);

reservationSchema.index({ date: 1, startTime: 1 });

export { STATUSES, EVENT_TYPES, PACKAGES };
export default mongoose.model('Reservation', reservationSchema);
