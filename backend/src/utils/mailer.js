import nodemailer from 'nodemailer';

let transporter;
let warnedMissingConfig = false;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

async function sendNotification({ subject, replyTo, text, html, logLabel }) {
  const to = process.env.CONTACT_EMAIL;
  const t = getTransporter();

  if (!t || !to) {
    if (!warnedMissingConfig) {
      console.warn(
        'Correo no enviado: configura SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y CONTACT_EMAIL en el .env para activarlo.'
      );
      warnedMissingConfig = true;
    }
    return;
  }

  try {
    await t.sendMail({
      from: `"MARE — Sitio web" <${process.env.SMTP_USER}>`,
      to,
      replyTo,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error(`Error al enviar correo de ${logLabel}:`, err.message);
  }
}

export async function sendContactNotification({ name, email, phone, subject, message }) {
  await sendNotification({
    subject: `Nuevo mensaje de contacto: ${subject}`,
    replyTo: email,
    text: `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone}\n\n${message}`,
    html: `
      <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p><strong>Correo:</strong> ${escapeHtml(email)}</p>
      <p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
    logLabel: 'contacto',
  });
}

const RESERVATION_ACTION_LABELS = {
  creada: 'Nueva solicitud de reservación',
  actualizada: 'Reservación actualizada',
  cancelada: 'Reservación cancelada',
};

export async function sendReservationNotification({ user, reservation, action = 'creada' }) {
  const serviceLabel = reservation.service === 'Otro' ? reservation.customService : reservation.service;
  const eventTypeLabel =
    reservation.eventType === 'Otro' ? reservation.customEventType : reservation.eventType;
  const dateLabel = new Date(reservation.date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const rows = [
    ['Cliente', user.name],
    ['Correo', user.email],
    ['Teléfono', user.phone],
    ['Servicio', serviceLabel],
    ['Tipo de evento', eventTypeLabel],
    ['Fecha', dateLabel],
    ['Horario', `${reservation.startTime} - ${reservation.endTime}`],
    ['Dirección', reservation.address],
    ['Descripción', reservation.description],
    ['Estatus', reservation.status],
  ];

  const actionLabel = RESERVATION_ACTION_LABELS[action] || RESERVATION_ACTION_LABELS.creada;

  await sendNotification({
    subject: `${actionLabel}: ${user.name}`,
    replyTo: user.email,
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
    html: rows.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join(''),
    logLabel: `reservación ${action}`,
  });
}
