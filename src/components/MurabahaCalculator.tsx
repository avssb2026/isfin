"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateMurabahaSchedule,
  percentToUnit,
} from "@/lib/murabahaCalculator";

type Props = {
  compact?: boolean;
};

const PRICE_MIN = 500_000;
const PRICE_MAX = 50_000_000;
const PRICE_STEP = 100_000;
/** Минимальная сумма под финансирование — взнос не может быть «почти вся цена» */
const MIN_FINANCED = 100_000;
const DOWN_STEP = 50_000;

function formatMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function clampDown(price: number, down: number): number {
  const maxDown = Math.max(0, price - MIN_FINANCED);
  return Math.min(Math.max(0, down), maxDown);
}

export function MurabahaCalculator({ compact }: Props) {
  const fallbackRate = Number(
    process.env.NEXT_PUBLIC_DEFAULT_KEY_RATE_PERCENT ?? "16",
  );

  const [price, setPrice] = useState(8_000_000);
  const [down, setDown] = useState(1_600_000);
  const [months, setMonths] = useState(240);
  const [annualParam, setAnnualParam] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/public/calculator-settings", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("fetch");
        const data = (await res.json()) as { annualSchedulePercent?: number };
        const p = data.annualSchedulePercent;
        setAnnualParam(typeof p === "number" && !Number.isNaN(p) ? p : fallbackRate);
      } catch {
        setAnnualParam(fallbackRate);
      } finally {
        setRateLoading(false);
      }
    })();
  }, [fallbackRate]);

  const maxDown = useMemo(() => Math.max(0, price - MIN_FINANCED), [price]);

  useEffect(() => {
    setDown((d) => clampDown(price, d));
  }, [price]);

  const result = useMemo(() => {
    if (annualParam === null) return null;
    try {
      return calculateMurabahaSchedule({
        propertyPrice: price,
        downPayment: down,
        termMonths: months,
        annualScheduleParameter: percentToUnit(annualParam),
      });
    } catch {
      return null;
    }
  }, [price, down, months, annualParam]);

  const padClass = compact
    ? "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    : "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm";

  return (
    <div className={padClass}>
      <h3 className="text-lg font-semibold text-[var(--text)]">
        Калькулятор отсроченной цены (Мурабаха)
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Расчёт ежемесячного взноса по согласованной с банком отсроченной цене. Параметры подобраны
        так, чтобы соответствовать классической ипотечной модели при той же ключевой ставке (без
        отображения процентов и пеней в интерфейсе).
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[var(--muted)]">Стоимость жилья</span>
            <span className="font-semibold text-[var(--text)]">{formatMoney(price)} ₽</span>
          </div>
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
            aria-label="Стоимость жилья"
          />
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>{formatMoney(PRICE_MIN)} ₽</span>
            <span>{formatMoney(PRICE_MAX)} ₽</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[var(--muted)]">Первоначальный взнос</span>
            <span className="font-semibold text-[var(--text)]">{formatMoney(down)} ₽</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxDown}
            step={DOWN_STEP}
            value={clampDown(price, down)}
            onChange={(e) => setDown(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
            aria-label="Первоначальный взнос"
            disabled={maxDown <= 0}
          />
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>0 ₽</span>
            <span>{formatMoney(maxDown)} ₽</span>
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-[var(--muted)]">Срок рассрочки, мес.</span>
          <input
            type="number"
            min={12}
            max={360}
            className="max-w-xs rounded-lg border border-[var(--border)] px-3 py-2"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          />
        </label>

        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm sm:col-span-2">
          <p className="font-medium text-[var(--text)]">
            Годовой расчётный параметр (ключевая ставка):{" "}
            {rateLoading || annualParam === null ? (
              <span className="text-[var(--muted)]">загрузка…</span>
            ) : (
              <span>{annualParam.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} %</span>
            )}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Значение задаётся банком и отображается для ориентира. Изменить его может только
            оператор в бэк-офисе.
          </p>
        </div>
      </div>

      {result && annualParam !== null && (
        <dl className="mt-6 grid gap-3 rounded-xl bg-[var(--bg)] p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted)]">Сумма финансирования</dt>
            <dd className="text-lg font-semibold">{formatMoney(result.financedAmount)} ₽</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Ежемесячный взнос</dt>
            <dd className="text-lg font-semibold">{formatMoney(result.monthlyPayment)} ₽</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Итоговая отсроченная цена</dt>
            <dd className="font-medium">{formatMoney(result.totalDeferredPrice)} ₽</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Надбавка банка (маржа)</dt>
            <dd className="font-medium">{formatMoney(result.totalMarkup)} ₽</dd>
          </div>
        </dl>
      )}

      {result === null && annualParam !== null && (
        <p className="mt-4 text-sm text-red-600">Проверьте введённые значения.</p>
      )}
    </div>
  );
}
