import { prisma } from "@/lib/prisma";

/** Не чаще одного раза в интервал — чтобы не писать в БД на каждый запрос */
const THROTTLE_MS = 5 * 60 * 1000;

/** Обновляет LAST_ACTIVITY, если прошло достаточно времени с прошлой записи */
export async function touchOperatorActivityIfStale(operatorId: string): Promise<void> {
  try {
    const threshold = new Date(Date.now() - THROTTLE_MS);
    await prisma.bankOperator.updateMany({
      where: {
        id: operatorId,
        OR: [{ lastActivity: null }, { lastActivity: { lt: threshold } }],
      },
      data: { lastActivity: new Date() },
    });
  } catch {
    /* сессия не должна падать из-за телеметрии */
  }
}
