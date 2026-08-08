import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import { authRequired } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { isValidEmail, isValidMexicanPhone, normalizePhone, isValidPassword } from '../utils/validators.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';

const TOKEN_TTL = '30d';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

const router = Router();

function signToken(user) {
  // La sesión expira 30 días después de iniciar sesión o registrarse.
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

async function withReservationCount(user) {
  const reservationCount = await Reservation.countDocuments({ user: user._id });
  return { ...user.toJSON(), reservationCount };
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Correo electrónico inválido' });
    }
    if (!isValidMexicanPhone(phone)) {
      return res.status(400).json({ message: 'Teléfono inválido. Debe tener 10 dígitos mexicanos' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Este correo ya está registrado. Inicia sesión.' });
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'usuario';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: normalizePhone(phone),
      password,
      role,
      lastLoginAt: new Date(),
    });

    const token = signToken(user);
    res.status(201).json({ token, user: await withReservationCount(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const valid = user ? await user.comparePassword(password) : false;
    if (!user || !valid) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    res.json({ token, user: await withReservationCount(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(await withReservationCount(user));
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/change-password', authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Contraseña actual y nueva son obligatorias' });
    }
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }

    const user = await User.findById(req.userId);
    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Contraseña actualizada' });
  } catch {
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
});

router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim() || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Correo electrónico inválido' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Siempre respondemos igual, exista o no el correo, para no filtrar qué
    // correos están registrados.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173')
        .split(',')[0]
        .trim()
        .replace(/\/$/, '');
      const resetUrl = `${frontendUrl}/restablecer-password/${rawToken}`;

      sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl }).catch((err) =>
        console.error('Error al enviar correo de restablecimiento:', err.message)
      );
    }

    res.json({ message: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
});

router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !isValidPassword(newPassword)) {
      return res.status(400).json({ message: 'Solicitud inválida. La contraseña debe tener al menos 8 caracteres.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'El enlace no es válido o ya expiró. Solicita uno nuevo.' });
    }

    user.password = newPassword;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
});

export default router;
