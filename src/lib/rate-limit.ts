type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const WINDOW_MS = 60_000;

export function rateLimit(
  key: string,
  max: number,
  windowMs: number = WINDOW_MS,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true };
}

/** Периодическая очистка (best-effort) */
export function sweepExpired(now: number = Date.now()): void {
  for (const [k, v] of store) {
    if (now >= v.resetAt) store.delete(k);
  }
}

/** Сброс in-memory счётчиков (тесты, локальная отладка) */
export function clearRateLimitStore(): void {
  store.clear();
}
