import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { operatorFullName } from "@/lib/operator-name";
import { chatMessageSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { getClientId } from "@/lib/client-id";

const MAX_PER_MINUTE = 60;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ sessionId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { sessionId } = await ctx.params;
  const chat = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: { orderBy: { createdAt: "asc" }, include: { operator: true } },
    },
  });

  if (!chat) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const messages = chat.messages.map((m) => ({
    ...m,
    operator: m.operator
      ? {
          fullName: operatorFullName(m.operator),
        }
      : null,
  }));

  if (!chat.assignedOperatorId) {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { assignedOperatorId: session.user.id },
    });
  }

  return NextResponse.json({
    chat: {
      ...chat,
      messages,
    },
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ sessionId: string }> },
) {
  const authSession = await auth();
  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const key = `admin_chat:${getClientId(req)}`;
  const limited = rateLimit(key, MAX_PER_MINUTE);
  if (!limited.ok) {
    return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
  }

  const { sessionId } = await ctx.params;
  const chat = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!chat || chat.status !== "OPEN") {
    return NextResponse.json({ error: "Чат недоступен" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело" }, { status: 400 });
  }

  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ошибка валидации" }, { status: 400 });
  }

  const msg = await prisma.chatMessage.create({
    data: {
      sessionId,
      body: parsed.data.body,
      senderRole: "OPERATOR",
      operatorId: authSession.user.id,
    },
  });

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message: msg });
}
