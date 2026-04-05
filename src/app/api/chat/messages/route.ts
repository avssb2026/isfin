import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientId } from "@/lib/client-id";
import { chatMessageSchema } from "@/lib/validations";

const COOKIE = "visitor_chat_session_id";
const MAX_MSG_PER_MINUTE = 40;

async function getSessionIdFromCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

export async function GET(req: Request) {
  const sessionId = await getSessionIdFromCookie();
  if (!sessionId) {
    return NextResponse.json({ messages: [], sessionId: null });
  }

  const url = new URL(req.url);
  const after = url.searchParams.get("after");
  const afterDate = after ? new Date(after) : undefined;
  if (after && Number.isNaN(afterDate?.getTime() ?? NaN)) {
    return NextResponse.json({ error: "Некорректный параметр after" }, { status: 400 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      sessionId,
      ...(afterDate ? { createdAt: { gt: afterDate } } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      senderRole: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ sessionId, messages });
}

export async function POST(req: Request) {
  const key = `chat_msg:${getClientId(req)}`;
  const limited = rateLimit(key, MAX_MSG_PER_MINUTE);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Слишком много сообщений" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const sessionId = await getSessionIdFromCookie();
  if (!sessionId) {
    return NextResponse.json({ error: "Сессия чата не найдена" }, { status: 400 });
  }

  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.status !== "OPEN") {
    return NextResponse.json({ error: "Чат недоступен" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ошибка валидации", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const msg = await prisma.chatMessage.create({
    data: {
      sessionId,
      body: parsed.data.body,
      senderRole: "VISITOR",
    },
  });

  return NextResponse.json({
    ok: true,
    message: {
      id: msg.id,
      body: msg.body,
      senderRole: msg.senderRole,
      createdAt: msg.createdAt,
    },
  });
}
