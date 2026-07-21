import { z } from "zod";
import {
  ERROR_FIELD_TEXT_COLOR,
  isValidHexColor,
  normalizeHexColor,
  suggestAccessibleTextColor,
  suggestFocusBackground,
  WCAG_AA_CONTRAST_MIN,
  evaluateContrast,
} from "@/lib/a11y/contrast";

const hexColorPattern = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export { ERROR_FIELD_TEXT_COLOR, WCAG_AA_CONTRAST_MIN };

export const DEFAULT_ERROR_FIELD_COLORS = {
  field_background: "#fdebec",
  field_background_focus: "#f5c2c7",
} as const;

export type ErrorFieldColors = {
  field_background: string;
  field_background_focus: string;
  field_text?: string;
};

export const errorColorsSchema = z
  .object({
    field_background: z
      .string()
      .trim()
      .regex(hexColorPattern, "Use a hex color such as #fdebec."),
    field_background_focus: z
      .string()
      .trim()
      .regex(hexColorPattern, "Use a hex color such as #f5c2c7."),
    field_text: z
      .string()
      .trim()
      .regex(hexColorPattern, "Use a hex color such as #20201d.")
      .optional(),
  })
  .strict();

export function getRecommendedFieldTextColor(
  colors: Pick<ErrorFieldColors, "field_background" | "field_background_focus">,
): string {
  const backgrounds = [
    colors.field_background,
    colors.field_background_focus,
  ];

  const defaultPasses = backgrounds.every((background) => {
    const result = evaluateContrast(ERROR_FIELD_TEXT_COLOR, background);
    return result?.passes ?? false;
  });

  if (defaultPasses) {
    return ERROR_FIELD_TEXT_COLOR;
  }

  return suggestAccessibleTextColor(backgrounds);
}

export function resolveFieldTextColor(colors: ErrorFieldColors): string {
  const normalized = colors.field_text
    ? normalizeHexColor(colors.field_text)
    : null;
  if (normalized) return normalized;
  return getRecommendedFieldTextColor(colors);
}

export function isCustomFieldTextColor(colors: ErrorFieldColors): boolean {
  if (!colors.field_text) return false;
  const normalized = normalizeHexColor(colors.field_text);
  if (!normalized) return false;
  return (
    normalized !==
    normalizeHexColor(getRecommendedFieldTextColor(colors))
  );
}

export function mergeErrorFieldColors(
  stored?: Partial<ErrorFieldColors> | null,
): ErrorFieldColors {
  const merged: ErrorFieldColors = {
    field_background:
      stored?.field_background ?? DEFAULT_ERROR_FIELD_COLORS.field_background,
    field_background_focus:
      stored?.field_background_focus ??
      DEFAULT_ERROR_FIELD_COLORS.field_background_focus,
  };

  merged.field_text =
    stored?.field_text && normalizeHexColor(stored.field_text)
      ? normalizeHexColor(stored.field_text)!
      : getRecommendedFieldTextColor(merged);

  return merged;
}

export function serializeErrorFieldColors(
  colors: ErrorFieldColors,
): ErrorFieldColors {
  const serialized: ErrorFieldColors = {
    field_background:
      normalizeHexColor(colors.field_background) ?? colors.field_background,
    field_background_focus:
      normalizeHexColor(colors.field_background_focus) ??
      colors.field_background_focus,
  };

  const textColor = resolveFieldTextColor(colors);
  if (normalizeHexColor(textColor)) {
    serialized.field_text = textColor;
  }

  return serialized;
}

export function applyBackgroundColorChange(
  current: ErrorFieldColors,
  nextBackground: string,
  options: { syncFocus?: boolean; syncText?: boolean } = {},
): ErrorFieldColors {
  const syncFocus = options.syncFocus ?? true;
  const syncText = options.syncText ?? true;
  const normalized = normalizeHexColor(nextBackground);
  const next: ErrorFieldColors = {
    ...current,
    field_background: normalized ?? nextBackground,
  };

  if (normalized && syncFocus) {
    const textColor = resolveFieldTextColor(current);
    const suggested = suggestFocusBackground(normalized, textColor);
    if (suggested) {
      next.field_background_focus = suggested;
    }
  }

  if (syncText) {
    next.field_text = getRecommendedFieldTextColor(next);
  }

  return next;
}

export function validateErrorFieldContrast(colors: ErrorFieldColors): string | null {
  if (!isValidHexColor(colors.field_background)) {
    return "Invalid field background must be a valid hex color.";
  }
  if (!isValidHexColor(colors.field_background_focus)) {
    return "Invalid field focus background must be a valid hex color.";
  }

  const textColor = resolveFieldTextColor(colors);
  if (!isValidHexColor(textColor)) {
    return "Field text color must be a valid hex color.";
  }

  const backgroundCheck = evaluateContrast(textColor, colors.field_background);
  if (backgroundCheck && !backgroundCheck.passes) {
    return `Field text color must meet WCAG AA contrast of ${WCAG_AA_CONTRAST_MIN}:1 against the invalid field background (${backgroundCheck.ratio.toFixed(1)}:1).`;
  }

  const focusCheck = evaluateContrast(textColor, colors.field_background_focus);
  if (focusCheck && !focusCheck.passes) {
    return `Field text color must meet WCAG AA contrast of ${WCAG_AA_CONTRAST_MIN}:1 against the invalid field focus background (${focusCheck.ratio.toFixed(1)}:1).`;
  }

  return null;
}
