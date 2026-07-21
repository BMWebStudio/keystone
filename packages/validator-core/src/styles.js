const STYLE_ID = "a11y-validator-styles";

/** WCAG AA (4.5:1+) error palette for injected validator styles. */
export const errorStyleTokens = {
  surface: "#fdebec",
  surfaceFocus: "#f5c2c7",
  border: "#8a2329",
  borderFocus: "#6b1a22",
  text: "#6b1a22",
  summarySurface: "#fdebec",
  summaryBorder: "#8a2329",
};

function normalizeColor(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(trimmed) ? trimmed : null;
}

export function resolveErrorStyleTokens(overrides = {}) {
  const fieldBackground =
    normalizeColor(overrides.fieldBackground) ??
    normalizeColor(overrides.field_background) ??
    errorStyleTokens.surface;
  const fieldBackgroundFocus =
    normalizeColor(overrides.fieldBackgroundFocus) ??
    normalizeColor(overrides.field_background_focus) ??
    errorStyleTokens.surfaceFocus;

  return {
    ...errorStyleTokens,
    surface: fieldBackground,
    surfaceFocus: fieldBackgroundFocus,
    summarySurface: fieldBackground,
  };
}

export function injectDefaultStyles(overrides = {}) {
  if (typeof document === "undefined") return;

  const existing = document.getElementById(STYLE_ID);
  if (existing) existing.remove();

  const t = resolveErrorStyleTokens(overrides);
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
input.a11y-field-invalid,
select.a11y-field-invalid,
textarea.a11y-field-invalid,
input[aria-invalid="true"],
select[aria-invalid="true"],
textarea[aria-invalid="true"] {
  background-color: ${t.surface};
  border-color: ${t.border};
  color: #20201d;
  box-shadow: 0 0 0 1px ${t.border};
}

input.a11y-field-invalid:focus-visible,
select.a11y-field-invalid:focus-visible,
textarea.a11y-field-invalid:focus-visible,
input[aria-invalid="true"]:focus-visible,
select[aria-invalid="true"]:focus-visible,
textarea[aria-invalid="true"]:focus-visible {
  background-color: ${t.surfaceFocus};
  border-color: ${t.borderFocus};
  box-shadow: 0 0 0 1px ${t.borderFocus};
  outline: 3px solid ${t.borderFocus};
  outline-offset: 2px;
}

.a11y-field-error {
  margin: 0.25rem 0 0;
  color: ${t.text};
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.45;
}

.a11y-error-summary {
  margin-bottom: 1rem;
  padding: 1rem;
  background: ${t.summarySurface};
  border-left: 4px solid ${t.summaryBorder};
  border-radius: 0.25rem;
  color: ${t.text};
}

.a11y-error-summary h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: ${t.text};
}

.a11y-error-summary a {
  color: ${t.text};
  font-weight: 700;
}

.a11y-error-summary a:focus-visible {
  outline: 3px solid ${t.borderFocus};
  outline-offset: 2px;
}
`.trim();

  document.head.append(style);
}
