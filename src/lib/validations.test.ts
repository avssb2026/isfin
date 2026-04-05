import { describe, expect, it } from "vitest";
import {
  activityNoteSchema,
  chatMessageSchema,
  chatPreSchema,
  leadApplicationSchema,
  leadPatchSchema,
  leadStatusSchema,
} from "./validations";

/** Валидные JSON-подобные объекты → успешный parse и снимок данных */
const leadApplicationValid: Array<{ name: string; in: unknown; out: object }> = [
  {
    name: "типовая заявка",
    in: {
      lastName: "Иванов",
      firstName: "Иван",
      phone: "+79001234567",
    },
    out: {
      lastName: "Иванов",
      firstName: "Иван",
      phone: "+79001234567",
    },
  },
  {
    name: "телефон с пробелами и скобками",
    in: {
      lastName: "Петров",
      firstName: "Пётр",
      phone: "+7 (900) 123-45-67",
    },
    out: {
      lastName: "Петров",
      firstName: "Пётр",
      phone: "+7 (900) 123-45-67",
    },
  },
];

const leadApplicationInvalid: Array<{ name: string; in: unknown }> = [
  { name: "короткий телефон", in: { lastName: "А", firstName: "Б", phone: "123" } },
  { name: "пустая фамилия", in: { lastName: "", firstName: "Б", phone: "+79001234567" } },
  { name: "буквы в телефоне", in: { lastName: "А", firstName: "Б", phone: "+7900abc4567" } },
];

describe("leadApplicationSchema", () => {
  it.each(leadApplicationValid)("$name → success", ({ in: input, out }) => {
    const r = leadApplicationSchema.safeParse(input);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual(out);
  });

  it.each(leadApplicationInvalid)("$name → fail", ({ in: input }) => {
    expect(leadApplicationSchema.safeParse(input).success).toBe(false);
  });
});

const chatPreValid: Array<{ name: string; in: unknown; out: object }> = [
  {
    name: "пре-чат",
    in: { visitorName: "Мария", visitorPhone: "+79876543210" },
    out: { visitorName: "Мария", visitorPhone: "+79876543210" },
  },
];

describe("chatPreSchema", () => {
  it.each(chatPreValid)("$name", ({ in: input, out }) => {
    const r = chatPreSchema.safeParse(input);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual(out);
  });

  it("пустое имя → fail", () => {
    expect(
      chatPreSchema.safeParse({ visitorName: "", visitorPhone: "+79876543210" }).success,
    ).toBe(false);
  });
});

describe("chatMessageSchema", () => {
  it("непустое тело → ok", () => {
    const r = chatMessageSchema.safeParse({ body: "Здравствуйте" });
    expect(r.success).toBe(true);
  });

  it("пустое тело → fail", () => {
    expect(chatMessageSchema.safeParse({ body: "" }).success).toBe(false);
  });
});

describe("leadStatusSchema", () => {
  it.each(["NEW", "IN_PROGRESS", "CLOSED"] as const)("%s — допустимый статус", (s) => {
    expect(leadStatusSchema.safeParse(s).success).toBe(true);
  });

  it("недопустимое значение → fail", () => {
    expect(leadStatusSchema.safeParse("UNKNOWN").success).toBe(false);
  });
});

/** CUID из набора, проходящий z.string().cuid() в Zod 3 */
const SAMPLE_CUID = "cjld2cjxh0000qzrmn831i7rn";

describe("leadPatchSchema", () => {
  it.each([
    {
      name: "только статус",
      in: { status: "NEW" as const },
      ok: true,
    },
    {
      name: "только назначение оператора",
      in: { assignedOperatorId: SAMPLE_CUID },
      ok: true,
    },
    {
      name: "снятие оператора",
      in: { assignedOperatorId: null },
      ok: true,
    },
    {
      name: "статус и оператор",
      in: { status: "IN_PROGRESS" as const, assignedOperatorId: SAMPLE_CUID },
      ok: true,
    },
    {
      name: "пустой объект",
      in: {},
      ok: false,
    },
    {
      name: "невалидный cuid",
      in: { assignedOperatorId: "not-a-cuid" },
      ok: false,
    },
  ])("$name → ok=$ok", ({ in: input, ok }) => {
    expect(leadPatchSchema.safeParse(input).success).toBe(ok);
  });
});

describe("activityNoteSchema", () => {
  it("непустая заметка → ok", () => {
    const r = activityNoteSchema.safeParse({ note: "Позвонить завтра" });
    expect(r.success).toBe(true);
  });

  it("пустая заметка → fail", () => {
    expect(activityNoteSchema.safeParse({ note: "" }).success).toBe(false);
  });
});
