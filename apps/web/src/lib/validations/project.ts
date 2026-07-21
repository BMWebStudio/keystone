import { z } from "zod";
import { validationMessagesSchema } from "@/lib/validations/messages";

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(100),
  domain: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || undefined),
});

export const projectUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  domain: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
  is_active: z.boolean().optional(),
  validation_mode: z.enum(["submit", "blur", "change"]).optional(),
  show_error_summary: z.boolean().optional(),
  disable_native_validation: z.boolean().optional(),
  messages: validationMessagesSchema.optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
