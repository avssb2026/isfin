import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_PERCENT = Number(
  process.env.NEXT_PUBLIC_DEFAULT_KEY_RATE_PERCENT ?? "16",
);

/** Публичный параметр калькулятора (без авторизации) */
export async function GET() {
  try {
    const row = await prisma.bankSettings.findUnique({
      where: { id: "global" },
    });

    const annualSchedulePercent = row?.annualSchedulePercent ?? FALLBACK_PERCENT;

    return NextResponse.json({ annualSchedulePercent });
  } catch (err) {
    console.error("GET /api/public/calculator-settings", err);
    return NextResponse.json({ annualSchedulePercent: FALLBACK_PERCENT }, { status: 200 });
  }
}
