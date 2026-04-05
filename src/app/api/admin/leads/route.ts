import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { operatorFullName } from "@/lib/operator-name";
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
            OR: [
              { lastName: insensitive },
              { firstName: insensitive },
              { patronymic: insensitive },
              { email: insensitive },
            ],
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

  const leadsRaw = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { activityLogs: true, chatSessions: true } },
      assignedOperator: {
        select: { id: true, lastName: true, firstName: true, patronymic: true, email: true },
      },
    },
  });

  const leads = leadsRaw.map((l) => ({
    ...l,
    assignedOperator: l.assignedOperator
      ? {
          id: l.assignedOperator.id,
          email: l.assignedOperator.email,
          fullName: operatorFullName(l.assignedOperator),
        }
      : null,
  }));

  return NextResponse.json({ leads });
}
