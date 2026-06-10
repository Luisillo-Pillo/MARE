import { Router } from 'express';
import ContactMessage from '../models/ContactMessage.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { isValidEmail, isValidMexicanPhone, normalizePhone } from '../utils/validators.js';
import { sendEmail, contactEmailHtml } from '../utils/email.js';

const router = Router();

router.post('/', async (req, res) => {
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
      user: req.body.userId || null,
    });

    const to = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
    if (to) {
      await sendEmail({
        to,
        subject: `Contacto MARE: ${subject}`,
        html: contactEmailHtml(contactMessage),
        text: message,
      });
    }

    res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
});

router.get('/admin', authRequired, adminRequired, async (_req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
});

router.delete('/admin/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Mensaje no encontrado' });
    await message.deleteOne();
    res.json({ message: 'Mensaje eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar mensaje' });
  }
});

export default router;
