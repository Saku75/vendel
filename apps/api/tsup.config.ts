import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "./src/main.ts",
    "./src/lib/client/index.ts",
    "./src/lib/enums/index.ts",
    "./src/lib/types/index.ts",
  ],

  outDir: "dist",

  target: "esnext",
  format: ["esm"],
  splitting: false,

  dts: true,
  sourcemap: true,
  treeshake: true,
});
