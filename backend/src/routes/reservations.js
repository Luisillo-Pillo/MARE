import { Router } from 'express';
import Reservation, { STATUSES, EVENT_TYPES, PACKAGES } from '../models/Reservation.js';
import User from '../models/User.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { hasReservationConflict } from '../utils/reservationConflict.js';
import { sendReservationNotification } from '../utils/mailer.js';

const router = Router();
const DURATION_HOURS = 2;

function computeEndTime(startTime, durationHours) {
  // startTime expected as 'HH:MM'
  if (!startTime) return '';
  const [hh, mm] = startTime.split(':').map((v) => parseInt(v, 10));
  if (isNaN(hh) || isNaN(mm)) return '';
  const date = new Date();
  date.setHours(hh);
  date.setMinutes(mm);
  date.setSeconds(0);
  date.setMilliseconds(0);
  date.setHours(date.getHours() + Number(durationHours || 0));
  const endH = String(date.getHours()).padStart(2, '0');
  const endM = String(date.getMinutes()).padStart(2, '0');
  return `${endH}:${endM}`;
}

function validateReservationBody(body) {
  const { service, customService, eventType, customEventType, description, date, startTime, address } = body;
  if (!PACKAGES.includes(service) && service !== 'Otro') return 'Servicio inválido';
  if (service === 'Otro' && !customService?.trim()) return 'Especifica el servicio';
  if (!EVENT_TYPES.includes(eventType)) return 'Tipo de evento inválido';
  if (eventType === 'Otro' && !customEventType?.trim()) return 'Especifica el tipo de evento';
  if (!description?.trim()) return 'La descripción es obligatoria';
  if (!date) return 'La fecha es obligatoria';
  if (!startTime) return 'La hora de inicio es obligatoria';
  if (!address?.trim()) return 'La dirección es obligatoria';
  return null;
}

router.get('/meta', (_req, res) => {
  res.json({ statuses: STATUSES, eventTypes: EVENT_TYPES, packages: PACKAGES });
});

router.get('/mine', authRequired, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.userId }).sort({ date: -1 });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const error = validateReservationBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const { service, customService, eventType, customEventType, description, date, startTime, address } = req.body;

    const conflict = await hasReservationConflict({ date, startTime, duration: DURATION_HOURS });
    if (conflict) {
      return res.status(409).json({
        message: 'Ese día y horario ya están ocupados. Elige otra fecha u hora disponible o contáctanos para asistencia.',
      });
    }

    const reservation = await Reservation.create({
      user: req.userId,
      service,
      customService: service === 'Otro' ? customService.trim() : '',
      eventType,
      customEventType: eventType === 'Otro' ? customEventType.trim() : '',
      description: description.trim(),
      date: new Date(date),
      startTime,
      duration: DURATION_HOURS,
      endTime: computeEndTime(startTime, DURATION_HOURS),
      address: address.trim(),
    });

    res.status(201).json(reservation);

    User.findById(req.userId)
      .then((user) => user && sendReservationNotification({ user, reservation }))
      .catch((err) => console.error('Error al notificar reservación creada:', err.message));
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

    const { service, customService, eventType, customEventType, description, date, startTime, address } = req.body;

    const conflict = await hasReservationConflict({
      date,
      startTime,
      duration: DURATION_HOURS,
      excludeId: reservation._id,
    });
    if (conflict) {
      return res.status(409).json({
        message: 'Ese día y horario ya están ocupados. Elige otra fecha u hora disponible o contáctanos para asistencia.',
      });
    }

    reservation.service = service;
    reservation.customService = service === 'Otro' ? customService.trim() : '';
    reservation.eventType = eventType;
    reservation.customEventType = eventType === 'Otro' ? customEventType.trim() : '';
    reservation.description = description.trim();
    reservation.date = new Date(date);
    reservation.startTime = startTime;
    reservation.endTime = computeEndTime(startTime, DURATION_HOURS);
    reservation.duration = DURATION_HOURS;
    reservation.address = address.trim();

    await reservation.save();

    res.json(reservation);

    User.findById(reservation.user)
      .then((owner) => owner && sendReservationNotification({ user: owner, reservation, action: 'actualizada' }))
      .catch((err) => console.error('Error al notificar reservación actualizada:', err.message));
  } catch (err) {
    console.error(err);
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

    res.json(reservation);

    User.findById(reservation.user)
      .then((owner) => owner && sendReservationNotification({ user: owner, reservation, action: 'cancelada' }))
      .catch((err) => console.error('Error al notificar reservación cancelada:', err.message));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al cancelar reservación' });
  }
});

router.get('/admin/all', authRequired, adminRequired, async (req, res) => {
  try {
    const { status } = req.query;
    const query = typeof status === 'string' && STATUSES.includes(status) ? { status } : {};
    const reservations = await Reservation.find(query)
      .populate('user', 'name email phone')
      .sort({ date: -1 });

    reservations.sort((a, b) => {
      const orderA = STATUSES.indexOf(a.status);
      const orderB = STATUSES.indexOf(b.status);
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.date) - new Date(a.date);
    });

    res.json(reservations);
  } catch (err) {
    console.error(err);
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
      duration: DURATION_HOURS,
    });
    if (conflict) {
      return res.status(409).json({
        message: 'Ese día y horario ya están ocupados. Elige otra fecha u hora disponible o contáctanos para asistencia.',
      });
    }

    const reservation = await Reservation.create({
      user: userId,
      service: rest.service,
      customService: rest.service === 'Otro' ? rest.customService?.trim() : '',
      eventType: rest.eventType,
      customEventType: rest.eventType === 'Otro' ? rest.customEventType?.trim() : '',
      description: rest.description.trim(),
      date: new Date(rest.date),
      startTime: rest.startTime,
      duration: DURATION_HOURS,
      endTime: computeEndTime(rest.startTime, DURATION_HOURS),
      address: rest.address?.trim(),
    });

    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
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

    const merged = { ...reservation.toObject(), ...rest };
    const error = validateReservationBody(merged);
    if (error) return res.status(400).json({ message: error });

    const conflict = await hasReservationConflict({
      date: merged.date,
      startTime: merged.startTime,
      duration: DURATION_HOURS,
      excludeId: reservation._id,
    });
    if (conflict) {
      return res.status(409).json({
        message: 'Ese día y horario ya están ocupados. Elige otra fecha u hora.',
      });
    }

    reservation.service = merged.service;
    reservation.customService = merged.service === 'Otro' ? merged.customService?.trim() : '';
    reservation.eventType = merged.eventType;
    reservation.customEventType = merged.eventType === 'Otro' ? merged.customEventType?.trim() : '';
    reservation.description = merged.description.trim();
    reservation.date = new Date(merged.date);
    reservation.startTime = merged.startTime;
    reservation.endTime = computeEndTime(merged.startTime, DURATION_HOURS);
    reservation.duration = DURATION_HOURS;
    reservation.address = merged.address?.trim();
    if (status && STATUSES.includes(status)) reservation.status = status;

    await reservation.save();

    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar reservación' });
  }
});

router.patch('/admin/:id/status', authRequired, adminRequired, async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Estatus inválido' });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!reservation) return res.status(404).json({ message: 'Reservación no encontrada' });
    res.json(reservation);
  } catch (err) {
    console.error('Error updating reservation status:', err);
    res.status(500).json({ message: 'Error al actualizar estatus' });
  }
});

router.delete('/admin/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservación no encontrada' });
    await reservation.deleteOne();
    res.json({ message: 'Reservación eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar reservación' });
  }
});

export default router;
