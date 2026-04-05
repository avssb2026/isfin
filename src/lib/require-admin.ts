import type { Session } from "next-auth";

export function requireAuth(session: Session | null) {
  if (!session?.user?.id) {
    return { ok: false as const, response: { error: "Не авторизован" }, status: 401 };
  }
  return { ok: true as const, session };
}

export function requireAdmin(session: Session | null) {
  const auth = requireAuth(session);
  if (!auth.ok) return auth;
  if (auth.session.user.role !== "ADMIN") {
    return { ok: false as const, response: { error: "Недостаточно прав" }, status: 403 };
  }
  return { ok: true as const, session: auth.session };
}
