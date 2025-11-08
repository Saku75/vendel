import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/main.ts"],

  outDir: "dist",

  target: "esnext",
  format: ["esm"],

  dts: true,
  sourcemap: true,
  treeshake: true,
});
