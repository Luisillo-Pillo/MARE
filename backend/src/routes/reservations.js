import { Router } from 'express';
import Reservation, { STATUSES, EVENT_TYPES, PACKAGES } from '../models/Reservation.js';
import User from '../models/User.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { hasReservationConflict } from '../utils/reservationConflict.js';
import {
  sendEmail,
  reservationCreatedBusinessHtml,
  reservationStatusUserHtml,
} from '../utils/email.js';

const router = Router();
const STATUS_ORDER = ['Pendiente', 'Confirmado', 'En proceso', 'Completado', 'Cancelado'];

function validateReservationBody(body) {
  const { service, eventType, customEventType, description, date, startTime, duration } = body;
  if (!PACKAGES.includes(service)) return 'Servicio inválido';
  if (!EVENT_TYPES.includes(eventType)) return 'Tipo de evento inválido';
  if (eventType === 'Otro' && !customEventType?.trim()) return 'Especifica el tipo de evento';
  if (!description?.trim()) return 'La descripción es obligatoria';
  if (!date) return 'La fecha es obligatoria';
  if (!startTime) return 'La hora de inicio es obligatoria';
  if (!duration || duration < 0.5) return 'La duración es obligatoria';
  return null;
}

router.get('/meta', (_req, res) => {
  res.json({ statuses: STATUSES, eventTypes: EVENT_TYPES, packages: PACKAGES });
});

router.get('/mine', authRequired, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.userId }).sort({ date: -1 });
    res.json(reservations);
  } catch {
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const error = validateReservationBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const { service, eventType, customEventType, description, date, startTime, duration } = req.body;

    const conflict = await hasReservationConflict({ date, startTime, duration });
    if (conflict) {
      return res.status(409).json({
        message: 'Ese día y horario ya están ocupados. Elige otra fecha u hora.',
      });
    }

    const reservation = await Reservation.create({
      user: req.userId,
      service,
      eventType,
      customEventType: eventType === 'Otro' ? customEventType.trim() : '',
      description: description.trim(),
      date: new Date(date),
      startTime,
      duration: Number(duration),
    });

    const user = await User.findById(req.userId);
    const businessEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
    if (businessEmail) {
      await sendEmail({
        to: businessEmail,
        subject: 'Nueva reservación - MARE',
        html: reservationCreatedBusinessHtml(reservation, user),
        text: `Nueva reservación de ${user.name}`,
      });
    }

    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear reservación' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservación no encontrada' });

    const isOwner = reservation.user.toString() === req.userId;
    const isAdmin = req.userRole === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const error = validateReservationBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const { service, eventType, customEventType, description, date, startTime, duration } = req.body;

    const conflict = await hasReservationConflict({
      date,
      startTime,
      duration: Number(duration),
      excludeId: reservation._id,
    });
    if (conflict) {
      return res.status(409).json({
        message: 'Ese día y horario ya están ocupados. Elige otra fecha u hora.',
      });
    }

    reservation.service = service;
    reservation.eventType = eventType;
    reservation.customEventType = eventType === 'Otro' ? customEventType.trim() : '';
    reservation.description = description.trim();
    reservation.date = new Date(date);
    reservation.startTime = startTime;
    reservation.duration = Number(duration);

    await reservation.save();
    res.json(reservation);
  } catch {
    res.status(500).json({ message: 'Error al actualizar reservación' });
  }
});

router.patch('/:id/cancel', authRequired, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservación no encontrada' });

    const isOwner = reservation.user.toString() === req.userId;
    const isAdmin = req.userRole === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    reservation.status = 'Cancelado';
    await reservation.save();

    const user = await User.findById(reservation.user);
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: 'Reservación cancelada - MARE',
        html: reservationStatusUserHtml(reservation, user),
        text: `Tu reservación fue cancelada`,
      });
    }

    res.json(reservation);
  } catch {
    res.status(500).json({ message: 'Error al cancelar reservación' });
  }
});

