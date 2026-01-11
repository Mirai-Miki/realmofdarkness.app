import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  bundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["@realm/common"],
  tsconfig: "./tsconfig.build.json",
});
