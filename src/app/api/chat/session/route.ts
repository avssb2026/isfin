import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { applyFormCaptchaGate } from "@/lib/apply-form-captcha-gate";
import { rateLimit } from "@/lib/rate-limit";
import { getClientId } from "@/lib/client-id";
import { chatPreSchema } from "@/lib/validations";

const MAX_PER_MINUTE = 20;
const COOKIE = "visitor_chat_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  const clientIp = getClientId(req);
  const key = `chat_session:${clientIp}`;
  const limited = rateLimit(key, MAX_PER_MINUTE);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Слишком много запросов" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const obj =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const gate = await applyFormCaptchaGate("chat_pre", clientIp, obj);
  if (!gate.ok) {
    return gate.response;
  }

  const rest = { ...obj };
  delete rest.captchaToken;
  delete rest.captchaAnswer;
  const parsed = chatPreSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ошибка валидации", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { visitorName, visitorPhone } = parsed.data;

  const session = await prisma.chatSession.create({
    data: {
      visitorName,
      visitorPhone,
      status: "OPEN",
    },
  });

  const jar = await cookies();
  jar.set(COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return NextResponse.json({ ok: true, sessionId: session.id });
}
