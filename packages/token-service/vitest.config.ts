import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        miniflare: {
          compatibilityDate: "2025-11-05",
          compatibilityFlags: ["nodejs_compat"],
        },
      },
    },
  },
});
