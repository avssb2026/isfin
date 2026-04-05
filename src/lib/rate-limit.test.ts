import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRateLimitStore, rateLimit } from "./rate-limit";

describe("rateLimit (таблица лимитов)", () => {
  beforeEach(() => {
    clearRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    clearRateLimitStore();
  });

  const windowMs = 60_000;

  it.each([
    {
      name: "первые max запросов проходят",
      key: "ip-a",
      max: 3,
      calls: 3,
      expectOk: [true, true, true] as const,
    },
    {
      name: "max+1 блокируется до истечения окна",
      key: "ip-b",
      max: 2,
      calls: 3,
      expectOk: [true, true, false] as const,
    },
  ])("$name", ({ key, max, calls, expectOk }) => {
    const results: boolean[] = [];
    for (let i = 0; i < calls; i++) {
      const r = rateLimit(key, max, windowMs);
      results.push(r.ok);
    }
    expect(results).toEqual([...expectOk]);
  });

  it("после истечения окна счётчик сбрасывается", () => {
    const key = "ip-c";
    expect(rateLimit(key, 1, windowMs).ok).toBe(true);
    expect(rateLimit(key, 1, windowMs).ok).toBe(false);

    vi.advanceTimersByTime(windowMs);

    expect(rateLimit(key, 1, windowMs).ok).toBe(true);
  });

  it("разные ключи независимы", () => {
    expect(rateLimit("k1", 1, windowMs).ok).toBe(true);
    expect(rateLimit("k2", 1, windowMs).ok).toBe(true);
  });
});
