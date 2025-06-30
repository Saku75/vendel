import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/main.ts"],

  outDir: "dist",
  clean: true,

  target: "esnext",
  format: ["esm"],
  splitting: false,

  dts: true,
  sourcemap: true,
  treeshake: true,
});
