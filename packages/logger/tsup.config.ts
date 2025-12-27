import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  bundle: true, // Bundle to resolve all imports properly
  splitting: false,
  target: "node18",
  outDir: "dist",
  external: [
    "@realm/common",
    "discord.js",
    "@discordjs/builders",
    "@discordjs/rest",
    "source-map-support",
    "dotenv",
  ],
  tsconfig: "./tsconfig.build.json",
});
