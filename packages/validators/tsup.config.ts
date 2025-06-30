import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/main.ts", "./src/validators/*"],

  outDir: "dist",

  target: "esnext",
  format: ["esm"],
  splitting: false,

  dts: true,
  sourcemap: true,
  treeshake: true,
});
