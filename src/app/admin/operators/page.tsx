"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

type OperatorRow = {
  id: string;
  lastName: string;
  firstName: string;
  patronymic: string | null;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

const emptyCreate = {
  lastName: "",
  firstName: "",
  patronymic: "",
  email: "",
  password: "",
  role: "OPERATOR" as "OPERATOR" | "ADMIN",
};

export default function AdminOperatorsPage() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<OperatorRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({
    lastName: "",
    firstName: "",
    patronymic: "",
    email: "",
    password: "",
    role: "OPERATOR" as "OPERATOR" | "ADMIN",
  });

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/admin/operators", { credentials: "include" });
    if (res.status === 401) {
      setErr("Нужна авторизация");
      setRows([]);
      return;
    }
    if (!res.ok) {
      setErr("Не удалось загрузить список");
      return;
    }
    const data = await res.json();
    setRows((data.operators as OperatorRow[]) ?? []);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/admin/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        lastName: createForm.lastName.trim(),
        firstName: createForm.firstName.trim(),
        patronymic: createForm.patronymic.trim() || null,
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      }),
    });
    if (res.status === 403) {
      setErr("Недостаточно прав");
      return;
    }
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(typeof j.error === "string" ? j.error : "Ошибка создания");
      return;
    }
    setCreateForm(emptyCreate);
    await load();
  }

  function startEdit(o: OperatorRow) {
    setEditingId(o.id);
    setEditDraft({
      lastName: o.lastName,
      firstName: o.firstName,
      patronymic: o.patronymic ?? "",
      email: o.email,
      password: "",
      role: o.role as "OPERATOR" | "ADMIN",
    });
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setErr(null);
    const body: Record<string, unknown> = {
      lastName: editDraft.lastName.trim(),
      firstName: editDraft.firstName.trim(),
      patronymic: editDraft.patronymic.trim() || null,
      email: editDraft.email.trim(),
      role: editDraft.role,
    };
    if (editDraft.password.trim()) {
      body.password = editDraft.password;
    }
    const res = await fetch(`/api/admin/operators/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(typeof j.error === "string" ? j.error : "Ошибка сохранения");
      return;
    }
    setEditingId(null);
    await load();
  }

  async function onDelete(id: string) {
    if (!confirm("Удалить оператора? Это действие необратимо.")) return;
    setErr(null);
    const res = await fetch(`/api/admin/operators/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(typeof j.error === "string" ? j.error : "Ошибка удаления");
      return;
    }
    if (editingId === id) setEditingId(null);
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text)]">Операторы банка</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Учётные записи для входа в бэк-офис. Пароль хранится в виде хэша (argon2). Редактирование и
        удаление доступны только роли ADMIN.
      </p>
      {session?.user?.email && (
        <p className="mt-1 text-xs text-[var(--muted)]">Вы вошли как {session.user.email}</p>
      )}

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-lg font-medium">Новый оператор</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-[var(--muted)]">Фамилия</span>
            <input
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={createForm.lastName}
              onChange={(e) => setCreateForm((c) => ({ ...c, lastName: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="text-[var(--muted)]">Имя</span>
            <input
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={createForm.firstName}
              onChange={(e) => setCreateForm((c) => ({ ...c, firstName: e.target.value }))}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Отчество (необязательно)</span>
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={createForm.patronymic}
              onChange={(e) => setCreateForm((c) => ({ ...c, patronymic: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="text-[var(--muted)]">Email (логин)</span>
            <input
              type="email"
              required
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={createForm.email}
              onChange={(e) => setCreateForm((c) => ({ ...c, email: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="text-[var(--muted)]">Пароль (мин. 8 символов)</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={createForm.password}
              onChange={(e) => setCreateForm((c) => ({ ...c, password: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="text-[var(--muted)]">Роль</span>
            <select
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={createForm.role}
              onChange={(e) =>
                setCreateForm((c) => ({
                  ...c,
                  role: e.target.value as "OPERATOR" | "ADMIN",
                }))
              }
            >
              <option value="OPERATOR">Оператор</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Создать
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Список</h2>
        {loading && <p className="mt-4 text-[var(--muted)]">Загрузка…</p>}
        {!loading && rows.length === 0 && (
          <p className="mt-4 text-sm text-[var(--muted)]">Операторов пока нет.</p>
        )}
        {!loading && rows.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--bg)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">ФИО</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Роль</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">{o.fullName}</td>
                    <td className="px-4 py-3">{o.email}</td>
                    <td className="px-4 py-3">{o.role}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-[var(--accent)] hover:underline"
                        onClick={() => startEdit(o)}
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        className="ml-3 text-red-600 hover:underline"
                        onClick={() => void onDelete(o.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Редактирование</h3>
            <form onSubmit={onSaveEdit} className="mt-4 grid gap-3">
              <label className="text-sm">
                <span className="text-[var(--muted)]">Фамилия</span>
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
                  value={editDraft.lastName}
                  onChange={(e) => setEditDraft((d) => ({ ...d, lastName: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="text-[var(--muted)]">Имя</span>
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
                  value={editDraft.firstName}
                  onChange={(e) => setEditDraft((d) => ({ ...d, firstName: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="text-[var(--muted)]">Отчество</span>
                <input
                  className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
                  value={editDraft.patronymic}
                  onChange={(e) => setEditDraft((d) => ({ ...d, patronymic: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="text-[var(--muted)]">Email</span>
                <input
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
                  value={editDraft.email}
                  onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="text-[var(--muted)]">Новый пароль (оставьте пустым, чтобы не менять)</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
                  value={editDraft.password}
                  onChange={(e) => setEditDraft((d) => ({ ...d, password: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="text-[var(--muted)]">Роль</span>
                <select
                  className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
                  value={editDraft.role}
                  onChange={(e) =>
                    setEditDraft((d) => ({
                      ...d,
                      role: e.target.value as "OPERATOR" | "ADMIN",
                    }))
                  }
                >
                  <option value="OPERATOR">Оператор</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </label>
              <div className="mt-2 flex gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg)]"
                  onClick={() => setEditingId(null)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
