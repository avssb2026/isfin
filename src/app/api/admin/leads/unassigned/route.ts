import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Заявки без ответственного оператора (общий пул) */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    where: { assignedOperatorId: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { activityLogs: true, chatSessions: true } },
    },
  });

  return NextResponse.json({ leads });
}
