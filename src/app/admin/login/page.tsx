"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, Suspense } from "react";

function safePostLoginPath(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const u = new URL(raw, window.location.origin);
    if (u.origin === window.location.origin) {
      return `${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = safePostLoginPath(searchParams.get("callbackUrl"), "/admin/leads");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState<{ token: string; question: string } | null>(null);
  const [captchaLoadFailed, setCaptchaLoadFailed] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoadFailed(false);
    const res = await fetch("/api/public/admin-login-captcha", { cache: "no-store" });
    if (!res.ok) {
      setCaptcha(null);
      setCaptchaLoadFailed(true);
      return;
    }
    const data = (await res.json()) as { token: string; question: string };
    setCaptcha(data);
    setCaptchaAnswer("");
  }, []);

  useEffect(() => {
    void loadCaptcha();
  }, [loadCaptcha]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!captcha) {
      setError("Загрузите проверку, обновите страницу.");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      captchaToken: captcha.token,
      captchaAnswer,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Неверные данные: email, пароль или ответ в проверке.");
      void loadCaptcha();
      return;
    }
    window.location.href = callbackUrl;
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-[var(--text)]">Вход для операторов</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Доступ к CRM и онлайн-чату. Учётная запись выдаётся администратором.
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="text-sm">
          <span className="text-[var(--muted)]">Email</span>
          <input
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-[var(--muted)]">Пароль</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {captcha && (
          <label className="text-sm">
            <span className="text-[var(--muted)]">
              Проверка: сколько будет <span className="font-mono">{captcha.question}</span>?
            </span>
            <input
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ответ числом"
            />
          </label>
        )}
        {captchaLoadFailed && (
          <p className="text-sm text-red-600">
            Не удалось загрузить проверку.{" "}
            <button
              type="button"
              className="text-[var(--accent)] underline"
              onClick={() => void loadCaptcha()}
            >
              Повторить
            </button>
          </p>
        )}
        {!captcha && !loading && !captchaLoadFailed && (
          <p className="text-sm text-[var(--muted)]">Загрузка проверки…</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !captcha}
          className="rounded-xl bg-[var(--accent)] py-2.5 font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-[var(--muted)]">Загрузка…</p>}>
      <LoginForm />
    </Suspense>
  );
}
