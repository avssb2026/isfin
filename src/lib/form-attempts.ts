/** Учёт попыток отправки форм с одного IP (окно 1 мин) для условной CAPTCHA */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();
const WINDOW_MS = 60_000;

export type FormAttemptKind = "lead" | "chat_pre" | "chat_msg";

function key(kind: FormAttemptKind, ip: string): string {
  return `${kind}:${ip}`;
}

export function getFormAttempts(kind: FormAttemptKind, ip: string): number {
  const k = key(kind, ip);
  const entry = store.get(k);
  const now = Date.now();
  if (!entry || now >= entry.resetAt) return 0;
  return entry.count;
}

export function incrementFormAttempts(kind: FormAttemptKind, ip: string): void {
  const k = key(kind, ip);
  const now = Date.now();
  const entry = store.get(k);
  if (!entry || now >= entry.resetAt) {
    store.set(k, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}
