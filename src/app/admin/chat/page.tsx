"use client";

import { useEffect, useRef, useState } from "react";

type SessionRow = {
  id: string;
  visitorName: string;
  visitorPhone: string;
  status: string;
  updatedAt: string;
  messages: { body: string }[];
  assignedOperator: { id: string; fullName: string } | null;
};

type Msg = {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
  operator: { fullName: string } | null;
};

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadSessions() {
    const res = await fetch("/api/admin/chat/sessions");
    if (!res.ok) return;
    const data = await res.json();
    setSessions(data.sessions as SessionRow[]);
  }

  async function openSession(id: string) {
    setActiveId(id);
    setLoading(true);
    const res = await fetch(`/api/admin/chat/${id}/messages`);
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setMessages((data.chat.messages as Msg[]) ?? []);
  }

  useEffect(() => {
    void loadSessions();
    const t = setInterval(() => void loadSessions(), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!activeId) return;

    async function tick() {
      const res = await fetch(`/api/admin/chat/${activeId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages((data.chat.messages as Msg[]) ?? []);
    }

    void tick();
    const t = setInterval(() => void tick(), 3000);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/admin/chat/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft.trim() }),
    });
    setLoading(false);
    if (!res.ok) return;
    setDraft("");
    void openSession(activeId);
    void loadSessions();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div>
        <h1 className="text-xl font-semibold">Онлайн-чат</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Открытые диалоги посетителей сайта.</p>
        <ul className="mt-4 space-y-2">
          {sessions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => void openSession(s.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  activeId === s.id
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)]"
                }`}
              >
                <span className="font-medium">{s.visitorName}</span>
                <span className="block text-xs text-[var(--muted)]">{s.visitorPhone}</span>
                {s.messages[0] && (
                  <span className="mt-1 line-clamp-2 block text-xs text-[var(--muted)]">
                    {s.messages[0].body}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-h-[420px] flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {!activeId && (
          <p className="m-auto text-sm text-[var(--muted)]">Выберите диалог слева</p>
        )}
        {activeId && (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loading && messages.length === 0 && (
                <p className="text-sm text-[var(--muted)]">Загрузка…</p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.senderRole === "OPERATOR"
                      ? "ml-12 rounded-lg bg-[var(--bg)] px-3 py-2 text-sm"
                      : "mr-12 rounded-lg bg-[var(--accent)]/10 px-3 py-2 text-sm"
                  }
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    {m.senderRole === "OPERATOR"
                      ? `Оператор${m.operator ? `: ${m.operator.fullName}` : ""}`
                      : "Клиент"}
                  </p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="border-t border-[var(--border)] p-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                  placeholder="Ответ клиенту…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
                >
                  Отправить
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
