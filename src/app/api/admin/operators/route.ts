import { NextResponse } from "next/server";
import argon2 from "argon2";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { operatorFullName } from "@/lib/operator-name";
import { requireAdmin } from "@/lib/require-admin";
import { bankOperatorCreateSchema } from "@/lib/validations";

function serializeOperator(o: {
  id: string;
  lastName: string;
  firstName: string;
  patronymic: string | null;
  email: string;
  role: string;
  createdAt: Date;
}) {
  return {
    id: o.id,
    lastName: o.lastName,
    firstName: o.firstName,
    patronymic: o.patronymic,
    fullName: operatorFullName(o),
    email: o.email,
    role: o.role,
    createdAt: o.createdAt.toISOString(),
  };
}

/** Список операторов (для CRM и панели) */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const operators = await prisma.bankOperator.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      lastName: true,
      firstName: true,
      patronymic: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    operators: operators.map(serializeOperator),
  });
}

/** Создание оператора — только ADMIN */
export async function POST(req: Request) {
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

  const parsed = bankOperatorCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ошибка валидации" }, { status: 400 });
  }

  const { lastName, firstName, patronymic, email, password, role } = parsed.data;
  const passwordHash = await argon2.hash(password);

  try {
    const created = await prisma.bankOperator.create({
      data: {
        lastName,
        firstName,
        patronymic: patronymic ?? null,
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        patronymic: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ operator: serializeOperator(created) });
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "Оператор с таким email уже есть" }, { status: 409 });
    }
    throw e;
  }
}
