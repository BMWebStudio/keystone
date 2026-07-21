import { hasFlag, readDataset, readScriptValue, hasScriptFlag } from "./attrs.js";
import { inferRules, rules } from "./rules.js";
import { scanDocument, summarizeScan } from "./scan.js";
import {
  defaultFieldMessages,
  inferFieldKind,
  resolveFieldMessage,
} from "./field-messages.js";
import { injectDefaultStyles } from "./styles.js";

const defaults = {
  /** Track every form unless it opts out with data-keystone-ignore-form */
  selector:
    "form:not([data-keystone-ignore-form]):not([data-a11y-ignore-form])",
  validationMode: ["submit", "blur"],
  showErrorSummary: true,
  focusErrorSummary: true,
  disableNativeValidation: true,
  messages: {
    required: "This field is required!",
    email: "Enter an email address in the format name@example.com.",
    name: "Enter your name.",
    phone: "Enter a valid phone number.",
    url: "Enter a valid website URL.",
    minLength: "Enter more characters.",
    maxLength: "Enter fewer characters.",
    pattern: "Use the requested format.",
  },
};

function buildFieldMessageOverrides(messages = {}) {
  const overrides = {};
  for (const kind of ["name", "phone", "url"]) {
    const copy = messages[kind];
    if (!copy || !defaultFieldMessages[kind]) continue;
    overrides[kind] = Object.fromEntries(
      Object.keys(defaultFieldMessages[kind]).map((rule) => [rule, copy]),
    );
  }
  return overrides;
}

function fields(form) {
  return [
    ...form.querySelectorAll("input:not([type='hidden']),select,textarea"),
  ].filter(
    (f) =>
      !f.disabled &&
      !hasFlag(f, "data-keystone-ignore", "data-a11y-ignore"),
  );
}

function message(field, rule, config) {
  return resolveFieldMessage(field, rule, config, config.messages);
}

function clear(field) {
  const id = `${field.id}-error`;
  document.getElementById(id)?.remove();
  field.removeAttribute("aria-invalid");
  field.classList.remove("keystone-field-invalid", "a11y-field-invalid");
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
    field.id = `keystone-field-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  }
  const el = document.createElement("p");
  el.id = `${field.id}-error`;
  el.className = "keystone-field-error";
  el.textContent = text;
  field.insertAdjacentElement("afterend", el);
  field.setAttribute("aria-invalid", "true");
  field.classList.add("keystone-field-invalid");
  const refs = new Set(
    (field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean),
  );
  refs.add(el.id);
  field.setAttribute("aria-describedby", [...refs].join(" "));
}

function fieldIsEmpty(field) {
  if (field.type === "checkbox") return !field.checked;
  if (field.type === "radio") {
    return (
      field.form?.querySelector(
        `[name="${CSS.escape(field.name)}"]:checked`,
      ) == null
    );
  }
  return String(field.value ?? "").trim().length === 0;
}

function fieldIsDirty(field) {
  return readDataset(field, "keystoneDirty", "a11yDirty") === "true";
}

function markFieldDirty(field) {
  field.dataset.keystoneDirty = "true";
}

function formSubmitAttempted(form) {
  return readDataset(form, "keystoneSubmitAttempted", "a11ySubmitAttempted") === "true";
}

function markSubmitAttempted(form) {
  form.dataset.keystoneSubmitAttempted = "true";
}

/** Blur/change validation — skip untouched empty fields until submit. */
function validateFieldInteractive(field, config, form) {
  if (
    !formSubmitAttempted(form) &&
    fieldIsEmpty(field) &&
    !fieldIsDirty(field)
  ) {
    clear(field);
    return null;
  }
  return validateField(field, config);
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
  form
    .querySelector("[data-keystone-error-summary], [data-a11y-error-summary]")
    ?.remove();
  if (!errors.length || !config.showErrorSummary) return;
  const wrap = document.createElement("div");
  wrap.dataset.keystoneErrorSummary = "";
  wrap.tabIndex = -1;
  wrap.setAttribute("role", "alert");
  wrap.className = "keystone-error-summary";
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
  const value = mode.trim().toLowerCase();
  if (value === "submit") return ["submit"];
  if (value === "blur") return ["submit", "blur"];
  if (value === "change") return ["submit", "blur", "change"];
  return value.split(/[,\s]+/).filter(Boolean);
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

export async function fetchProjectConfig(projectKey, configUrl) {
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
  if (readDataset(form, "keystoneBound", "a11yBound") === "true") return;
  form.dataset.keystoneBound = "true";

  if (config.disableNativeValidation !== false) form.noValidate = true;

  const interactive =
    config.validationMode.includes("blur") ||
    config.validationMode.includes("change");

  if (interactive) {
    form.addEventListener("input", (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.matches("input,select,textarea")
      ) {
        markFieldDirty(target);
      }
    });
  }

  if (config.validationMode.includes("blur")) {
    form.addEventListener("focusout", (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.matches("input,select,textarea")
      ) {
        validateFieldInteractive(target, config, form);
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
        markFieldDirty(target);
        validateFieldInteractive(target, config, form);
      }
    });
  }

  form.addEventListener("submit", (event) => {
    markSubmitAttempted(form);
    const errors = fields(form)
      .map((field) => ({ field, text: validateField(field, config) }))
      .filter((item) => item.text);
    if (errors.length) {
      event.preventDefault();
      summary(form, errors, config);
    }
  });
}

export async function saveScanReport(projectKey, report, options = {}) {
  const script =
    options.script ||
    document.currentScript ||
    document.querySelector(
      "script[data-keystone-project], script[data-a11y-project]",
    );
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
    readScriptValue(script, "saveScans") === "true" ||
    hasScriptFlag(script, "save-scans")
  );
}

export function createValidator(options = {}) {
  const config = {
    ...defaults,
    ...options,
    validationMode: normalizeMode(
      options.validationMode ??
        options.validation_mode ??
        defaults.validationMode,
    ),
    messages: { ...defaults.messages, ...options.messages },
    fieldMessages: {
      ...defaultFieldMessages,
      ...buildFieldMessageOverrides(options.messages),
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
          readDataset(form, "keystoneFormId", "a11yFormId") ||
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
 * <script src="https://keystone-web-tmld.vercel.app/keystone/validator.js" data-keystone-project="proj_xxx" defer></script>
 */
export async function autoInit(options = {}) {
  const script =
    options.script ||
    document.currentScript ||
    document.querySelector(
      "script[data-keystone-project], script[data-a11y-project]",
    );
  const projectKey =
    options.projectKey || readScriptValue(script, "project") || null;
  const configUrl =
    options.configUrl || readScriptValue(script, "configUrl") || null;

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

export { scanDocument, summarizeScan, inferFieldKind, defaultFieldMessages };

const api = {
  createValidator,
  autoInit,
  fetchProjectConfig,
  saveScanReport,
  scanDocument,
  summarizeScan,
};

if (typeof window !== "undefined") {
  window.Keystone = api;
}

export default api;
