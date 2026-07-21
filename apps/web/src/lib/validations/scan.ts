import { z } from "zod";

const scanIssueSchema = z.object({
  severity: z.string(),
  title: z.string().trim().min(1),
  selector: z.string().trim().min(1),
  message: z.string().trim().min(1),
});

export const scanCreateSchema = z.object({
  form_identifier: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || undefined),
  error_count: z.number().int().min(0),
  warning_count: z.number().int().min(0),
  passed_count: z.number().int().min(0),
  results: z.array(scanIssueSchema).max(500),
});

export const scanPublicCreateSchema = scanCreateSchema.extend({
  public_key: z.string().trim().min(1).max(64),
});

export type ScanCreateInput = z.infer<typeof scanCreateSchema>;
export type ScanPublicCreateInput = z.infer<typeof scanPublicCreateSchema>;
