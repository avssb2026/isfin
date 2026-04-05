/**
 * На Vercel нельзя использовать localhost как БД. Иногда в окружение попадает
 * локальная строка из .env или заданы только переменные Prisma Postgres.
 * Выставляем DATABASE_URL до импорта PrismaClient.
 */
function isLocalhostDbUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}

export function applyVercelDatabaseUrl(): void {
  if (process.env.VERCEL !== "1") return;

  const fromPrisma =
    process.env.PRISMA_POSTGRES_PRISMA_DATABASE_URL ||
    process.env.PRISMA_POSTGRES_POSTGRES_URL;

  const current = (process.env.DATABASE_URL ?? "").trim();
  const needCloud = !current || isLocalhostDbUrl(current);

  if (fromPrisma && needCloud) {
    process.env.DATABASE_URL = fromPrisma;
  }
}

applyVercelDatabaseUrl();
