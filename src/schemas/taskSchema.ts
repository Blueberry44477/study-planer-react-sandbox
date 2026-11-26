import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Назва завдання обов'язкова"),
  description: z.string().trim(),
  category: z.string().trim().min(1, "Вкажіть категорію"),
  priority: z.enum(["low", "medium", "high"]),
});

export type TaskFormData = z.infer<typeof taskSchema>;
