import crypto from "crypto";

function secret(): string {
  return process.env.AUTH_SECRET ?? process.env.CAPTCHA_SECRET ?? "dev-captcha-secret-change-me";
}

export type CaptchaChallenge = { token: string; question: string };

/** Простая математическая CAPTCHA с подписью HMAC (без внешних сервисов) */
export function createMathCaptcha(): CaptchaChallenge {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const exp = Date.now() + 5 * 60_000;
  const payload = JSON.stringify({ a, b, exp });
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  const token = Buffer.from(`${payload}::${sig}`, "utf8").toString("base64url");
  return { token, question: `${a} + ${b}` };
}

export function verifyMathCaptcha(token: string | undefined, answerRaw: string | undefined): boolean {
  if (!token || answerRaw === undefined || answerRaw === null) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const sep = decoded.lastIndexOf("::");
    if (sep < 0) return false;
    const payload = decoded.slice(0, sep);
    const sig = decoded.slice(sep + 2);
    const expected = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return false;
    }
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
