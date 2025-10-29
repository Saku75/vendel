import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/main.ts", "./src/validators/*"],

  outDir: "dist",

  target: "esnext",
  format: ["esm"],

  dts: true,
  sourcemap: true,
  treeshake: true,
});
