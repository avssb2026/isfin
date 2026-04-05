import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { operatorFullName } from "@/lib/operator-name";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const rows = await prisma.chatSession.findMany({
    where: { status: "OPEN" },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      assignedOperator: {
        select: { id: true, lastName: true, firstName: true, patronymic: true },
      },
    },
  });

  const sessions = rows.map((s) => ({
    ...s,
    assignedOperator: s.assignedOperator
      ? {
          id: s.assignedOperator.id,
          fullName: operatorFullName(s.assignedOperator),
        }
      : null,
  }));

  return NextResponse.json({ sessions });
}
