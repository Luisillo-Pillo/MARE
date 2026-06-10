import Reservation from '../models/Reservation.js';

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function sameDay(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export async function hasReservationConflict({ date, startTime, duration, excludeId }) {
  const startMin = timeToMinutes(startTime);
  const endMin = startMin + duration * 60;

  const query = {
    status: { $ne: 'Cancelado' },
    date: {
      $gte: new Date(new Date(date).setUTCHours(0, 0, 0, 0)),
      $lt: new Date(new Date(date).setUTCHours(23, 59, 59, 999)),
    },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await Reservation.find(query);

  return existing.some((r) => {
    if (!sameDay(r.date, date)) return false;
    const rStart = timeToMinutes(r.startTime);
    const rEnd = rStart + r.duration * 60;
    return rangesOverlap(startMin, endMin, rStart, rEnd);
  });
}
