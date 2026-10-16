import { STATUSES } from '../models/Application.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 72; // bcrypt ignores bytes past 72

// Requires real strings so objects like { "$gt": "" } never reach a query.
const isString = (v) => typeof v === 'string';

export function validateRegister({ name, email, password } = {}) {
  if (!isString(name) || !name.trim()) return 'Name is required';
  if (!isString(email) || !EMAIL_RE.test(email.trim())) return 'A valid email is required';
  if (!isString(password) || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters`;
  }
  return null;
}

export function validateLogin({ email, password } = {}) {
  if (!isString(email) || !email.trim() || !isString(password) || !password) {
    return 'Email and password are required';
  }
  return null;
}

// ---- Applications ----

const APPLICATION_FIELDS = [
  'company', 'role', 'status', 'dateApplied', 'jobLink', 'salary', 'location', 'notes',
];
const OPTIONAL_TEXT = ['jobLink', 'salary', 'location', 'notes'];

export const isValidId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

// Copies only whitelisted fields, so `user` or `_id` sent by the client are ignored.
export function pickApplicationFields(body = {}) {
  const data = {};
  for (const key of APPLICATION_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

// partial = true for PATCH: only the fields present are checked.
export function validateApplication(data, { partial = false } = {}) {
  for (const key of ['company', 'role']) {
    if (partial && data[key] === undefined) continue;
    if (!isString(data[key]) || !data[key].trim()) {
      return `${key[0].toUpperCase()}${key.slice(1)} is required`;
    }
  }

  if (data.status !== undefined && !STATUSES.includes(data.status)) {
    return `Status must be one of: ${STATUSES.join(', ')}`;
  }

  if (data.dateApplied !== undefined) {
    const ok =
      (isString(data.dateApplied) || typeof data.dateApplied === 'number') &&
      !Number.isNaN(new Date(data.dateApplied).getTime());
    if (!ok) return 'Date applied must be a valid date';
  }

  for (const key of OPTIONAL_TEXT) {
    if (data[key] !== undefined && !isString(data[key])) return `${key} must be a string`;
  }

  if (data.jobLink && !/^https?:\/\/\S+$/i.test(data.jobLink.trim())) {
    return 'Job link must start with http:// or https://';
  }

  return null;
}
