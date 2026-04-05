import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientId } from "@/lib/client-id";
import { leadApplicationSchema } from "@/lib/validations";

const MAX_PER_MINUTE = 10;

export async function POST(req: Request) {
  const key = `lead:${getClientId(req)}`;
  const limited = rateLimit(key, MAX_PER_MINUTE);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const parsed = leadApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ошибка валидации", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { lastName, firstName, phone } = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      lastName,
      firstName,
      phone,
      source: "product",
      status: "NEW",
    },
  });

  await prisma.activityLog.create({
    data: {
      leadId: lead.id,
      operatorId: null,
      type: "APPLICATION",
      note: "Заявка отправлена с продуктовой страницы",
    },
  });

  return NextResponse.json({ ok: true, id: lead.id });
}
