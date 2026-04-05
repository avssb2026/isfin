import { describe, expect, it } from "vitest";
import { calculateMurabahaSchedule, percentToUnit } from "./murabahaCalculator";

describe("calculateMurabahaSchedule", () => {
  it("matches zero-parameter edge (равные доли без надбавки)", () => {
    const r = calculateMurabahaSchedule({
      propertyPrice: 1_000_000,
      downPayment: 200_000,
      termMonths: 120,
      annualScheduleParameter: 0,
    });
    expect(r.financedAmount).toBe(800_000);
    expect(r.monthlyPayment).toBeCloseTo(800_000 / 120, 5);
    expect(r.totalMarkup).toBeCloseTo(0, 5);
  });

  it("returns positive markup for typical parameters", () => {
    const r = calculateMurabahaSchedule({
      propertyPrice: 10_000_000,
      downPayment: 2_000_000,
      termMonths: 240,
      annualScheduleParameter: percentToUnit(16),
    });
    expect(r.monthlyPayment).toBeGreaterThan(0);
    expect(r.totalDeferredPrice).toBeGreaterThan(r.financedAmount);
    expect(r.totalMarkup).toBeGreaterThan(0);
  });
});

describe("percentToUnit", () => {
  it("converts percent", () => {
    expect(percentToUnit(16)).toBe(0.16);
  });
});
