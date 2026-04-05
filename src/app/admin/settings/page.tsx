"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [annualSchedulePercent, setAnnualSchedulePercent] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);
    const res = await fetch("/api/admin/settings", { credentials: "include" });
    if (!res.ok) {
      setMsg("Не удалось загрузить настройки");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setAnnualSchedulePercent(String(data.annualSchedulePercent ?? ""));
    setUpdatedAt(data.updatedAt ? String(data.updatedAt) : null);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const v = Number(annualSchedulePercent.replace(",", "."));
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ annualSchedulePercent: v }),
    });
    setSaving(false);
    if (!res.ok) {
      setMsg("Ошибка сохранения. Проверьте число (0–100).");
      return;
    }
    const data = await res.json();
    setUpdatedAt(data.updatedAt ? String(data.updatedAt) : null);
    setMsg("Сохранено. Публичный калькулятор подхватит значение при следующей загрузке страницы.");
  }

  if (loading) {
    return <p className="text-[var(--muted)]">Загрузка…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text)]">Настройки калькулятора</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        Годовой расчётный параметр (для отображения на сайте в связке с ключевой ставкой). Посетители
        не могут менять его в калькуляторе — только просматривают.
      </p>

      <form onSubmit={save} className="mt-8 max-w-md space-y-4">
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Годовой расчётный параметр, %</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            required
            className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2"
            value={annualSchedulePercent}
            onChange={(e) => setAnnualSchedulePercent(e.target.value)}
          />
        </label>
        {updatedAt && (
          <p className="text-xs text-[var(--muted)]">
            Обновлено: {new Date(updatedAt).toLocaleString("ru-RU")}
          </p>
        )}
        {msg && (
          <p
            className={`text-sm ${msg.startsWith("Ошибка") ? "text-red-600" : "text-[var(--accent)]"}`}
          >
            {msg}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
