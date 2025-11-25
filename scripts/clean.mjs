#!/usr/bin/env node
import { rmSync } from "fs";
import { glob } from "glob";

const patterns = [
  "node_modules",
  "apps/*/node_modules",
  "packages/*/node_modules",
  "apps/*/dist",
  "packages/*/dist",
  "apps/*/.turbo",
  "packages/*/.turbo",
  ".turbo",
  "apps/*/coverage",
  "packages/*/coverage",
  "**/*.tsbuildinfo",
  "**/tsconfig.tsbuildinfo",
  "backend-legacy/**/__pycache__",
  "backend-legacy/**/*.pyc",
];

console.log("🧹 Cleaning workspace...\n");

for (const pattern of patterns) {
  try {
    const files = await glob(pattern, {
      ignore: ["**/.env", "**/.env.*"],
      absolute: true,
      windowsPathsNoEscape: true,
    });

    for (const file of files) {
      try {
        rmSync(file, { recursive: true, force: true });
        console.log(`✓ Removed: ${file}`);
      } catch (err) {
        console.warn(`⚠ Could not remove ${file}:`, err.message);
      }
    }
  } catch (err) {
    console.warn(`⚠ Pattern "${pattern}" failed:`, err.message);
  }
}

console.log("\n✨ Workspace cleaned!");
