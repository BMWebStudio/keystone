import { z } from "zod";
import {
  ERROR_FIELD_TEXT_COLOR,
  isValidHexColor,
  normalizeHexColor,
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
};

export const errorColorsSchema = z
  .object({
    field_background: z
      .string()
      .trim()
      .regex(hexColorPattern, "Use a hex color such as #fdebec.")
      .optional(),
    field_background_focus: z
      .string()
      .trim()
      .regex(hexColorPattern, "Use a hex color such as #f5c2c7.")
      .optional(),
  })
  .strict();

export function mergeErrorFieldColors(
  stored?: Partial<ErrorFieldColors> | null,
): ErrorFieldColors {
  return {
    field_background:
      stored?.field_background ?? DEFAULT_ERROR_FIELD_COLORS.field_background,
    field_background_focus:
      stored?.field_background_focus ??
      DEFAULT_ERROR_FIELD_COLORS.field_background_focus,
  };
}

export function serializeErrorFieldColors(
  colors: ErrorFieldColors,
): Partial<ErrorFieldColors> {
  const payload: Partial<ErrorFieldColors> = {};

  if (colors.field_background !== DEFAULT_ERROR_FIELD_COLORS.field_background) {
    payload.field_background = colors.field_background;
  }
  if (
    colors.field_background_focus !==
    DEFAULT_ERROR_FIELD_COLORS.field_background_focus
  ) {
    payload.field_background_focus = colors.field_background_focus;
  }

  return payload;
}

export function applyBackgroundColorChange(
  current: ErrorFieldColors,
  nextBackground: string,
  syncFocus = true,
): ErrorFieldColors {
  const normalized = normalizeHexColor(nextBackground);
  const next: ErrorFieldColors = {
    ...current,
    field_background: normalized ?? nextBackground,
  };

  if (normalized && syncFocus) {
    const suggested = suggestFocusBackground(normalized);
    if (suggested) {
      next.field_background_focus = suggested;
    }
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

  const backgroundCheck = evaluateContrast(
    ERROR_FIELD_TEXT_COLOR,
    colors.field_background,
  );
  if (backgroundCheck && !backgroundCheck.passes) {
    return `Invalid field background must meet WCAG AA contrast of ${WCAG_AA_CONTRAST_MIN}:1 against field text (${backgroundCheck.ratio.toFixed(1)}:1).`;
  }

  const focusCheck = evaluateContrast(
    ERROR_FIELD_TEXT_COLOR,
    colors.field_background_focus,
  );
  if (focusCheck && !focusCheck.passes) {
    return `Invalid field focus background must meet WCAG AA contrast of ${WCAG_AA_CONTRAST_MIN}:1 against field text (${focusCheck.ratio.toFixed(1)}:1).`;
  }

  return null;
}
