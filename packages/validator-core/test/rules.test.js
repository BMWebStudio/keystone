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
