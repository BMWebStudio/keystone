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
export function scanDocument(root = document) {
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

export function summarizeScan(issues) {
  return {
    errorCount: issues.filter((i) => i.severity === "error").length,
    warningCount: issues.filter((i) => i.severity === "warning").length,
    issues,
  };
}
