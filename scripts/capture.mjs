#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const HELP = `
CleanShot X capture helper (macOS only)
Docs: https://cleanshot.com/docs-api

Usage:
  node scripts/capture.mjs <command> [url]

Commands:
  area        Interactive area screenshot (saved via CleanShot settings)
  fullscreen  Full-screen screenshot
  window      Window picker screenshot
  record      Screen recording mode
  scroll      Scrolling capture mode
  history     Open CleanShot capture history

Examples:
  npm run capture:area
  npm run capture:area -- http://localhost:3000/dashboard/projects
  npm run capture:record
`;

const commands = {
  area: "cleanshot://capture-area?action=save",
  fullscreen: "cleanshot://capture-fullscreen?action=save",
  window: "cleanshot://capture-window?action=save",
  record: "cleanshot://record-screen",
  scroll: "cleanshot://scrolling-capture",
  history: "cleanshot://open-history",
};

const command = process.argv[2];
const url = process.argv[3] || process.env.CAPTURE_URL || "http://localhost:3000";

if (!command || command === "--help" || command === "-h") {
  console.log(HELP.trim());
  process.exit(command ? 0 : 1);
}

if (process.platform !== "darwin") {
  console.error("CleanShot X URL schemes require macOS.");
  process.exit(1);
}

const scheme = commands[command];
if (!scheme) {
  console.error(`Unknown command: ${command}`);
  console.log(HELP.trim());
  process.exit(1);
}

const screenshotDir = join(process.cwd(), "docs", "screenshots");
mkdirSync(screenshotDir, { recursive: true });

if (url && !["history"].includes(command)) {
  execSync(`open "${url}"`);
  console.log(`Opened ${url}`);
}

execSync(`open "${scheme}"`);
console.log(`Launched CleanShot: ${command}`);
console.log(`Move finished captures into ${screenshotDir}/ for README and submission.`);
