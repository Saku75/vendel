import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "./src/main.ts",
    "./src/lib/client/index.ts",
    "./src/lib/database/schema/*",
  ],

  outDir: "dist",

  target: "esnext",
  format: ["esm"],
  splitting: false,

  dts: true,
  sourcemap: true,
  treeshake: true,
});
