import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { bankSettingsPatchSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const row = await prisma.bankSettings.upsert({
    where: { id: "global" },
    create: { id: "global", annualSchedulePercent: 16 },
    update: {},
  });

  return NextResponse.json({
    annualSchedulePercent: row.annualSchedulePercent,
    updatedAt: row.updatedAt,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  const gate = requireAdmin(session);
  if (!gate.ok) {
    return NextResponse.json(gate.response, { status: gate.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело" }, { status: 400 });
  }

  const parsed = bankSettingsPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ошибка валидации" }, { status: 400 });
  }

  const row = await prisma.bankSettings.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      annualSchedulePercent: parsed.data.annualSchedulePercent,
    },
    update: {
      annualSchedulePercent: parsed.data.annualSchedulePercent,
    },
  });

  return NextResponse.json({
    annualSchedulePercent: row.annualSchedulePercent,
    updatedAt: row.updatedAt,
  });
}