router.get('/admin/all', authRequired, adminRequired, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'todas' ? { status } : {};
    const reservations = await Reservation.find(query)
      .populate('user', 'name email phone')
      .sort({ date: -1 });

    reservations.sort((a, b) => {
      const orderA = STATUS_ORDER.indexOf(a.status);
      const orderB = STATUS_ORDER.indexOf(b.status);
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.date) - new Date(a.date);
    });

    res.json(reservations);
  } catch {
    res.status(500).json({ message: 'Error al obtener reservaciones' });
  }
});

router.post('/admin', authRequired, adminRequired, async (req, res) => {
  try {
    const { userId, ...rest } = req.body;
    if (!userId) return res.status(400).json({ message: 'Usuario obligatorio' });

    const error = validateReservationBody(rest);
    if (error) return res.status(400).json({ message: error });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const conflict = await hasReservationConflict({
      date: rest.date,
      startTime: rest.startTime,
      duration: Number(rest.duration),
    });
    if (conflict) {
      return res.status(409).json({
        message: 'Ese día y horario ya están ocupados. Elige otra fecha u hora.',
      });
    }

    const reservation = await Reservation.create({
      user: userId,
      service: rest.service,
      eventType: rest.eventType,
      customEventType: rest.eventType === 'Otro' ? rest.customEventType?.trim() : '',
      description: rest.description.trim(),
      date: new Date(rest.date),
      startTime: rest.startTime,
      duration: Number(rest.duration),
    });

    const businessEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
    if (businessEmail) {
      await sendEmail({
        to: businessEmail,
        subject: 'Nueva reservación (admin) - MARE',
        html: reservationCreatedBusinessHtml(reservation, user),
        text: `Nueva reservación para ${user.name}`,
      });
    }

    res.status(201).json(reservation);
  } catch {
    res.status(500).json({ message: 'Error al crear reservación' });
  }
});

router.put('/admin/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservación no encontrada' });

    const { userId, status, ...rest } = req.body;
    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
      reservation.user = userId;
    }

    const error = validateReservationBody({ ...reservation.toObject(), ...rest });
    if (error) return res.status(400).json({ message: error });

    const conflict = await hasReservationConflict({
      date: rest.date,
      startTime: rest.startTime,
      duration: Number(rest.duration),
      excludeId: reservation._id,
    });
    if (conflict) {
      return res.status(409).json({
        message: 'Ese día y horario ya están ocupados. Elige otra fecha u hora.',
      });
    }

    const oldStatus = reservation.status;
    reservation.service = rest.service;
    reservation.eventType = rest.eventType;
    reservation.customEventType = rest.eventType === 'Otro' ? rest.customEventType?.trim() : '';
    reservation.description = rest.description.trim();
    reservation.date = new Date(rest.date);
    reservation.startTime = rest.startTime;
    reservation.duration = Number(rest.duration);
    if (status && STATUSES.includes(status)) reservation.status = status;

    await reservation.save();

    if (status && status !== oldStatus) {
      const user = await User.findById(reservation.user);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'Actualización de reservación - MARE',
          html: reservationStatusUserHtml(reservation, user),
          text: `Tu reservación ahora está: ${status}`,
        });
      }
    }

    res.json(reservation);
  } catch {
    res.status(500).json({ message: 'Error al actualizar reservación' });
  }
});

router.patch('/admin/:id/status', authRequired, adminRequired, async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Estatus inválido' });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservación no encontrada' });

    const oldStatus = reservation.status;
    reservation.status = status;
    await reservation.save();

    if (status !== oldStatus) {
      const user = await User.findById(reservation.user);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'Actualización de reservación - MARE',
          html: reservationStatusUserHtml(reservation, user),
          text: `Tu reservación ahora está: ${status}`,
        });
      }
    }

    res.json(reservation);
  } catch {
    res.status(500).json({ message: 'Error al actualizar estatus' });
  }
});

router.delete('/admin/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservación no encontrada' });
    await reservation.deleteOne();
    res.json({ message: 'Reservación eliminada' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar reservación' });
  }
});

export default router;
