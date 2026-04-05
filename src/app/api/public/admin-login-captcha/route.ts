import { NextResponse } from "next/server";
import { getClientId } from "@/lib/client-id";
import { createMathCaptcha } from "@/lib/math-captcha";
import { rateLimit } from "@/lib/rate-limit";

const MAX_PER_MINUTE = 40;

/** Выдача задания для CAPTCHA на странице входа операторов */
export async function GET(req: Request) {
  const key = `admin_login_captcha:${getClientId(req)}`;
  const limited = rateLimit(key, MAX_PER_MINUTE);
  if (!limited.ok) {
    return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
  }
  return NextResponse.json(createMathCaptcha());
}
