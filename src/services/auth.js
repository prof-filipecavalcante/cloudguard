import { students } from '../data/students.js';
import { clearSession, loadSession, saveSession } from './storage.js';

export function normalizeRegistration(value) { return String(value).replace(/\D/g, '').slice(0, 8); }
export function authenticate(value) { const registration = normalizeRegistration(value); return students.has(registration) ? { registration, name: students.get(registration) } : null; }
export function resumeSession() { const registration = loadSession(); return registration && authenticate(registration); }
export function signIn(student) { saveSession(student.registration); }
export function signOut() { clearSession(); }
