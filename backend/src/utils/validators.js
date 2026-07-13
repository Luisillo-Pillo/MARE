export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidMexicanPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

export function normalizePhone(phone) {
  return phone.replace(/\D/g, '').slice(-10);
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}
