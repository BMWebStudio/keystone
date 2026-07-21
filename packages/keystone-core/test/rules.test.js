import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { inferRules, rules } from "../src/rules.js";

describe("inferRules", () => {
  it("detects required and email from native attributes", () => {
    const field = {
      required: true,
      type: "email",
      minLength: -1,
      maxLength: -1,
      pattern: "",
      value: "",
    };
    assert.deepEqual(inferRules(field), ["required", "email"]);
  });
});

describe("rules.email", () => {
  it("accepts empty values and valid emails", () => {
    assert.equal(rules.email({ value: "" }), true);
    assert.equal(rules.email({ value: "hi@example.com" }), true);
    assert.equal(rules.email({ value: "nope" }), false);
  });
});

describe("rules.phone", () => {
  it("accepts empty values and valid phone numbers", () => {
    assert.equal(rules.phone({ value: "" }), true);
    assert.equal(rules.phone({ value: "(617) 555-0100" }), true);
    assert.equal(rules.phone({ value: "abc" }), false);
  });
});

describe("rules.url", () => {
  it("accepts empty values and valid http(s) URLs", () => {
    assert.equal(rules.url({ value: "" }), true);
    assert.equal(rules.url({ value: "https://example.com" }), true);
    assert.equal(rules.url({ value: "not-a-url" }), false);
  });
});

describe("inferRules tel and url", () => {
  it("detects phone and url rules from input type", () => {
    assert.deepEqual(inferRules({ type: "tel", required: false, minLength: -1, maxLength: -1, pattern: "" }), ["phone"]);
    assert.deepEqual(inferRules({ type: "url", required: true, minLength: -1, maxLength: -1, pattern: "" }), ["required", "url"]);
  });
});
