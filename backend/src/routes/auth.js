import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { isValidEmail, isValidMexicanPhone, normalizePhone, isValidPassword } from '../utils/validators.js';

const router = Router();
const JWT_EXPIRES = '48h';

function signToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
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
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toJSON() });
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

    const token = signToken(user);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
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

export default router;
