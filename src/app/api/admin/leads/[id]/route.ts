import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { leadStatusSchema } from "@/lib/validations";
import { z } from "zod";

const patchSchema = z.object({
  status: leadStatusSchema,
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      activityLogs: { orderBy: { createdAt: "desc" }, include: { operator: true } },
      chatSessions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ошибка валидации" }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await prisma.activityLog.create({
    data: {
      leadId: lead.id,
      operatorId: session.user.id,
      type: "STATUS",
      note: `Статус изменён на ${parsed.data.status}`,
    },
  });

  return NextResponse.json({ lead });
}
