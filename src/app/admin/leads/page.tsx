"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LeadRow = {
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
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/leads");
      if (!res.ok) {
        setErr("Не удалось загрузить заявки");
        return;
      }
      const data = await res.json();
      setLeads(data.leads as LeadRow[]);
    })();
  }, []);

  if (err) return <p className="text-red-600">{err}</p>;
  if (!leads) return <p className="text-[var(--muted)]">Загрузка…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text)]">Заявки (CRM)</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Все обращения с продуктовой страницы и история взаимодействий по карточке лида.
      </p>

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
    </div>
  );
}
