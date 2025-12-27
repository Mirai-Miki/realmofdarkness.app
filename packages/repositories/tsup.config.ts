import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  bundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["@realm/common", "@realm/core", "@realm/database"],
  tsconfig: "./tsconfig.build.json",
});
