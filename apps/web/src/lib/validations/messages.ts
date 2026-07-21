import { z } from "zod";

/** Messages editable in project settings. */
export const PROJECT_SETTINGS_MESSAGE_KEYS = [
  "required",
  "email",
  "name",
  "phone",
  "url",
  "minLength",
  "maxLength",
] as const;

export type ProjectSettingsMessageKey =
  (typeof PROJECT_SETTINGS_MESSAGE_KEYS)[number];

/** Full message keys supported by the validator (includes pattern fallback). */
export const VALIDATION_MESSAGE_KEYS = [
  ...PROJECT_SETTINGS_MESSAGE_KEYS,
  "pattern",
] as const;

export type ValidationMessageKey = (typeof VALIDATION_MESSAGE_KEYS)[number];

export const DEFAULT_VALIDATION_MESSAGES: Record<ValidationMessageKey, string> =
  {
    required: "This field is required!",
    email: "Enter an email address in the format name@example.com.",
    name: "Enter your name.",
    phone: "Enter a valid phone number.",
    url: "Enter a valid website URL.",
    pattern: "Use the requested format.",
    minLength: "Enter more characters.",
    maxLength: "Enter fewer characters.",
  };

export const PROJECT_SETTINGS_MESSAGE_LABELS: Record<
  ProjectSettingsMessageKey,
  string
> = {
  required: "Required field",
  email: "Email format",
  name: "Name fields",
  phone: "Phone fields",
  url: "URL fields",
  minLength: "Minimum length",
  maxLength: "Maximum length",
};

export const PROJECT_SETTINGS_MESSAGE_DESCRIPTIONS: Partial<
  Record<ProjectSettingsMessageKey, string>
> = {
  name: "Applied to fields inferred as name inputs from type, autocomplete, name, or id.",
  phone: "Applied to tel inputs and fields inferred as phone numbers.",
  url: "Applied to url inputs and fields inferred as website addresses.",
  minLength: "Used when a field has a minlength attribute.",
  maxLength: "Used when a field has a maxlength attribute.",
};

export const validationMessagesSchema = z
  .object({
    required: z.string().trim().min(1).max(500),
    email: z.string().trim().min(1).max(500),
    name: z.string().trim().min(1).max(500),
    phone: z.string().trim().min(1).max(500),
    url: z.string().trim().min(1).max(500),
    pattern: z.string().trim().min(1).max(500),
    minLength: z.string().trim().min(1).max(500),
    maxLength: z.string().trim().min(1).max(500),
  })
  .partial();

export type ValidationMessages = Partial<
  Record<ValidationMessageKey, string>
>;

export function mergeValidationMessages(
  saved: ValidationMessages | null | undefined,
): Record<ProjectSettingsMessageKey, string> {
  const defaults = Object.fromEntries(
    PROJECT_SETTINGS_MESSAGE_KEYS.map((key) => [
      key,
      DEFAULT_VALIDATION_MESSAGES[key],
    ]),
  ) as Record<ProjectSettingsMessageKey, string>;

  const merged = { ...defaults };
  for (const key of PROJECT_SETTINGS_MESSAGE_KEYS) {
    if (saved?.[key]) merged[key] = saved[key]!;
  }
  return merged;
}

/** Persist only project-settings keys; pattern is field-level via HTML attributes. */
export function serializeProjectSettingsMessages(
  messages: Record<ProjectSettingsMessageKey, string>,
): Record<ProjectSettingsMessageKey, string> {
  return PROJECT_SETTINGS_MESSAGE_KEYS.reduce(
    (acc, key) => {
      const value = messages[key]?.trim();
      acc[key] = value || DEFAULT_VALIDATION_MESSAGES[key];
      return acc;
    },
    {} as Record<ProjectSettingsMessageKey, string>,
  );
}

export function sanitizeIncomingMessages(
  messages: ValidationMessages,
): Record<ProjectSettingsMessageKey, string> {
  return serializeProjectSettingsMessages(mergeValidationMessages(messages));
}
