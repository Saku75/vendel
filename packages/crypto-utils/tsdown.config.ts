import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/**/*.ts", "!./src/**/*.test.ts"],

  outDir: "dist",

  target: "esnext",
  format: ["esm"],

  dts: true,
  sourcemap: true,
  treeshake: true,
});
