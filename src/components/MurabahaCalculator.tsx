"use client";

import { useMemo, useState } from "react";
import {
  calculateMurabahaSchedule,
  percentToUnit,
} from "@/lib/murabahaCalculator";

type Props = {
  compact?: boolean;
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function MurabahaCalculator({ compact }: Props) {
  const defaultRate = Number(
    process.env.NEXT_PUBLIC_DEFAULT_KEY_RATE_PERCENT ?? "16",
  );

  const [price, setPrice] = useState(8_000_000);
  const [down, setDown] = useState(1_600_000);
  const [months, setMonths] = useState(240);
  const [annualParam, setAnnualParam] = useState(defaultRate);

  const result = useMemo(() => {
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

  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
          : "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm"
      }
    >
      <h3 className="text-lg font-semibold text-[var(--text)]">
        Калькулятор отсроченной цены (Мурабаха)
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Расчёт ежемесячного взноса по согласованной с банком отсроченной цене. Параметры
        подобраны так, чтобы соответствовать классической ипотечной модели при той же
        ключевой ставке (без отображения процентов и пеней в интерфейсе).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">Стоимость жилья, ₽</span>
          <input
            type="number"
            min={100_000}
            className="rounded-lg border border-[var(--border)] px-3 py-2"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">Первоначальный взнос, ₽</span>
          <input
            type="number"
            min={0}
            className="rounded-lg border border-[var(--border)] px-3 py-2"
            value={down}
            onChange={(e) => setDown(Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">Срок рассрочки, мес.</span>
          <input
            type="number"
            min={12}
            max={360}
            className="rounded-lg border border-[var(--border)] px-3 py-2"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">
            Годовой расчётный параметр (ключевая ставка), %
          </span>
          <input
            type="number"
            min={0}
            step={0.1}
            className="rounded-lg border border-[var(--border)] px-3 py-2"
            value={annualParam}
            onChange={(e) => setAnnualParam(Number(e.target.value))}
          />
        </label>
      </div>

      {result && (
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

      {result === null && (
        <p className="mt-4 text-sm text-red-600">Проверьте введённые значения.</p>
      )}
    </div>
  );
}
