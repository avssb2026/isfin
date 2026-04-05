import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { operatorFullName } from "@/lib/operator-name";
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
      assignedOperator: {
        select: { id: true, lastName: true, firstName: true, patronymic: true, email: true },
      },
      activityLogs: { orderBy: { createdAt: "desc" }, include: { operator: true } },
      chatSessions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const assigned = lead.assignedOperator
    ? {
        id: lead.assignedOperator.id,
        email: lead.assignedOperator.email,
        fullName: operatorFullName(lead.assignedOperator),
      }
    : null;

  return NextResponse.json({
    lead: {
      ...lead,
      assignedOperator: assigned,
      activityLogs: lead.activityLogs.map((a) => ({
        ...a,
        operator: a.operator
          ? {
              id: a.operator.id,
              email: a.operator.email,
              fullName: operatorFullName(a.operator),
            }
          : null,
      })),
    },
  });
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
      assignedOperator: {
        select: { lastName: true, firstName: true, patronymic: true },
      },
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
    include: {
      assignedOperator: {
        select: { id: true, lastName: true, firstName: true, patronymic: true, email: true },
      },
    },
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
        ? `Ответственный снят (был: ${operatorFullName(before.assignedOperator)})`
        : "Ответственный снят";
    } else {
      const op = await prisma.bankOperator.findUnique({
        where: { id: newOpId },
        select: { lastName: true, firstName: true, patronymic: true },
      });
      note = op
        ? `Назначен ответственный: ${operatorFullName(op)}`
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

  const assignedPatch = lead.assignedOperator
    ? {
        id: lead.assignedOperator.id,
        email: lead.assignedOperator.email,
        fullName: operatorFullName(lead.assignedOperator),
      }
    : null;

  return NextResponse.json({
    lead: { ...lead, assignedOperator: assignedPatch },
  });
}
