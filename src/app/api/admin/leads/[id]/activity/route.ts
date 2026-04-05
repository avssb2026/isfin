import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canModifyLeadAsOperator } from "@/lib/lead-access";
import { activityNoteSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id: leadId } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело" }, { status: 400 });
  }

  const parsed = activityNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ошибка валидации" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    return NextResponse.json({ error: "Лид не найден" }, { status: 404 });
  }

  if (!canModifyLeadAsOperator(session, lead)) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const log = await prisma.activityLog.create({
    data: {
      leadId,
      operatorId: session.user.id,
      type: "NOTE",
      note: parsed.data.note,
    },
    include: { operator: true },
  });

  return NextResponse.json({ log });
}
