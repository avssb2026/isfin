function secret(): string {
  return process.env.AUTH_SECRET ?? process.env.CAPTCHA_SECRET ?? "dev-captcha-secret-change-me";
}

export type CaptchaChallenge = { token: string; question: string };

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> | null {
  const clean = hex.trim();
  if (clean.length % 2 !== 0) return null;
  const out = new Uint8Array(clean.length / 2) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < out.length; i++) {
    const v = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(v)) return null;
    out[i] = v;
  }
  return out;
}

async function hmacSha256Hex(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return bytesToHex(sig);
}

async function timingSafeHmacVerify(payload: string, sigHex: string): Promise<boolean> {
  const enc = new TextEncoder();
  const sigBytes = hexToBytes(sigHex);
  if (!sigBytes) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
}

/** Простая математическая CAPTCHA с подписью HMAC (без внешних сервисов) */
export async function createMathCaptcha(): Promise<CaptchaChallenge> {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const exp = Date.now() + 5 * 60_000;
  const payload = JSON.stringify({ a, b, exp });
  const sig = await hmacSha256Hex(payload);
  const token = Buffer.from(`${payload}::${sig}`, "utf8").toString("base64url");
  return { token, question: `${a} + ${b}` };
}

export async function verifyMathCaptcha(
  token: string | undefined,
  answerRaw: string | undefined,
): Promise<boolean> {
  if (!token || answerRaw === undefined || answerRaw === null) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const sep = decoded.lastIndexOf("::");
    if (sep < 0) return false;
    const payload = decoded.slice(0, sep);
    const sig = decoded.slice(sep + 2);
    const okSig = await timingSafeHmacVerify(payload, sig);
    if (!okSig) return false;
    const { a, b, exp } = JSON.parse(payload) as { a: number; b: number; exp: number };
    if (typeof a !== "number" || typeof b !== "number" || typeof exp !== "number") return false;
    if (Date.now() > exp) return false;
    const answer = parseInt(String(answerRaw).trim().replace(/\s/g, ""), 10);
    if (Number.isNaN(answer)) return false;
    return answer === a + b;
  } catch {
    return false;
  }
}
