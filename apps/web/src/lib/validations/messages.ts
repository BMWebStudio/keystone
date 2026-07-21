import { z } from "zod";

export const VALIDATION_MESSAGE_KEYS = [
  "required",
  "email",
  "minLength",
  "maxLength",
  "pattern",
] as const;

export type ValidationMessageKey = (typeof VALIDATION_MESSAGE_KEYS)[number];

export const DEFAULT_VALIDATION_MESSAGES: Record<ValidationMessageKey, string> =
  {
    required: "Complete this field.",
    email: "Enter an email address in the format name@example.com.",
    minLength: "Enter more characters.",
    maxLength: "Enter fewer characters.",
    pattern: "Use the requested format.",
  };

export const VALIDATION_MESSAGE_LABELS: Record<ValidationMessageKey, string> = {
  required: "Required field",
  email: "Email format",
  minLength: "Minimum length",
  maxLength: "Maximum length",
  pattern: "Pattern format",
};

export const validationMessagesSchema = z
  .object({
    required: z.string().trim().min(1).max(500),
    email: z.string().trim().min(1).max(500),
    minLength: z.string().trim().min(1).max(500),
    maxLength: z.string().trim().min(1).max(500),
    pattern: z.string().trim().min(1).max(500),
  })
  .partial();

export type ValidationMessages = Partial<
  Record<ValidationMessageKey, string>
>;

export function mergeValidationMessages(
  saved: ValidationMessages | null | undefined,
): Record<ValidationMessageKey, string> {
  return { ...DEFAULT_VALIDATION_MESSAGES, ...saved };
}
