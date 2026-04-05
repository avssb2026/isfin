import { describe, expect, it } from "vitest";
import {
  calculateMurabahaSchedule,
  percentToUnit,
  type MurabahaInput,
} from "./murabahaCalculator";

/** Таблица валидных пар вход → ожидаемые численные результаты (TDD: контракт поведения). */
const validCases: Array<{
  name: string;
  input: MurabahaInput;
  expected: {
    financedAmount: number;
    monthlyPayment: number;
    totalDeferredPrice: number;
    totalMarkup: number;
  };
}> = [
  {
    name: "нулевой годовой параметр: равные доли, без маржи",
    input: {
      propertyPrice: 1_000_000,
      downPayment: 200_000,
      termMonths: 120,
      annualScheduleParameter: 0,
    },
    expected: {
      financedAmount: 800_000,
      monthlyPayment: 800_000 / 120,
      totalDeferredPrice: 800_000,
      totalMarkup: 0,
    },
  },
  {
    name: "16% годовых, 8 млн финансирования, 240 мес. (золотой эталон из текущей формулы)",
    input: {
      propertyPrice: 10_000_000,
      downPayment: 2_000_000,
      termMonths: 240,
      annualScheduleParameter: percentToUnit(16),
    },
    expected: {
      financedAmount: 8_000_000,
      monthlyPayment: 111_300.4752021691,
      totalDeferredPrice: 26_712_114.048520584,
      totalMarkup: 18_712_114.048520584,
    },
  },
  {
    name: "минимальный положительный срок и взнос",
    input: {
      propertyPrice: 100_000,
      downPayment: 10_000,
      termMonths: 1,
      annualScheduleParameter: 0,
    },
    expected: {
      financedAmount: 90_000,
      monthlyPayment: 90_000,
      totalDeferredPrice: 90_000,
      totalMarkup: 0,
    },
  },
];

const invalidCases: Array<{ name: string; input: MurabahaInput; errorSubstring: string }> = [
  {
    name: "нулевая или отрицательная стоимость",
    input: {
      propertyPrice: 0,
      downPayment: 0,
      termMonths: 12,
      annualScheduleParameter: 0,
    },
    errorSubstring: "Некорректные",
  },
  {
    name: "отрицательный взнос",
    input: {
      propertyPrice: 100_000,
      downPayment: -1,
      termMonths: 12,
      annualScheduleParameter: 0,
    },
    errorSubstring: "Некорректные",
  },
  {
    name: "нулевой срок",
    input: {
      propertyPrice: 100_000,
      downPayment: 0,
      termMonths: 0,
      annualScheduleParameter: 0,
    },
    errorSubstring: "Некорректные",
  },
  {
    name: "взнос не меньше цены",
    input: {
      propertyPrice: 100_000,
      downPayment: 100_000,
      termMonths: 12,
      annualScheduleParameter: 0,
    },
    errorSubstring: "Первоначальный взнос",
  },
];

describe("calculateMurabahaSchedule (таблицы вход/выход)", () => {
  it.each(validCases)("$name", ({ input, expected }) => {
    const r = calculateMurabahaSchedule(input);
    expect(r.financedAmount).toBe(expected.financedAmount);
    expect(r.monthlyPayment).toBeCloseTo(expected.monthlyPayment, 5);
    expect(r.totalDeferredPrice).toBeCloseTo(expected.totalDeferredPrice, 3);
    expect(r.totalMarkup).toBeCloseTo(expected.totalMarkup, 3);
  });

  it.each(invalidCases)("$name → throw", ({ input, errorSubstring }) => {
    expect(() => calculateMurabahaSchedule(input)).toThrow(errorSubstring);
  });
});

describe("percentToUnit", () => {
  it.each([
    [16, 0.16],
    [7.5, 0.075],
    [0, 0],
    [100, 1],
  ] as const)("percentToUnit(%s) === %s", (percent, unit) => {
    expect(percentToUnit(percent)).toBe(unit);
  });
});
