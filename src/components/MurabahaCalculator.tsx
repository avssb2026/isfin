"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateMurabahaSchedule,
  MURABAHA_TERM_MONTHS_MAX,
  MURABAHA_TERM_MONTHS_MIN,
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

  const showOnlyLandingFields = Boolean(compact);

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
    ? "rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] ring-1 ring-black/[0.04]"
    : "rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)] ring-1 ring-black/[0.04]";

  return (
    <div className={padClass}>
      <h3 className="text-lg font-bold tracking-tight text-[var(--text)] sm:text-xl">
        Калькулятор ипотеки «Мурабаха» в рассрочку
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        Расчёт ежемесячного взноса по согласованной с банком отсроченной цене.
      </p>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-6 sm:gap-x-8 sm:gap-y-8">
        <div className="flex min-w-0 flex-col gap-5 text-sm sm:gap-6">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(6.25rem,auto)] items-baseline gap-x-2 sm:grid-cols-[minmax(0,1fr)_minmax(7.5rem,auto)] sm:gap-x-3">
              <span className="min-w-0 font-medium leading-snug text-[var(--text-secondary)]">
                Стоимость жилья
              </span>
              <span className="text-right font-semibold tabular-nums text-[var(--text)]">
                {formatMoney(price)}&nbsp;₽
              </span>
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

          <div className="flex min-w-0 flex-col gap-2">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(6.25rem,auto)] items-baseline gap-x-2 sm:grid-cols-[minmax(0,1fr)_minmax(7.5rem,auto)] sm:gap-x-3">
              <span className="min-w-0 font-medium leading-snug text-[var(--text-secondary)]">
                Первоначальный взнос
              </span>
              <span className="text-right font-semibold tabular-nums text-[var(--text)]">
                {formatMoney(down)}&nbsp;₽
              </span>
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
        </div>

        {!showOnlyLandingFields && (
          <label className="flex w-[7rem] shrink-0 flex-col gap-2 text-sm sm:w-[12rem]">
            <span className="font-medium leading-snug text-[var(--text-secondary)]">
              Срок рассрочки, мес.
            </span>
            <input
              type="number"
              min={MURABAHA_TERM_MONTHS_MIN}
              max={MURABAHA_TERM_MONTHS_MAX}
              className="input-modern w-full min-w-0"
              value={months}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isNaN(v)) return;
                setMonths(
                  Math.min(
                    MURABAHA_TERM_MONTHS_MAX,
                    Math.max(MURABAHA_TERM_MONTHS_MIN, Math.round(v)),
                  ),
                );
              }}
            />
          </label>
        )}

        <div className="col-span-2 rounded-[var(--radius-xl)] border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-3.5 text-sm">
          <p className="font-medium text-[var(--text)]">
            Годовой расчётный параметр (ключевая ставка):{" "}
            {rateLoading || annualParam === null ? (
              <span className="text-[var(--muted)]">загрузка…</span>
            ) : (
              <span>{annualParam.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} %</span>
            )}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Значение задаётся банком на основании ключевой ставки ЦБ РФ и отображается справочно.
          </p>
        </div>
      </div>

      {result && annualParam !== null && (
        <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 sm:row-span-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
              Ежемесячный взнос
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-[var(--text)]">
              {formatMoney(result.monthlyPayment)} ₽
            </dd>
          </div>
          {!showOnlyLandingFields && (
            <>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg)] p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Сумма финансирования
                </dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-[var(--text)]">
                  {formatMoney(result.financedAmount)} ₽
                </dd>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg)] p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Итоговая отсроченная цена
                </dt>
                <dd className="mt-1 font-semibold tabular-nums text-[var(--text)]">
                  {formatMoney(result.totalDeferredPrice)} ₽
                </dd>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg)] p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Надбавка банка (маржа)
                </dt>
                <dd className="mt-1 font-semibold tabular-nums text-[var(--text)]">
                  {formatMoney(result.totalMarkup)} ₽
                </dd>
              </div>
            </>
          )}
        </dl>
      )}

      {result === null && annualParam !== null && (
        <p className="mt-4 text-sm text-red-600">Проверьте введённые значения.</p>
      )}
    </div>
  );
}
