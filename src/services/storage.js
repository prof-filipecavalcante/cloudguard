const prefix = 'cloudguard';

function key(type, studentId) { return `${prefix}:${type}:${studentId}`; }
function readJson(storage, storageKey, fallback) { try { return JSON.parse(storage.getItem(storageKey) || JSON.stringify(fallback)); } catch { return fallback; } }

export function loadStudentProgress(studentId) {
  const completed = readJson(localStorage, key('completed', studentId), []);
  const storedAttempts = readJson(localStorage, key('attempts', studentId), {});
  const attempts = typeof storedAttempts === 'number' ? {} : storedAttempts;
  let deadline = Number.parseInt(localStorage.getItem(key('deadline', studentId)) || '0', 10);
  if (!Number.isFinite(deadline) || deadline <= 0) { deadline = Date.now() + 25 * 60 * 1000; localStorage.setItem(key('deadline', studentId), String(deadline)); }
  return { completed: Array.isArray(completed) ? completed.filter(Number.isInteger) : [], attempts: attempts && typeof attempts === 'object' ? attempts : {}, deadline };
}
export function saveStudentProgress(studentId, completed) { localStorage.setItem(key('completed', studentId), JSON.stringify(completed)); }
export function saveAttempts(studentId, attempts) { localStorage.setItem(key('attempts', studentId), JSON.stringify(attempts)); }
export function saveSession(studentId) { sessionStorage.setItem(`${prefix}:session`, studentId); }
export function loadSession() { return sessionStorage.getItem(`${prefix}:session`); }
export function clearSession() { sessionStorage.removeItem(`${prefix}:session`); }
