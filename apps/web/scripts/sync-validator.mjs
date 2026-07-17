import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "../../packages/validator-core/dist/a11y-validator.js");
const toDir = join(root, "public/validator");

mkdirSync(toDir, { recursive: true });
cpSync(from, join(toDir, "a11y-validator.js"));
console.log("Synced validator to public/validator/a11y-validator.js");
