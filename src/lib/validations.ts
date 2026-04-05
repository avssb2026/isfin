import { z } from "zod";

const phoneRu = z
  .string()
  .min(10)
  .max(20)
  .regex(/^[\d+\s()-]+$/, "Некорректный формат телефона");

export const leadApplicationSchema = z.object({
  lastName: z.string().min(1).max(120),
  firstName: z.string().min(1).max(120),
  phone: phoneRu,
});

export const chatPreSchema = z.object({
  visitorName: z.string().min(1).max(120),
  visitorPhone: phoneRu,
});

export const chatMessageSchema = z.object({
  body: z.string().min(1).max(8000),
});

export const leadStatusSchema = z.enum(["NEW", "IN_PROGRESS", "CLOSED"]);

/** Обновление заявки: хотя бы одно поле */
export const leadPatchSchema = z
  .object({
    status: leadStatusSchema.optional(),
    assignedOperatorId: z.string().cuid().nullable().optional(),
  })
  .refine((d) => d.status !== undefined || d.assignedOperatorId !== undefined, {
    message: "Укажите статус или ответственного",
  });


export const activityNoteSchema = z.object({
  note: z.string().min(1).max(8000),
});

/** Годовой расчётный параметр калькулятора, % (например ключевая ставка для модели) */
export const bankSettingsPatchSchema = z.object({
  annualSchedulePercent: z.coerce.number().min(0).max(100),
});

const namePart = z.string().min(1).max(120);

export const bankOperatorCreateSchema = z.object({
  lastName: namePart,
  firstName: namePart,
  patronymic: z.string().max(120).optional().nullable(),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(["OPERATOR", "ADMIN"]),
});

export const bankOperatorUpdateSchema = z
  .object({
    lastName: namePart.optional(),
    firstName: namePart.optional(),
    patronymic: z.string().max(120).nullable().optional(),
    email: z.string().email().max(254).optional(),
    password: z.string().min(8).max(128).optional(),
    role: z.enum(["OPERATOR", "ADMIN"]).optional(),
  })
  .refine(
    (d) =>
      d.lastName !== undefined ||
      d.firstName !== undefined ||
      d.patronymic !== undefined ||
      d.email !== undefined ||
      d.password !== undefined ||
      d.role !== undefined,
    { message: "Укажите хотя бы одно поле" },
  );
