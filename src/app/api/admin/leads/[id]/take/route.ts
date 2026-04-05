import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { operatorFullName } from "@/lib/operator-name";

/** Закрепить заявку за текущим оператором (только если ещё никому не назначена) */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const before = await prisma.lead.findUnique({
    where: { id },
    select: { assignedOperatorId: true },
  });
  if (!before) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }
  if (before.assignedOperatorId !== null) {
    return NextResponse.json(
      { error: "Заявка уже закреплена за оператором" },
      { status: 409 },
    );
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: { assignedOperatorId: session.user.id },
    include: {
      assignedOperator: {
        select: { id: true, lastName: true, firstName: true, patronymic: true, email: true },
      },
    },
  });

  const op = lead.assignedOperator!;
  await prisma.activityLog.create({
    data: {
      leadId: lead.id,
      operatorId: session.user.id,
      type: "ASSIGN",
      note: `Назначен ответственный: ${operatorFullName(op)}`,
    },
  });

  const assignedPatch = {
    id: op.id,
    email: op.email,
    fullName: operatorFullName(op),
  };

  return NextResponse.json({
    lead: { ...lead, assignedOperator: assignedPatch },
  });
}
