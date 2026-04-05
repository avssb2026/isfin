"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MurabahaCalculator } from "@/components/MurabahaCalculator";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import {
  MURABAHA_TERM_MONTHS_MAX,
  MURABAHA_TERM_MONTHS_MIN,
} from "@/lib/murabahaCalculator";
import { VoiceField } from "@/components/VoiceField";

export default function ProductPage() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<{ token: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#lead-form") return;
    requestAnimationFrame(() => {
      document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg(null);
    try {
      const payload: Record<string, string> = { lastName, firstName, phone };
      if (captcha) {
        payload.captchaToken = captcha.token;
        payload.captchaAnswer = captchaAnswer;
      }
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let data: {
        error?: string;
        captchaRequired?: boolean;
        captcha?: { token: string; question: string };
      } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as typeof data;
        } catch {
          setStatus("err");
          setMsg(
            res.ok
              ? "Не удалось разобрать ответ сервера."
              : `Ошибка сервера (${res.status}). Попробуйте позже.`,
          );
          return;
        }
      }
      if (res.status === 400 && data.captchaRequired && data.captcha) {
        setCaptcha(data.captcha);
        setStatus("err");
        setMsg(data.error ?? "Введите ответ на пример.");
        return;
      }
      if (!res.ok) {
        setStatus("err");
        setMsg(data.error ?? "Ошибка отправки");
        return;
      }
      setStatus("ok");
      setMsg("Заявка принята. Мы свяжемся с вами.");
      setLastName("");
      setFirstName("");
      setPhone("");
      setCaptcha(null);
      setCaptchaAnswer("");
    } catch {
      setStatus("err");
      setMsg("Не удалось связаться с сервером. Проверьте интернет и попробуйте снова.");
    }
  }

  return (
    <div className="page-gradient min-h-screen">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
        <nav className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Link href="/" className="transition hover:text-[var(--accent)]">
            Главная
          </Link>
          <span className="text-[var(--border-strong)]" aria-hidden>
            /
          </span>
          <span className="font-medium text-[var(--text)]">Ипотека Мурабаха</span>
        </nav>

        <div className="mt-8 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
            Ипотека Мурабаха — условия и заявка
          </h1>
          <p className="mt-3 max-w-3xl text-[var(--muted)] leading-relaxed sm:text-lg">
            Продукт предназначен для приобретения готового жилья или на этапе строительства в
            соответствии с шариатским подходом: фиксируется цена банка, отсроченная цена для вас и
            график взносов. Рассчитайте рассрочку на калькуляторе и подайте заявку на консультацию и
            оформление.
          </p>
        </div>

        <section className="mt-10">
          <MurabahaCalculator />
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
            Детальные условия (обобщённо)
          </h2>
          <div className="mt-6 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
            <ul className="list-inside list-disc space-y-2 text-[var(--muted)] leading-relaxed">
              <li>Объект: жилое помещение на территории РФ, соответствующее требованиям банка.</li>
              <li>Первоначальный взнос: размер определяется политикой банка и профилем сделки.</li>
              <li>
                Срок рассрочки: в калькуляторе на странице — от {MURABAHA_TERM_MONTHS_MIN} до{" "}
                {MURABAHA_TERM_MONTHS_MAX} мес.; итоговый срок по договору зависит от программы и
                скоринга.
              </li>
              <li>
                Отсроченная цена включает маржу банка; расчётный годовой параметр согласуется с
                ключевой ставкой для сопоставимости с рыночной ипотекой.
              </li>
              <li>Досрочное погашение и изменение графика — по правилам договора.</li>
              <li>Страхование и оценка — по стандартным требованиям к ипотечным сделкам.</li>
            </ul>
          </div>
        </section>

        <section
          id="lead-form"
          className="mt-14 scroll-mt-28 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-10"
        >
          <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Заявка на оформление</h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            Данные попадают в CRM банка. Голосовой ввод работает в поддерживаемых браузерах (кнопка у
            поля).
          </p>

          <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)]">Фамилия</label>
              <input
                required
                className="input-modern mt-2 w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <VoiceField onText={(t) => setLastName(t)} label="Фамилия" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)]">Имя</label>
              <input
                required
                className="input-modern mt-2 w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <VoiceField onText={(t) => setFirstName(t)} label="Имя" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Мобильный телефон
              </label>
              <input
                required
                className="input-modern mt-2 w-full max-w-md"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7..."
              />
              <VoiceField onText={(t) => setPhone(t)} label="Телефон" />
            </div>
            {msg && (
              <p
                className={`sm:col-span-2 text-sm font-medium ${status === "ok" ? "text-[var(--accent)]" : "text-red-600"}`}
              >
                {msg}
              </p>
            )}
            {captcha && (
              <div className="sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-sm font-medium text-[var(--text)]">
                  Проверка: сколько будет{" "}
                  <span className="whitespace-nowrap font-mono">{captcha.question}</span>?
                </p>
                <input
                  className="input-modern mt-3 max-w-xs"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Ответ числом"
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/20 transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
              >
                {status === "loading" ? "Отправка…" : "Отправить заявку"}
              </button>
            </div>
          </form>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
