import { NextResponse } from "next/server";
import argon2 from "argon2";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { operatorFullName } from "@/lib/operator-name";
import { requireAdmin } from "@/lib/require-admin";
import { bankOperatorUpdateSchema } from "@/lib/validations";

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

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const gate = requireAdmin(session);
  if (!gate.ok) {
    return NextResponse.json(gate.response, { status: gate.status });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело" }, { status: 400 });
  }

  const parsed = bankOperatorUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ошибка валидации" }, { status: 400 });
  }

  const d = parsed.data;
  const existing = await prisma.bankOperator.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const data: {
    lastName?: string;
    firstName?: string;
    patronymic?: string | null;
    email?: string;
    passwordHash?: string;
    role?: "OPERATOR" | "ADMIN";
  } = {};

  if (d.lastName !== undefined) data.lastName = d.lastName;
  if (d.firstName !== undefined) data.firstName = d.firstName;
  if (d.patronymic !== undefined) data.patronymic = d.patronymic;
  if (d.email !== undefined) data.email = d.email;
  if (d.password !== undefined) data.passwordHash = await argon2.hash(d.password);
  if (d.role !== undefined) data.role = d.role;

  try {
    const updated = await prisma.bankOperator.update({
      where: { id },
      data,
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
    return NextResponse.json({ operator: serializeOperator(updated) });
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "Оператор с таким email уже есть" }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const gate = requireAdmin(session);
  if (!gate.ok) {
    return NextResponse.json(gate.response, { status: gate.status });
  }

  const { id } = await ctx.params;

  if (id === gate.session.user.id) {
    return NextResponse.json({ error: "Нельзя удалить собственную учётную запись" }, { status: 400 });
  }

  const existing = await prisma.bankOperator.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  await prisma.bankOperator.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
