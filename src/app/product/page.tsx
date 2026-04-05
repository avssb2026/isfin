"use client";

import Link from "next/link";
import { useState } from "react";
import { MurabahaCalculator } from "@/components/MurabahaCalculator";
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastName, firstName, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("err");
        setMsg((data as { error?: string }).error ?? "Ошибка отправки");
        return;
      }
      setStatus("ok");
      setMsg("Заявка принята. Мы свяжемся с вами.");
      setLastName("");
      setFirstName("");
      setPhone("");
    } catch {
      setStatus("err");
      setMsg("Сеть недоступна. Попробуйте позже.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-10">
      <nav className="text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text)]">Ипотека Мурабаха</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold text-[var(--text)]">
        Ипотека Мурабаха — условия и заявка
      </h1>
      <p className="mt-3 max-w-3xl text-[var(--muted)]">
        Продукт предназначен для приобретения готового жилья или на этапе строительства в
        соответствии с шариатским подходом: фиксируется цена банка, отсроченная цена для вас и
        график взносов. Рассчитайте рассрочку на калькуляторе и подайте заявку на консультацию и оформление.
      </p>

      <section className="mt-10">
        <MurabahaCalculator />
      </section>

      <section className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold">Детальные условия (обобщённо)</h2>
        <div className="prose prose-sm max-w-none text-[var(--muted)]">
          <ul className="list-inside list-disc space-y-2">
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

      <section className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h2 className="text-xl font-semibold">Заявка на оформление</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Данные попадают в CRM банка. Голосовой ввод работает в поддерживаемых браузерах (кнопка
          у поля).
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-[var(--muted)]">Фамилия</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <VoiceField onText={(t) => setLastName(t)} label="Фамилия" />
          </div>
          <div>
            <label className="text-sm text-[var(--muted)]">Имя</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <VoiceField onText={(t) => setFirstName(t)} label="Имя" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-[var(--muted)]">Мобильный телефон</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7..."
            />
            <VoiceField onText={(t) => setPhone(t)} label="Телефон" />
          </div>
          {msg && (
            <p
              className={`sm:col-span-2 text-sm ${status === "ok" ? "text-[var(--accent)]" : "text-red-600"}`}
            >
              {msg}
            </p>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {status === "loading" ? "Отправка…" : "Отправить заявку"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
