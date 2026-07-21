import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = join(scriptDir, "..");
const repoRoot = join(webRoot, "..", "..");
const from = join(repoRoot, "packages/keystone-core/dist/validator.js");
const toDir = join(webRoot, "public/keystone");

mkdirSync(toDir, { recursive: true });
cpSync(from, join(toDir, "validator.js"));
console.log("Synced validator to public/keystone/validator.js");
