import { NextResponse } from "next/server";
import { getFormAttempts, incrementFormAttempts, type FormAttemptKind } from "@/lib/form-attempts";
import { createMathCaptcha, verifyMathCaptcha } from "@/lib/math-captcha";

const CAPTCHA_THRESHOLD = 5;

type JsonBody = Record<string, unknown>;

/**
 * После CAPTCHA_THRESHOLD попыток за минуту с IP требуется математическая CAPTCHA.
 * Вызывать до разбора основной схемы; при неудаче — increment уже выполнен внутри.
 */
export function applyFormCaptchaGate(
  kind: FormAttemptKind,
  ip: string,
  body: JsonBody,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const attempts = getFormAttempts(kind, ip);

  return (async () => {
    if (attempts >= CAPTCHA_THRESHOLD) {
      const token = typeof body.captchaToken === "string" ? body.captchaToken : undefined;
      const answer =
        typeof body.captchaAnswer === "string" || typeof body.captchaAnswer === "number"
          ? String(body.captchaAnswer)
          : undefined;
      if (!(await verifyMathCaptcha(token, answer))) {
        incrementFormAttempts(kind, ip);
        const captcha = await createMathCaptcha();
        return {
          ok: false,
          response: NextResponse.json(
            {
              error: "Слишком частые попытки. Решите пример ниже.",
              captchaRequired: true,
              captcha,
            },
            { status: 400 },
          ),
        };
      }
    }

    incrementFormAttempts(kind, ip);
    return { ok: true };
  })();
}
