/**
 * tsup configuration for Realm of Darkness Discord Bot
 *
 * This configuration is designed for a pure TypeScript Discord bot project
 * with plans to move shared logic to the shared package.
 */
import { defineConfig } from "tsup";

export default defineConfig({
  // Entry points - main bot launchers
  entry: {
    bot: "src/main/bot.ts",
    shardLauncher: "src/main/shard-launcher.ts",
  },

  // Output configuration
  outDir: "dist",
  format: ["esm"], // ES modules only since we're using "type": "module"
  target: "node18", // Match your Node.js runtime

  // TypeScript configuration
  dts: true, // Generate .d.ts files
  splitting: true, // Enable code splitting for better optimization
  sourcemap: true, // Generate source maps for debugging

  // Clean output directory before build
  clean: true,

  // Bundle external dependencies for easier deployment
  bundle: true,

  // External dependencies that should not be bundled
  external: [
    // Keep Discord.js external since it's large and should be installed separately
    "discord.js",
    "@discordjs/builders",
    "@discordjs/rest",
    "discord-api-types",

    // Keep shared packages external since they'll be resolved at runtime
    "shared",
    "database",

    // Node.js built-ins
    "fs",
    "path",
    "crypto",
    "os",
    "util",
    "events",
    "stream",
    "buffer",
    "url",
    "querystring",
    "zlib",
    "http",
    "https",
    "net",
    "tls",
    "cluster",
    "child_process",
    "worker_threads",
  ],

  // Environment-specific configuration
  env: {
    NODE_ENV: "production",
  },

  // Advanced options
  treeshake: true, // Remove unused code
  minify: true, // Keep readable for debugging in production
  keepNames: true, // Preserve function names for better error traces

  // Handle module resolution for the bot's internal path aliases
  esbuildOptions(options) {
    // Ensure proper path resolution for TypeScript paths
    options.tsconfig = "./tsconfig.json";

    // Add any additional esbuild options here if needed
    options.logLevel = "info";
  },

  // Watch mode configuration for development
  watch: process.env.NODE_ENV === "development",

  // Additional files to copy (if needed)
  // publicDir: "public", // Uncomment if you have static assets

  onSuccess: async () => {
    // eslint-disable-next-line no-console
    console.log("✅ Bot build completed successfully!");
    // eslint-disable-next-line no-console
    console.log("📁 Output directory: ./dist");
    // eslint-disable-next-line no-console
    console.log("🚀 Ready for deployment");
    return Promise.resolve();
  },
});
