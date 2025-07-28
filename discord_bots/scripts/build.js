"use strict";

/**
 * Build script for Realm of Darkness Bot
 * Handles TypeScript compilation and JavaScript file copying
 */

const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const { glob } = require("glob"); // Fix: Import the named export

// Define directories
const sourceDir = path.resolve(__dirname, "../src");
const destDir = path.resolve(__dirname, "../dist");

/**
 * Main build function
 */
async function buildProject() {
  try {
    console.log(
      "\n============================================================"
    );
    console.log("🏗️  [BUILD] Starting Realm of Darkness Bot build process");

    // Step 1: Check for TypeScript files
    console.log("🔍 Checking for TypeScript files...");
    const tsFiles = await glob("**/*.ts", {
      cwd: sourceDir,
      ignore: ["node_modules/**", "dist/**", "*.d.ts"],
    });

    const hasTypeScriptFiles = tsFiles.length > 0;
    console.log(
      `${hasTypeScriptFiles ? "✅" : "❌"} TypeScript files ${hasTypeScriptFiles ? `found (${tsFiles.length} files)` : "not found"}`
    );

    // Step 2: Clean the dist directory
    console.log("🧹 Cleaning dist directory...");
    await fs.emptyDir(destDir);
    console.log("✅ Dist directory cleaned");

    // Step 3: Compile TypeScript if needed
    if (hasTypeScriptFiles) {
      console.log("🔄 Compiling TypeScript files...");
      try {
        execSync("tsc", { stdio: "inherit" });
        console.log("✅ TypeScript compilation successful");
      } catch (error) {
        console.error("❌ TypeScript compilation failed");
        process.exit(1);
      }
    }

    // Step 4: Copy JS files without TS equivalents
    console.log("📋 Copying JS files without TypeScript equivalents...");
    try {
      const jsFiles = await glob("**/*.js", {
        cwd: sourceDir,
        ignore: ["node_modules/**", "dist/**", "scripts/**", "*.min.js"],
      });

      let copyCount = 0;
      for (const file of jsFiles) {
        const tsFile = file.replace(/\.js$/, ".ts");
        // Only copy if there's no TS equivalent
        if (!fs.existsSync(path.join(sourceDir, tsFile))) {
          const srcPath = path.join(sourceDir, file);
          const destPath = path.join(destDir, file);

          // Ensure destination directory exists
          await fs.ensureDir(path.dirname(destPath));

          // Copy the file
          await fs.copy(srcPath, destPath);
          copyCount++;
        }
      }
      console.log(`✅ Copied ${copyCount} JavaScript files`);
    } catch (error) {
      console.error(`❌ Error copying JavaScript files: ${error.message}`);
      process.exit(1);
    }

    // Step 5: Copy other necessary files (like JSON config files, etc.)
    console.log("📋 Copying other necessary files...");
    try {
      const configFiles = await glob("**/*.json", {
        cwd: sourceDir,
        ignore: [
          "node_modules/**",
          "dist/**",
          "package*.json",
          ".vscode/**",
          "tsconfig.json",
        ],
      });

      for (const file of configFiles) {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);

        // Ensure destination directory exists
        await fs.ensureDir(path.dirname(destPath));

        // Copy the file
        await fs.copy(srcPath, destPath);
      }
      console.log(`✅ Copied ${configFiles.length} configuration files`);
    } catch (error) {
      console.error(`❌ Error copying configuration files: ${error.message}`);
      // Non-critical error, so continue
    }

    // Step 6: Verify build
    const builtFiles = await glob("**/*", {
      cwd: destDir,
      nodir: true,
    });

    console.log(
      `✅ Build complete! ${builtFiles.length} files in dist directory`
    );
    console.log("\n🏁  [BUILD] Build script finished");
    console.log(
      "============================================================\n"
    );
    return true;
  } catch (error) {
    console.error(`❌ [BUILD] Build failed: ${error.message}`);
    if (error.stack) console.error(error.stack);
    console.log(
      "============================================================\n"
    );
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  buildProject();
} else {
  // Export for use in other scripts
  module.exports = buildProject;
}
