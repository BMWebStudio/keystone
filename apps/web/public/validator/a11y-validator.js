/*! Keystone — universal browser build */
(function (global) {
const rules = {
  required(field) {
    if (field.type === "checkbox") return field.checked;
    if (field.type === "radio")
      return (
        field.form?.querySelector(
          `[name="${CSS.escape(field.name)}"]:checked`,
        ) != null
      );
    return String(field.value ?? "").trim().length > 0;
  },
  email(field) {
    return !field.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
  },
  minLength(field) {
    return !field.value || field.value.length >= field.minLength;
  },
  maxLength(field) {
    return !field.value || field.value.length <= field.maxLength;
  },
  pattern(field) {
    if (!field.value || !field.pattern) return true;
    try {
      return new RegExp(`^(?:${field.pattern})$`).test(field.value);
    } catch {
      return true;
    }
  },
};
function inferRules(field) {
  const list = [];
  if (field.required) list.push("required");
  if (field.type === "email") list.push("email");
  if (field.minLength > 0) list.push("minLength");
  if (field.maxLength > 0) list.push("maxLength");
  if (field.pattern) list.push("pattern");
  return list;
}

/** Default validation copy keyed by inferred field kind and rule. */
const defaultFieldMessages = {
  name: {
    required: "Enter your name.",
    minLength: "Enter your full name.",
    maxLength: "Enter a shorter name.",
  },
  email: {
    required: "Enter your email address.",
    email: "Enter an email address in the format name@example.com.",
  },
  phone: {
    required: "Enter your phone number.",
    pattern: "Enter a valid phone number.",
    minLength: "Enter a complete phone number.",
  },
  company: {
    required: "Enter your company name.",
    minLength: "Enter your full company name.",
  },
  message: {
    required: "Enter your message.",
    minLength: "Enter a longer message.",
    maxLength: "Enter a shorter message.",
  },
  subject: {
    required: "Enter a subject.",
    minLength: "Enter a longer subject.",
  },
  url: {
    required: "Enter a website URL.",
    pattern: "Enter a valid website URL.",
  },
  address: {
    required: "Enter your address.",
    minLength: "Enter your full address.",
  },
  city: {
    required: "Enter your city.",
  },
  state: {
    required: "Enter your state or province.",
  },
  zip: {
    required: "Enter your ZIP or postal code.",
    pattern: "Enter a valid ZIP or postal code.",
  },
  password: {
    required: "Enter your password.",
    minLength: "Use a longer password.",
    pattern: "Use the requested password format.",
  },
};

const AUTOCOMPLETE_KIND = {
  email: "email",
  tel: "phone",
  "tel-national": "phone",
  "tel-local": "phone",
  name: "name",
  "given-name": "name",
  "family-name": "name",
  "additional-name": "name",
  "street-address": "address",
  "address-line1": "address",
  "address-line2": "address",
  "address-level2": "city",
  "address-level1": "state",
  "postal-code": "zip",
  organization: "company",
  "organization-title": "company",
  url: "url",
};

const TYPE_KIND = {
  email: "email",
  tel: "phone",
  url: "url",
  password: "password",
};

const FIELD_ALIASES = {
  name: [
    "name",
    "fullname",
    "givenname",
    "familyname",
    "firstname",
    "lastname",
    "fname",
    "lname",
  ],
  email: ["email", "emailaddress", "mail"],
  phone: ["phone", "tel", "telephone", "mobile", "cell", "fax", "phonenumber"],
  company: ["company", "organization", "organisation", "org", "business", "employer"],
  message: [
    "message",
    "comment",
    "comments",
    "body",
    "inquiry",
    "enquiry",
    "notes",
    "note",
    "description",
  ],
  subject: ["subject", "topic", "title"],
  url: ["url", "website", "site", "homepage", "web"],
  address: ["address", "street", "streetaddress", "addr"],
  city: ["city", "locality", "town"],
  state: ["state", "province", "region"],
  zip: ["zip", "zipcode", "postal", "postalcode", "postcode"],
  password: ["password", "pass", "pwd"],
};

function normalizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function fieldTokens(field) {
  const tokens = [];
  if (field.name) tokens.push(normalizeToken(field.name));
  if (field.id) tokens.push(normalizeToken(field.id));
  return [...new Set(tokens.filter(Boolean))];
}

function tokenMatchesKind(token, aliases) {
  return aliases.some(
    (alias) => token === alias || token.endsWith(alias) || token.startsWith(alias),
  );
}

/**
 * Infer a common field kind from autocomplete, input type, name, or id.
 * @returns {keyof typeof defaultFieldMessages | null}
 */
function inferFieldKind(field) {
  const autocomplete = field.getAttribute?.("autocomplete")?.split(/\s+/)[0]?.toLowerCase();
  if (autocomplete && AUTOCOMPLETE_KIND[autocomplete]) {
    return AUTOCOMPLETE_KIND[autocomplete];
  }

  if (field.type && TYPE_KIND[field.type]) {
    return TYPE_KIND[field.type];
  }

  const tokens = fieldTokens(field);
  for (const [kind, aliases] of Object.entries(FIELD_ALIASES)) {
    if (tokens.some((token) => tokenMatchesKind(token, aliases))) {
      return kind;
    }
  }

  return null;
}

/**
 * Resolve the message for a failed rule.
 * Priority: data-a11y-message-* → field kind default → generic rule default.
 */
function resolveFieldMessage(field, rule, config, genericMessages) {
  const dataKey = `a11yMessage${rule[0].toUpperCase()}${rule.slice(1)}`;
  if (field.dataset?.[dataKey]) return field.dataset[dataKey];

  const kind = inferFieldKind(field);
  if (kind) {
    const fieldMessages =
      config.fieldMessages?.[kind] || defaultFieldMessages[kind];
    if (fieldMessages?.[rule]) return fieldMessages[rule];
  }

  return config.messages?.[rule] || genericMessages[rule];
}

const STYLE_ID = "a11y-validator-styles";

/** WCAG AA (4.5:1+) error palette for injected validator styles. */
const errorStyleTokens = {
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

function resolveErrorStyleTokens(overrides = {}) {
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

function injectDefaultStyles(overrides = {}) {
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

/**
 * Accessibility scan rules for broken / incomplete form markup.
 * These are guidance checks, not WCAG certification.
 */

function cssPath(el) {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const name = el.getAttribute("name");
  if (name) return `${el.tagName.toLowerCase()}[name="${name}"]`;
  return el.tagName.toLowerCase();
}

function accessibleName(el) {
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean)
      .join(" ");
    if (text) return text;
  }
  const ariaLabel = el.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel;
  if (el.labels && el.labels.length > 0) {
    return [...el.labels]
      .map((label) => label.textContent?.trim())
      .filter(Boolean)
      .join(" ");
  }
  if (el.getAttribute("title")?.trim()) return el.getAttribute("title").trim();
  if (el.tagName === "BUTTON" || el.type === "submit" || el.type === "button") {
    return el.textContent?.trim() || el.value?.trim() || "";
  }
  return "";
}

function controls(form) {
  return [
    ...form.querySelectorAll("input:not([type='hidden']), select, textarea, button"),
  ].filter(
    (el) =>
      !el.disabled &&
      !el.hasAttribute("data-a11y-ignore") &&
      el.type !== "submit" &&
      el.type !== "button" &&
      el.type !== "reset" &&
      el.tagName !== "BUTTON",
  );
}

/**
 * @param {ParentNode} [root=document]
 * @returns {{ severity: string, title: string, selector: string, message: string }[]}
 */
function scanDocument(root = document) {
  const issues = [];
  const forms = [...root.querySelectorAll("form")].filter(
    (form) => !form.hasAttribute("data-a11y-ignore-form"),
  );

  if (forms.length === 0) {
    issues.push({
      severity: "warning",
      title: "No forms found",
      selector: "document",
      message: "No <form> elements were found on this page to validate or track.",
    });
    return issues;
  }

  const seenIds = new Map();

  forms.forEach((form, formIndex) => {
    const formSelector =
      form.id
        ? `#${CSS.escape(form.id)}`
        : form.getAttribute("name")
          ? `form[name="${form.getAttribute("name")}"]`
          : `form:nth-of-type(${formIndex + 1})`;

    const fields = controls(form);
    if (fields.length === 0) {
      issues.push({
        severity: "warning",
        title: "Form has no trackable fields",
        selector: formSelector,
        message: "This form has no input, select, or textarea controls to validate.",
      });
    }

    const hasSubmit = Boolean(
      form.querySelector(
        "button:not([type]), button[type='submit'], input[type='submit']",
      ),
    );
    if (!hasSubmit) {
      issues.push({
        severity: "warning",
        title: "Form is missing a submit control",
        selector: formSelector,
        message: "Add a submit button so users can complete the form with assistive technology.",
      });
    }

    fields.forEach((field) => {
      if (field.id) {
        const previous = seenIds.get(field.id);
        if (previous) {
          issues.push({
            severity: "error",
            title: "Duplicate field id",
            selector: `#${CSS.escape(field.id)}`,
            message: `The id "${field.id}" is used more than once, which breaks label associations.`,
          });
        } else {
          seenIds.set(field.id, field);
        }
      }

      if (!accessibleName(field)) {
        issues.push({
          severity: "error",
          title: "Field has no accessible name",
          selector: `${formSelector} ${cssPath(field)}`,
          message:
            "Add a visible <label>, aria-label, or aria-labelledby so the control can be identified.",
        });
      }

      if (
        (field.type === "radio" || field.type === "checkbox") &&
        field.name &&
        !field.closest("fieldset")
      ) {
        const group = form.querySelectorAll(
          `input[type="${field.type}"][name="${CSS.escape(field.name)}"]`,
        );
        if (group.length > 1 && field === group[0]) {
          issues.push({
            severity: "warning",
            title: "Related options are not grouped",
            selector: `${formSelector} [name="${field.name}"]`,
            message: "Wrap related radio or checkbox options in a fieldset with a legend.",
          });
        }
      }
    });
  });

  return issues;
}

function summarizeScan(issues) {
  return {
    errorCount: issues.filter((i) => i.severity === "error").length,
    warningCount: issues.filter((i) => i.severity === "warning").length,
    issues,
  };
}


const defaults = {
  /** Track every form unless it opts out with data-a11y-ignore-form */
  selector: "form:not([data-a11y-ignore-form])",
  validationMode: ["submit", "blur"],
  showErrorSummary: true,
  focusErrorSummary: true,
  disableNativeValidation: true,
  messages: {
    required: "Complete this field.",
    email: "Enter an email address in the format name@example.com.",
    minLength: "Enter more characters.",
    maxLength: "Enter fewer characters.",
    pattern: "Use the requested format.",
  },
};

function fields(form) {
  return [
    ...form.querySelectorAll("input:not([type='hidden']),select,textarea"),
  ].filter((f) => !f.disabled && !f.hasAttribute("data-a11y-ignore"));
}

function message(field, rule, config) {
  return resolveFieldMessage(field, rule, config, config.messages);
}

function clear(field) {
  const id = `${field.id}-error`;
  document.getElementById(id)?.remove();
  field.removeAttribute("aria-invalid");
  field.classList.remove("a11y-field-invalid");
  const refs = (field.getAttribute("aria-describedby") || "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((v) => v !== id);
  if (refs.length) field.setAttribute("aria-describedby", refs.join(" "));
  else field.removeAttribute("aria-describedby");
}

function show(field, text) {
  clear(field);
  if (!field.id) {
    field.id = `a11y-field-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  }
  const el = document.createElement("p");
  el.id = `${field.id}-error`;
  el.className = "a11y-field-error";
  el.textContent = text;
  field.insertAdjacentElement("afterend", el);
  field.setAttribute("aria-invalid", "true");
  field.classList.add("a11y-field-invalid");
  const refs = new Set(
    (field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean),
  );
  refs.add(el.id);
  field.setAttribute("aria-describedby", [...refs].join(" "));
}

function validateField(field, config) {
  clear(field);
  for (const rule of inferRules(field)) {
    if (!rules[rule](field)) {
      const text = message(field, rule, config);
      show(field, text);
      return text;
    }
  }
  return null;
}

function summary(form, errors, config) {
  form.querySelector("[data-a11y-error-summary]")?.remove();
  if (!errors.length || !config.showErrorSummary) return;
  const wrap = document.createElement("div");
  wrap.dataset.a11yErrorSummary = "";
  wrap.tabIndex = -1;
  wrap.setAttribute("role", "alert");
  wrap.className = "a11y-error-summary";
  const heading = document.createElement("h2");
  heading.textContent = `There ${errors.length === 1 ? "is" : "are"} ${errors.length} ${errors.length === 1 ? "error" : "errors"} in this form`;
  const list = document.createElement("ul");
  errors.forEach(({ field, text }) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${field.id}`;
    a.textContent = text;
    a.addEventListener("click", (event) => {
      event.preventDefault();
      field.focus();
    });
    li.append(a);
    list.append(li);
  });
  wrap.append(heading, list);
  form.prepend(wrap);
  if (config.focusErrorSummary) wrap.focus();
}

function normalizeMode(mode) {
  if (Array.isArray(mode)) return mode;
  if (typeof mode !== "string" || !mode.trim()) return defaults.validationMode;
  if (mode === "submit") return ["submit"];
  if (mode === "blur") return ["submit", "blur"];
  if (mode === "change") return ["submit", "blur", "change"];
  return mode.split(/[,\s]+/).filter(Boolean);
}

function mapRemoteConfig(data) {
  if (!data || typeof data !== "object") return {};
  return {
    validationMode: normalizeMode(data.validation_mode ?? data.validationMode),
    showErrorSummary:
      data.show_error_summary ?? data.showErrorSummary ?? defaults.showErrorSummary,
    focusErrorSummary:
      data.focus_error_summary ?? data.focusErrorSummary ?? defaults.focusErrorSummary,
    disableNativeValidation:
      data.disable_native_validation ??
      data.disableNativeValidation ??
      defaults.disableNativeValidation,
    messages: data.messages || {},
    errorColors: data.error_colors ?? data.errorColors ?? {},
  };
}

async function fetchProjectConfig(projectKey, configUrl) {
  let resolved = configUrl;
  if (!resolved) {
    const script = document.currentScript;
    if (script?.src) {
      resolved = new URL(
        `/api/public/config/${encodeURIComponent(projectKey)}`,
        script.src,
      ).href;
    } else {
      resolved = `/api/public/config/${encodeURIComponent(projectKey)}`;
    }
  }

  const response = await fetch(resolved, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Project configuration not found (${response.status})`);
  }
  return mapRemoteConfig(await response.json());
}

function attachForm(form, config) {
  if (form.dataset.a11yBound === "true") return;
  form.dataset.a11yBound = "true";

  if (config.disableNativeValidation !== false) form.noValidate = true;

  if (config.validationMode.includes("blur")) {
    form.addEventListener("focusout", (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.matches("input,select,textarea")
      ) {
        validateField(target, config);
      }
    });
  }

  if (config.validationMode.includes("change")) {
    form.addEventListener("change", (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.matches("input,select,textarea")
      ) {
        validateField(target, config);
      }
    });
  }

  form.addEventListener("submit", (event) => {
    const errors = fields(form)
      .map((field) => ({ field, text: validateField(field, config) }))
      .filter((item) => item.text);
    if (errors.length) {
      event.preventDefault();
      summary(form, errors, config);
    }
  });
}

async function saveScanReport(projectKey, report, options = {}) {
  const script =
    options.script ||
    document.currentScript ||
    document.querySelector("script[data-a11y-project]");
  let url = options.scansUrl;
  if (!url) {
    if (script?.src) {
      url = new URL("/api/public/scans", script.src).href;
    } else {
      url = "/api/public/scans";
    }
  }

  const fieldCount = options.fieldCount ?? 0;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_key: projectKey,
      form_identifier: options.formIdentifier ?? undefined,
      error_count: report.errorCount,
      warning_count: report.warningCount,
      passed_count: Math.max(
        0,
        fieldCount - report.errorCount - report.warningCount,
      ),
      results: report.issues,
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not save scan (${response.status})`);
  }

  return response.json();
}

function shouldSaveScans(options, script) {
  return (
    options.saveScans === true ||
    script?.dataset?.a11ySaveScans === "true" ||
    script?.hasAttribute("data-a11y-save-scans")
  );
}

function createValidator(options = {}) {
  const config = {
    ...defaults,
    ...options,
    validationMode: normalizeMode(
      options.validationMode ?? defaults.validationMode,
    ),
    messages: { ...defaults.messages, ...options.messages },
    fieldMessages: {
      ...defaultFieldMessages,
      ...options.fieldMessages,
    },
    errorColors: options.errorColors ?? {},
  };

  return {
    config,
    /** Discover forms and attach validation listeners */
    init(root = document) {
      injectDefaultStyles(config.errorColors);
      const scope = root.querySelectorAll ? root : document;
      scope.querySelectorAll(config.selector).forEach((form) => {
        attachForm(form, config);
      });
      return this;
    },
    /** List forms currently tracked on the page */
    listForms(root = document) {
      return [...root.querySelectorAll(config.selector)].map((form, index) => ({
        index,
        id: form.id || null,
        name: form.getAttribute("name"),
        action: form.getAttribute("action"),
        method: (form.getAttribute("method") || "get").toLowerCase(),
        fieldCount: fields(form).length,
        identifier:
          form.dataset.a11yFormId ||
          form.id ||
          form.getAttribute("name") ||
          `form-${index + 1}`,
      }));
    },
    /** Scan for broken / incomplete form accessibility markup */
    scan(root = document) {
      return summarizeScan(scanDocument(root));
    },
    validateField: (field) => validateField(field, config),
    validateForm(form) {
      const errors = fields(form)
        .map((field) => ({ field, text: validateField(field, config) }))
        .filter((item) => item.text);
      if (errors.length) summary(form, errors, config);
      return errors;
    },
  };
}

/**
 * Drop-in bootstrap for:
 * <script src="https://keystone-web-tmld.vercel.app/validator/a11y-validator.js" data-a11y-project="proj_xxx" defer></script>
 */
async function autoInit(options = {}) {
  const script =
    options.script ||
    document.currentScript ||
    document.querySelector("script[data-a11y-project]");
  const projectKey =
    options.projectKey || script?.dataset?.a11yProject || null;
  const configUrl = options.configUrl || script?.dataset?.a11yConfigUrl;

  let remote = {};
  if (projectKey) {
    try {
      remote = await fetchProjectConfig(projectKey, configUrl);
    } catch (error) {
      console.error(
        "[Keystone] Could not load project config — using built-in defaults.",
        error,
      );
    }
  }

  const validator = createValidator({ ...remote, ...options });
  const start = () => {
    validator.init();
    if (options.scanOnInit !== false) {
      const report = validator.scan();
      if (report.errorCount || report.warningCount) {
        console.info("[Keystone] Scan report", report);
      }

      if (shouldSaveScans(options, script) && projectKey) {
        const forms = validator.listForms();
        const fieldCount = forms.reduce(
          (total, form) => total + form.fieldCount,
          0,
        );
        saveScanReport(projectKey, report, {
          script,
          fieldCount,
          formIdentifier: forms[0]?.identifier,
          scansUrl: options.scansUrl,
        }).catch((error) => {
          console.warn("[Keystone] Could not save scan:", error);
        });
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  return validator;
}



  const api = {
    createValidator,
    autoInit,
    fetchProjectConfig,
    saveScanReport,
    scanDocument,
    summarizeScan,
  };
  global.Keystone = api;
  const script = document.currentScript;
  if (script && (script.dataset.a11yProject || script.hasAttribute("data-a11y-auto"))) {
    autoInit();
  }
})(typeof window !== "undefined" ? window : globalThis);
