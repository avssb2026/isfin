import type { Session } from "next-auth";

function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

/** Просмотр карточки: админ — всё; оператор — «свои» или заявки из общего пула (без ответственного). */
export function canReadLeadDetail(
  session: Session | null,
  lead: { assignedOperatorId: string | null },
): boolean {
  if (!session?.user?.id) return false;
  if (isAdmin(session)) return true;
  if (lead.assignedOperatorId === null) return true;
  return lead.assignedOperatorId === session.user.id;
}

/**
 * Изменение заявки: админ — полный доступ; оператор — только если он уже ответственный
 * (заявки из пула сначала закрепляются через POST …/take).
 */
export function canModifyLeadAsOperator(
  session: Session | null,
  lead: { assignedOperatorId: string | null },
): boolean {
  if (!session?.user?.id) return false;
  if (isAdmin(session)) return true;
  return lead.assignedOperatorId === session.user.id;
}

/** Доступ оператора к чату: свой чат, незакреплённый открытый, либо админ. */
export function canAccessChatSession(
  session: Session | null,
  chat: { assignedOperatorId: string | null; status: string },
): boolean {
  if (!session?.user?.id) return false;
  if (isAdmin(session)) return true;
  if (chat.status !== "OPEN") return false;
  if (chat.assignedOperatorId === null) return true;
  return chat.assignedOperatorId === session.user.id;
}
