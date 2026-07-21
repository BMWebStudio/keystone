import test from "node:test";
import assert from "node:assert/strict";
import {
  errorStyleTokens,
  resolveErrorStyleTokens,
} from "../src/styles.js";

test("resolveErrorStyleTokens uses defaults when overrides are missing", () => {
  const tokens = resolveErrorStyleTokens({});
  assert.equal(tokens.surface, errorStyleTokens.surface);
  assert.equal(tokens.surfaceFocus, errorStyleTokens.surfaceFocus);
});

test("resolveErrorStyleTokens accepts snake_case overrides", () => {
  const tokens = resolveErrorStyleTokens({
    field_background: "#fff3d8",
    field_background_focus: "#efbd5b",
  });
  assert.equal(tokens.surface, "#fff3d8");
  assert.equal(tokens.surfaceFocus, "#efbd5b");
  assert.equal(tokens.summarySurface, "#fff3d8");
});

test("resolveErrorStyleTokens ignores invalid hex values", () => {
  const tokens = resolveErrorStyleTokens({
    field_background: "not-a-color",
    field_background_focus: "#efbd5b",
  });
  assert.equal(tokens.surface, errorStyleTokens.surface);
  assert.equal(tokens.surfaceFocus, "#efbd5b");
});
