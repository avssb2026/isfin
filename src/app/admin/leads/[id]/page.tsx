"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Activity = {
  id: string;
  type: string;
  note: string;
  createdAt: string;
  operator: { fullName: string; email: string } | null;
};

type OperatorOption = { id: string; fullName: string; email: string };

type LeadDetail = {
  id: string;
  lastName: string;
  firstName: string;
  phone: string;
  status: string;
  source: string;
  createdAt: string;
  assignedOperatorId: string | null;
  assignedOperator: OperatorOption | null;
  activityLogs: Activity[];
};

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string>("NEW");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [operators, setOperators] = useState<OperatorOption[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/admin/leads/${id}`);
    if (!res.ok) {
      setErr("Не найдено");
      return;
    }
    const data = await res.json();
    const l = data.lead as LeadDetail;
    setLead(l);
    setStatus(l.status);
    setAssigneeId(l.assignedOperatorId ?? "");
  }

  useEffect(() => {
    void load();
  }, [id]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/operators");
      if (!res.ok) return;
      const data = await res.json();
      setOperators((data.operators as OperatorOption[]) ?? []);
    })();
  }, []);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    const res = await fetch(`/api/admin/leads/${id}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note.trim() }),
    });
    if (!res.ok) return;
    setNote("");
    void load();
  }

  async function saveStatus(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    void load();
  }

  async function saveAssignee(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignedOperatorId: assigneeId === "" ? null : assigneeId,
      }),
    });
    if (!res.ok) return;
    void load();
  }

  if (err) return <p className="text-red-600">{err}</p>;
  if (!lead) return <p className="text-[var(--muted)]">Загрузка…</p>;

  return (
    <div>
      <Link href="/admin/leads" className="text-sm text-[var(--accent)] hover:underline">
        ← К списку
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">
        {lead.lastName} {lead.firstName}
      </h1>
      <p className="text-[var(--muted)]">{lead.phone}</p>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end">
        <form onSubmit={saveStatus} className="flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="text-[var(--muted)]">Статус</span>
            <select
              className="mt-1 block rounded-lg border border-[var(--border)] px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Сохранить статус
          </button>
        </form>

        <form onSubmit={saveAssignee} className="flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="text-[var(--muted)]">Ответственный оператор</span>
            <select
              className="mt-1 block min-w-[220px] rounded-lg border border-[var(--border)] px-3 py-2"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Не назначен</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.fullName} ({op.email})
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg)]"
          >
            Сохранить ответственного
          </button>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">История взаимодействий</h2>
        <ul className="mt-4 space-y-3">
          {lead.activityLogs.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm"
            >
              <p className="text-[var(--muted)]">
                {new Date(a.createdAt).toLocaleString("ru-RU")} · {a.type}
                {a.operator && ` · ${a.operator.fullName}`}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{a.note}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={addNote} className="mt-6 space-y-2">
          <label className="block text-sm text-[var(--muted)]">Новая заметка</label>
          <textarea
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg)]"
          >
            Добавить
          </button>
        </form>
      </section>
    </div>
  );
}
