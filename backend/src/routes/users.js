import { Router } from 'express';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import ContactMessage from '../models/ContactMessage.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { isValidEmail, isValidMexicanPhone, normalizePhone } from '../utils/validators.js';

const router = Router();

router.put('/profile', authRequired, async (req, res) => {
  try {
    const { name, email, phone, currentPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (name?.trim()) user.name = name.trim();
    if (phone) {
      if (!isValidMexicanPhone(phone)) {
        return res.status(400).json({ message: 'Teléfono inválido. Debe tener 10 dígitos mexicanos' });
      }
      user.phone = normalizePhone(phone);
    }
    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Correo electrónico inválido' });
      }
      if (!currentPassword) {
        return res.status(400).json({ message: 'Ingresa tu contraseña actual para cambiar el correo' });
      }
      const validPassword = await user.comparePassword(currentPassword);
      if (!validPassword) {
        return res.status(401).json({ message: 'Contraseña actual incorrecta' });
      }
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(409).json({ message: 'Este correo ya está en uso' });
      }
      user.email = email.toLowerCase().trim();
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
});

router.get('/admin/clients', authRequired, adminRequired, async (req, res) => {
  try {
    const { filter } = req.query;
    const users = await User.find().sort({ createdAt: -1 });
    const usersWithReservations = await Promise.all(
      users.map(async (u) => {
        const count = await Reservation.countDocuments({ user: u._id });
        return { ...u.toJSON(), reservationCount: count, hasReservations: count > 0 };
      })
    );

    let result = usersWithReservations;
    if (filter === 'with') result = result.filter((u) => u.hasReservations);
    if (filter === 'without') result = result.filter((u) => !u.hasReservations);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
});

router.get('/admin/clients/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const reservations = await Reservation.find({ user: user._id }).sort({ date: -1 });
    res.json({ user, reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
});

router.put('/admin/clients/:id/role', authRequired, adminRequired, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['usuario', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.role === 'admin' && role !== 'admin') {
      if (user._id.equals(req.user._id)) {
        return res.status(400).json({ message: 'No puedes quitarte tu propio rol de administrador' });
      }
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Debe existir al menos un administrador' });
      }
    }

    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
});

router.delete('/admin/clients/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Debe existir al menos un administrador' });
      }
    }

    await Reservation.deleteMany({ user: user._id });
    await ContactMessage.updateMany({ user: user._id }, { user: null });
    await user.deleteOne();
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
});

export default router;
