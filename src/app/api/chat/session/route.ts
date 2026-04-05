import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientId } from "@/lib/client-id";
import { chatPreSchema } from "@/lib/validations";

const MAX_PER_MINUTE = 20;
const COOKIE = "visitor_chat_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  const key = `chat_session:${getClientId(req)}`;
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

  const parsed = chatPreSchema.safeParse(body);
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
