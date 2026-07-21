import { mkdirSync, readFileSync, writeFileSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const dist = join(root, "dist");

mkdirSync(dist, { recursive: true });
cpSync(src, dist, { recursive: true });

function stripExports(source) {
  return source
    .replace(/^import\s[\s\S]*?;\n?/gm, "")
    .replace(/export\s+async\s+function/g, "async function")
    .replace(/export\s+function/g, "function")
    .replace(/export\s+const/g, "const")
    .replace(/export\s+\{[^}]+\};?\n?/g, "")
    .replace(/export\s+default\s+api;?\n?/g, "");
}

const attrs = stripExports(readFileSync(join(src, "attrs.js"), "utf8"));
const rules = stripExports(readFileSync(join(src, "rules.js"), "utf8"));
const fieldMessages = stripExports(
  readFileSync(join(src, "field-messages.js"), "utf8"),
);
const styles = stripExports(readFileSync(join(src, "styles.js"), "utf8"));
const scan = stripExports(readFileSync(join(src, "scan.js"), "utf8"));
const index = stripExports(readFileSync(join(src, "index.js"), "utf8"))
  .replace(/const api = \{[\s\S]*?\};\n*/, "")
  .replace(/if \(typeof window !== "undefined"\) \{[\s\S]*?\}\n*/, "");

const bundle = `/*! Keystone — universal browser build */
(function (global) {
${attrs}
${rules}
${fieldMessages}
${styles}
${scan}
${index}
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
  if (script && (readScriptValue(script, "project") || hasScriptFlag(script, "auto"))) {
    autoInit();
  }
})(typeof window !== "undefined" ? window : globalThis);
`;

writeFileSync(join(dist, "validator.js"), bundle);
console.log("Built dist/ (ESM + validator.js)");
