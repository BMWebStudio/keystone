import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  defaultFieldMessages,
  inferFieldKind,
  resolveFieldMessage,
} from "../src/field-messages.js";

function mockField(attrs = {}) {
  return {
    type: attrs.type || "text",
    name: attrs.name || "",
    id: attrs.id || "",
    dataset: attrs.dataset || {},
    getAttribute(name) {
      if (name === "autocomplete") return attrs.autocomplete ?? null;
      return null;
    },
  };
}

describe("inferFieldKind", () => {
  it("detects email from input type", () => {
    assert.equal(inferFieldKind(mockField({ type: "email", name: "contact" })), "email");
  });

  it("detects phone from tel type", () => {
    assert.equal(inferFieldKind(mockField({ type: "tel", name: "mobile" })), "phone");
  });

  it("detects name from common field names", () => {
    assert.equal(inferFieldKind(mockField({ name: "first_name" })), "name");
    assert.equal(inferFieldKind(mockField({ id: "full-name" })), "name");
  });

  it("detects message from textarea name", () => {
    assert.equal(inferFieldKind(mockField({ name: "message" })), "message");
  });

  it("detects company from autocomplete", () => {
    assert.equal(
      inferFieldKind(mockField({ autocomplete: "organization", name: "org" })),
      "company",
    );
  });
});

describe("resolveFieldMessage", () => {
  const generic = {
    required: "Complete this field.",
    email: "Enter an email address in the format name@example.com.",
  };

  it("prefers data-a11y-message attributes", () => {
    const field = mockField({
      type: "email",
      name: "email",
      dataset: { a11yMessageRequired: "Custom required message." },
    });
    assert.equal(
      resolveFieldMessage(field, "required", { messages: generic }, generic),
      "Custom required message.",
    );
  });

  it("uses field-kind defaults for common names", () => {
    const field = mockField({ name: "email", type: "email" });
    assert.equal(
      resolveFieldMessage(field, "required", { messages: generic }, generic),
      defaultFieldMessages.email.required,
    );
  });

  it("falls back to generic rule messages", () => {
    const field = mockField({ name: "custom_field_xyz" });
    assert.equal(
      resolveFieldMessage(field, "required", { messages: generic }, generic),
      generic.required,
    );
  });
});
