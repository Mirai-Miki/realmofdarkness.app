import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  bundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
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
