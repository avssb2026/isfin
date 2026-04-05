import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function buildSearchWhere(q: string): Prisma.LeadWhereInput {
  const term = q.trim();
  if (term.length === 0) return {};

  const insensitive = { contains: term, mode: "insensitive" as const };

  return {
    OR: [
      { lastName: insensitive },
      { firstName: insensitive },
      { phone: insensitive },
      { source: insensitive },
      { activityLogs: { some: { note: insensitive } } },
      {
        assignedOperator: {
          is: {
            OR: [{ name: insensitive }, { email: insensitive }],
          },
        },
      },
    ],
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 200);

  const searchWhere = buildSearchWhere(q);
  const where: Prisma.LeadWhereInput = {
    assignedOperatorId: session.user.id,
    ...searchWhere,
  };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { activityLogs: true, chatSessions: true } },
      assignedOperator: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ leads });
}
