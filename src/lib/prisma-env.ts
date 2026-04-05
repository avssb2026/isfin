/**
 * Prisma в schema.prisma читает env("isfin_db_DATABASE_URL").
 * При необходимости подставляем из isfin_db_PRISMA_DATABASE_URL / isfin_db_POSTGRES_URL.
 */
function isLocalhostDbUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}

export function applyDatabaseUrlFromProjectEnv(): void {
  const fromIsfin =
    process.env.isfin_db_PRISMA_DATABASE_URL ||
    process.env.isfin_db_POSTGRES_URL;

  if (fromIsfin) {
    process.env.isfin_db_DATABASE_URL = fromIsfin;
    return;
  }

  if (process.env.VERCEL === "1") {
    const current = (process.env.isfin_db_DATABASE_URL ?? "").trim();
    if (current && isLocalhostDbUrl(current)) {
      console.error(
        "[isfin] На Vercel в isfin_db_DATABASE_URL попал localhost. Задайте isfin_db_PRISMA_DATABASE_URL или isfin_db_POSTGRES_URL.",
      );
    }
  }
}

applyDatabaseUrlFromProjectEnv();
