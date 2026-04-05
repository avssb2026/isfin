import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { leadPatchSchema } from "@/lib/validations";

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
      assignedOperator: { select: { id: true, name: true, email: true } },
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

  const parsed = leadPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ошибка валидации" }, { status: 400 });
  }

  const before = await prisma.lead.findUnique({
    where: { id },
    select: {
      status: true,
      assignedOperatorId: true,
      assignedOperator: { select: { name: true } },
    },
  });
  if (!before) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const { status: newStatus, assignedOperatorId: newOpId } = parsed.data;

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(newStatus !== undefined && { status: newStatus }),
      ...(newOpId !== undefined && { assignedOperatorId: newOpId }),
    },
    include: { assignedOperator: { select: { id: true, name: true, email: true } } },
  });

  if (newStatus !== undefined && newStatus !== before.status) {
    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        operatorId: session.user.id,
        type: "STATUS",
        note: `Статус изменён на ${newStatus}`,
      },
    });
  }

  if (newOpId !== undefined && newOpId !== before.assignedOperatorId) {
    let note: string;
    if (newOpId === null) {
      note = before.assignedOperator
        ? `Ответственный снят (был: ${before.assignedOperator.name})`
        : "Ответственный снят";
    } else {
      const op = await prisma.user.findUnique({
        where: { id: newOpId },
        select: { name: true },
      });
      note = op
        ? `Назначен ответственный: ${op.name}`
        : "Назначен ответственный";
    }
    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        operatorId: session.user.id,
        type: "ASSIGN",
        note,
      },
    });
  }

  return NextResponse.json({ lead });
}
