import { inferRules, rules } from "./rules.js";
const defaults = {
  selector: "form[data-a11y-form]",
  validationMode: ["submit", "blur"],
  showErrorSummary: true,
  focusErrorSummary: true,
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
  return (
    field.dataset[`a11yMessage${rule[0].toUpperCase() + rule.slice(1)}`] ||
    config.messages[rule]
  );
}
function clear(field) {
  const id = `${field.id}-error`;
  document.getElementById(id)?.remove();
  field.removeAttribute("aria-invalid");
  const refs = (field.getAttribute("aria-describedby") || "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((v) => v !== id);
  refs.length
    ? field.setAttribute("aria-describedby", refs.join(" "))
    : field.removeAttribute("aria-describedby");
}
function show(field, text) {
  clear(field);
  if (!field.id)
    field.id = `a11y-field-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  const el = document.createElement("p");
  el.id = `${field.id}-error`;
  el.className = "a11y-field-error";
  el.textContent = text;
  field.insertAdjacentElement("afterend", el);
  field.setAttribute("aria-invalid", "true");
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
export function createValidator(options = {}) {
  const config = {
    ...defaults,
    ...options,
    messages: { ...defaults.messages, ...options.messages },
  };
  return {
    init() {
      document.querySelectorAll(config.selector).forEach((form) => {
        if (config.disableNativeValidation !== false) form.noValidate = true;
        if (config.validationMode.includes("blur"))
          form.addEventListener("focusout", (event) => {
            const target = event.target;
            if (
              target instanceof HTMLElement &&
              target.matches("input,select,textarea")
            )
              validateField(target, config);
          });
        form.addEventListener("submit", (event) => {
          const errors = fields(form)
            .map((field) => ({ field, text: validateField(field, config) }))
            .filter((item) => item.text);
          if (errors.length) {
            event.preventDefault();
            summary(form, errors, config);
          }
        });
      });
    },
  };
}
if (typeof window !== "undefined")
  window.A11yFormValidator = { createValidator };
