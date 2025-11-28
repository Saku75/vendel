import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/lib/client/index.ts",
    "./src/lib/enums/index.ts",
    "./src/lib/types/index.ts",
  ],

  outDir: "dist",
  external: ["cloudflare:workers"],
  clean: false,

  target: "esnext",
  format: ["esm"],

  dts: true,
  sourcemap: true,
  treeshake: true,
});
