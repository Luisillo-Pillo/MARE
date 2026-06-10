import nodemailer from 'nodemailer';

function getTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('SMTP no configurado, correo no enviado:', subject);
    return;
  }
  await transporter.sendMail({
    from: `"MARE Eventos" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
}

export function contactEmailHtml(message) {
  return `
    <h2>Nuevo mensaje de contacto - MARE</h2>
    <p><strong>Nombre:</strong> ${message.name}</p>
    <p><strong>Correo:</strong> ${message.email}</p>
    <p><strong>Teléfono:</strong> ${message.phone}</p>
    <p><strong>Asunto:</strong> ${message.subject}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${message.message.replace(/\n/g, '<br>')}</p>
  `;
}

export function reservationCreatedBusinessHtml(reservation, user) {
  return `
    <h2>Nueva reservación - MARE</h2>
    <p><strong>Cliente:</strong> ${user.name} (${user.email})</p>
    <p><strong>Teléfono:</strong> ${user.phone}</p>
    <p><strong>Servicio:</strong> ${reservation.service}</p>
    <p><strong>Tipo de evento:</strong> ${reservation.eventType}${reservation.customEventType ? ` - ${reservation.customEventType}` : ''}</p>
    <p><strong>Fecha:</strong> ${new Date(reservation.date).toLocaleDateString('es-MX')}</p>
    <p><strong>Hora:</strong> ${reservation.startTime}</p>
    <p><strong>Duración:</strong> ${reservation.duration} horas</p>
    <p><strong>Descripción:</strong> ${reservation.description}</p>
  `;
}

export function reservationStatusUserHtml(reservation, user) {
  return `
    <h2>Actualización de tu reservación - MARE</h2>
    <p>Hola ${user.name},</p>
    <p>El estatus de tu reservación ha cambiado a: <strong>${reservation.status}</strong></p>
    <p><strong>Servicio:</strong> ${reservation.service}</p>
    <p><strong>Fecha:</strong> ${new Date(reservation.date).toLocaleDateString('es-MX')}</p>
    <p><strong>Hora:</strong> ${reservation.startTime}</p>
    <p>Gracias por confiar en MARE.</p>
  `;
}
