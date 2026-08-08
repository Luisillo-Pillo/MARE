import { Router } from 'express';
import ContactMessage from '../models/ContactMessage.js';
import { authRequired, adminRequired, optionalAuth } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { isValidEmail, isValidMexicanPhone, normalizePhone } from '../utils/validators.js';
import { sendContactNotification } from '../utils/mailer.js';

const router = Router();

router.post('/', publicFormLimiter, optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Correo electrónico inválido' });
    }
    if (!isValidMexicanPhone(phone)) {
      return res.status(400).json({ message: 'Teléfono inválido. Debe tener 10 dígitos mexicanos' });
    }

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: normalizePhone(phone),
      subject: subject.trim(),
      message: message.trim(),
      user: req.userId || null,
    });

    res.status(201).json({ message: 'Mensaje enviado correctamente' });

    sendContactNotification({
      name: contactMessage.name,
      email: contactMessage.email,
      phone: contactMessage.phone,
      subject: contactMessage.subject,
      message: contactMessage.message,
    }).catch((err) => console.error('Error al notificar mensaje de contacto:', err.message));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
});

router.get('/admin', authRequired, adminRequired, async (_req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
});

router.delete('/admin/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Mensaje no encontrado' });
    await message.deleteOne();
    res.json({ message: 'Mensaje eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar mensaje' });
  }
});

export default router;
