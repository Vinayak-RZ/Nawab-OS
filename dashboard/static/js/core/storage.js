/** localStorage helpers */
export function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[storage] corrupt ${key}, resetting`, e);
    localStorage.removeItem(key);
    return fallback;
  }
}

export function registerStorage(ctx) {
  ctx.readJsonStorage = readJsonStorage;
}
