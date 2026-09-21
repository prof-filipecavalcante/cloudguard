export const SESSION_DURATION_MS = 25 * 60 * 1000;
export const remainingMs = deadline => Math.max(0, deadline - Date.now());
export const formatTime = milliseconds => `${String(Math.floor(milliseconds / 60000)).padStart(2, '0')}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')}`;
