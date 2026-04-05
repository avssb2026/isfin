"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type LeadRow = {
  id: string;
  lastName: string;
  firstName: string;
  phone: string;
  status: string;
  source: string;
  createdAt: string;
  assignedOperator: { id: string; fullName: string; email: string } | null;
  _count: { activityLogs: number; chatSessions: number };
};

type UnassignedLead = {
  id: string;
  lastName: string;
  firstName: string;
  phone: string;
  status: string;
  source: string;
  createdAt: string;
  _count: { activityLogs: number; chatSessions: number };
};

export default function AdminLeadsPage() {
  const { status } = useSession();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [unassigned, setUnassigned] = useState<UnassignedLead[] | null>(null);
  const [takingId, setTakingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    let cancelled = false;
    void (async () => {
      setErr(null);
      const qs = debounced ? `?q=${encodeURIComponent(debounced)}` : "";
      const [resPool, resMine] = await Promise.all([
        fetch("/api/admin/leads/unassigned", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/admin/leads${qs}`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);
      if (cancelled) return;

      if (resPool.ok) {
        const data = await resPool.json();
        setUnassigned((data.leads as UnassignedLead[]) ?? []);
      } else {
        setUnassigned([]);
      }

      if (resMine.status === 401) {
        setErr("Сессия недействительна. Выйдите и войдите снова.");
        setLeads(null);
        return;
      }
      if (!resMine.ok) {
        setErr("Не удалось загрузить заявки");
        setLeads(null);
        return;
      }
      const data = await resMine.json();
      setLeads(data.leads as LeadRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced, status]);

  async function takeLead(id: string) {
    setTakingId(id);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}/take`, {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 409) {
        setErr("Эту заявку уже закрепил другой оператор. Обновите страницу.");
        return;
      }
      if (!res.ok) {
        setErr("Не удалось закрепить заявку");
        return;
      }
      const qs = debounced ? `?q=${encodeURIComponent(debounced)}` : "";
      const [resPool, resMine] = await Promise.all([
        fetch("/api/admin/leads/unassigned", { credentials: "include", cache: "no-store" }),
        fetch(`/api/admin/leads${qs}`, { credentials: "include", cache: "no-store" }),
      ]);
      if (resPool.ok) {
        const d = await resPool.json();
        setUnassigned((d.leads as UnassignedLead[]) ?? []);
      }
      if (resMine.ok) {
        const d = await resMine.json();
        setLeads(d.leads as LeadRow[]);
      }
    } finally {
      setTakingId(null);
    }
  }

  return (
    <div>
      {status === "authenticated" && unassigned !== null && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text)]">Новые заявки</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Заявки без ответственного. Нажмите «Взять», чтобы закрепить заявку за собой.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--bg)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">ФИО</th>
                  <th className="px-4 py-3 font-medium">Телефон</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Источник</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {unassigned.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                      Нет свободных заявок.
                    </td>
                  </tr>
                )}
                {unassigned.map((l) => (
                  <tr key={l.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString("ru-RU")}
                    </td>
                    <td className="px-4 py-3">
                      {l.lastName} {l.firstName}
                    </td>
                    <td className="px-4 py-3">{l.phone}</td>
                    <td className="px-4 py-3">{l.status}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{l.source}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={takingId !== null}
                        onClick={() => void takeLead(l.id)}
                        className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
                      >
                        {takingId === l.id ? "…" : "Взять"}
                      </button>
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="ml-3 text-[var(--accent)] hover:underline"
                      >
                        Открыть
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <h1 className="text-2xl font-semibold text-[var(--text)]">Мои заявки (CRM)</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Ниже — заявки, где вы указаны ответственным оператором. Поиск действует в рамках этих
        заявок: ФИО, телефон, источник, текст заметок.
      </p>

      <div className="mt-6">
        <label className="block text-sm text-[var(--muted)]">Поиск</label>
        <input
          type="search"
          placeholder="Начните вводить…"
          className="mt-1 w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {err && <p className="mt-4 text-red-600">{err}</p>}
      {status === "loading" && <p className="mt-8 text-[var(--muted)]">Проверка сессии…</p>}
      {status === "unauthenticated" && (
        <p className="mt-8 text-[var(--muted)]">Требуется вход в бэк-офис.</p>
      )}
      {status === "authenticated" && !leads && !err && (
        <p className="mt-8 text-[var(--muted)]">Загрузка…</p>
      )}

      {status === "authenticated" && leads && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--bg)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">ФИО</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">События</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && !debounced && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                    У вас пока нет заявок, назначенных на вас. Возьмите заявку из блока «Новые заявки»
                    выше или назначьте себя в карточке заявки.
                  </td>
                </tr>
              )}
              {leads.length === 0 && debounced && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                    По запросу ничего не найдено среди ваших заявок.
                  </td>
                </tr>
              )}
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-4 py-3">
                    {l.lastName} {l.firstName}
                  </td>
                  <td className="px-4 py-3">{l.phone}</td>
                  <td className="px-4 py-3">{l.status}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {l._count.activityLogs} записей
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
