/** Default invalid-field text color from the drop-in validator stylesheet. */
export const ERROR_FIELD_TEXT_COLOR = "#20201d";

export const WCAG_AA_CONTRAST_MIN = 4.5;

type Rgb = { r: number; g: number; b: number };

const HEX_PATTERN = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_PATTERN.test(value.trim());
}

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  const match = trimmed.match(HEX_PATTERN);
  if (!match) return null;

  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  return `#${hex.toLowerCase()}`;
}

function hexToRgb(hex: string): Rgb | null {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;

  const value = normalized.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");

  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const transform = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)
  );
}

export function getContrastRatio(foreground: string, background: string): number | null {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) return null;

  const fgLuminance = relativeLuminance(fg);
  const bgLuminance = relativeLuminance(bg);
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastResult = {
  ratio: number;
  passes: boolean;
  minimum: number;
};

export function evaluateContrast(
  foreground: string,
  background: string,
  minimum = WCAG_AA_CONTRAST_MIN,
): ContrastResult | null {
  const ratio = getContrastRatio(foreground, background);
  if (ratio === null) return null;

  return {
    ratio,
    passes: ratio >= minimum,
    minimum,
  };
}

function mixRgb(a: Rgb, b: Rgb, amount: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  };
}

/**
 * Suggest a focus background that stays distinguishable from the base color
 * while meeting WCAG AA contrast against the field text color.
 */
export function suggestFocusBackground(
  baseBackground: string,
  textColor = ERROR_FIELD_TEXT_COLOR,
  minimum = WCAG_AA_CONTRAST_MIN,
): string | null {
  const base = hexToRgb(baseBackground);
  const text = hexToRgb(textColor);
  if (!base || !text) return null;

  const black: Rgb = { r: 0, g: 0, b: 0 };
  const white: Rgb = { r: 255, g: 255, b: 255 };

  for (const target of [black, white]) {
    for (let step = 0.05; step <= 0.9; step += 0.05) {
      const candidate = rgbToHex(mixRgb(base, target, step));
      const ratio = getContrastRatio(textColor, candidate);
      const baseRatio = getContrastRatio(textColor, baseBackground);
      if (
        ratio !== null &&
        ratio >= minimum &&
        candidate !== normalizeHexColor(baseBackground) &&
        Math.abs(ratio - (baseRatio ?? 0)) >= 0.1
      ) {
        return candidate;
      }
    }
  }

  return normalizeHexColor(baseBackground);
}

export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

const TEXT_COLOR_CANDIDATES = [
  ERROR_FIELD_TEXT_COLOR,
  "#000000",
  "#ffffff",
  "#6b1a22",
];

function buildTextColorCandidates(): string[] {
  const candidates = [...TEXT_COLOR_CANDIDATES];
  for (let step = 0; step <= 255; step += 17) {
    const channel = step.toString(16).padStart(2, "0");
    candidates.push(`#${channel}${channel}${channel}`);
  }
  return candidates;
}

/**
 * Pick a text color that meets WCAG AA against every background.
 * Prefers the highest minimum contrast ratio across all backgrounds.
 */
export function suggestAccessibleTextColor(
  backgrounds: string[],
  minimum = WCAG_AA_CONTRAST_MIN,
): string {
  const normalizedBackgrounds = backgrounds
    .map((background) => normalizeHexColor(background))
    .filter(Boolean) as string[];

  if (!normalizedBackgrounds.length) {
    return ERROR_FIELD_TEXT_COLOR;
  }

  let bestPassing: { color: string; minRatio: number } | null = null;
  let bestEffort: { color: string; minRatio: number } | null = null;

  for (const candidate of buildTextColorCandidates()) {
    const normalized = normalizeHexColor(candidate);
    if (!normalized) continue;

    const ratios = normalizedBackgrounds.map(
      (background) => getContrastRatio(normalized, background) ?? 0,
    );
    const minRatio = Math.min(...ratios);
    const entry = { color: normalized, minRatio };

    if (!bestEffort || minRatio > bestEffort.minRatio) {
      bestEffort = entry;
    }

    if (minRatio >= minimum && (!bestPassing || minRatio > bestPassing.minRatio)) {
      bestPassing = entry;
    }
  }

  return bestPassing?.color ?? bestEffort?.color ?? ERROR_FIELD_TEXT_COLOR;
}
