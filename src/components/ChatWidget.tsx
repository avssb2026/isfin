"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"pre" | "chat">("pre");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAfterRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      const res = await fetch("/api/chat/messages", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        sessionId: string | null;
        messages: Msg[];
      };
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setStep("chat");
        if (data.messages?.length) {
          setMessages(
            [...data.messages].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            ),
          );
        }
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open || step !== "chat") return;

    async function tick() {
      const params = lastAfterRef.current
        ? `?after=${encodeURIComponent(lastAfterRef.current)}`
        : "";
      const res = await fetch(`/api/chat/messages${params}`, { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        sessionId: string | null;
        messages: Msg[];
      };
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.messages?.length) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const merged = [...prev];
          for (const m of data.messages) {
            if (!ids.has(m.id)) merged.push(m);
          }
          merged.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          const last = merged[merged.length - 1];
          if (last) lastAfterRef.current = last.createdAt;
          return merged;
        });
      }
    }

    lastAfterRef.current = null;
    void tick();
    const t = setInterval(() => void tick(), 2500);
    return () => clearInterval(t);
  }, [open, step]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startChat(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visitorName: name.trim(), visitorPhone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Ошибка");
        return;
      }
      setSessionId((data as { sessionId?: string }).sessionId ?? null);
      setStep("chat");
      setMessages([]);
      lastAfterRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: draft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Ошибка отправки");
        return;
      }
      setDraft("");
      const msg = (data as { message?: Msg }).message;
      if (msg) setMessages((prev) => [...prev, msg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Открыть чат"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg transition hover:bg-[var(--accent-hover)]"
        onClick={() => setOpen((v) => !v)}
      >
        💬
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          role="dialog"
          aria-label="Чат с банком"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3">
            <span className="font-semibold text-[var(--text)]">Консультация</span>
            <button
              type="button"
              className="text-[var(--muted)] hover:text-[var(--text)]"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          {step === "pre" && (
            <form onSubmit={startChat} className="flex flex-col gap-3 p-4">
              <p className="text-sm text-[var(--muted)]">
                Укажите контакты, чтобы мы могли помочь по продукту Мурабаха.
              </p>
              <label className="text-sm">
                <span className="text-[var(--muted)]">Имя</span>
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </label>
              <label className="text-sm">
                <span className="text-[var(--muted)]">Телефон</span>
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+7..."
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
              >
                {loading ? "…" : "Начать чат"}
              </button>
            </form>
          )}

          {step === "chat" && (
            <div className="flex h-[420px] flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.senderRole === "VISITOR"
                        ? "ml-8 rounded-lg bg-[var(--accent)]/10 px-3 py-2"
                        : "mr-8 rounded-lg bg-[var(--bg)] px-3 py-2"
                    }
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      {m.senderRole === "VISITOR" ? "Вы" : "Банк"}
                    </p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMessage} className="border-t border-[var(--border)] p-3">
                {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2"
                    placeholder="Сообщение…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-[var(--accent)] px-4 py-2 text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
                  >
                    →
                  </button>
                </div>
                {sessionId && (
                  <p className="mt-2 text-[10px] text-[var(--muted)]">
                    Сессия активна. Ответ оператора поступит в рабочее время.
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
