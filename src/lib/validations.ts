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
