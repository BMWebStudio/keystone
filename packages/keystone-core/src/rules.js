export const rules = {
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
  phone(field) {
    const value = String(field.value ?? "").trim();
    if (!value) return true;
    return /^[\d\s\-+().]{7,}$/.test(value);
  },
  url(field) {
    const value = String(field.value ?? "").trim();
    if (!value) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
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
export function inferRules(field) {
  const list = [];
  if (field.required) list.push("required");
  if (field.type === "email") list.push("email");
  if (field.type === "tel") list.push("phone");
  if (field.type === "url") list.push("url");
  if (field.minLength > 0) list.push("minLength");
  if (field.maxLength > 0) list.push("maxLength");
  if (field.pattern) list.push("pattern");
  return list;
}
