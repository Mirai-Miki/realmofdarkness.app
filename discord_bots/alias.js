const moduleAlias = require("module-alias");
const path = require("path");

// Root directory is always where alias.js is located
const rootDir = __dirname;

// Check if we're running from a built distribution
const runningFromDist = process.env.NODE_ENV !== "development";

// Set source directory based on environment
const srcDir = runningFromDist
  ? path.join(rootDir, "dist")
  : path.join(rootDir, "src");

moduleAlias.addAliases({
  "@root": rootDir,
  "@src": srcDir,
  "@commands": path.join(srcDir, "commands"),
  "@components": path.join(srcDir, "components"),
  "@structures": path.join(srcDir, "structures"),
  "@events": path.join(srcDir, "events"),
  "@modules": path.join(srcDir, "modules"),
  "@errors": path.join(srcDir, "errors"),
  "@api": path.join(srcDir, "realm_api"),
  "@constants": path.join(srcDir, "constants"),
  "@utils": path.join(srcDir, "utils"),
  "@types": path.join(srcDir, "types"),
});

// Debug output if needed
if (process.env.NODE_ENV === "development") {
  console.log("Alias paths configured:");
  console.log("  Root dir:", rootDir);
  console.log("  Src dir:", srcDir);
}
