// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Platform {
      env: CloudflareBindings;
      cf: CfProperties;
      ctx: ExecutionContext;
    }
    interface Locals {
      api: import("@app/api/client").Client;
    }
  }
}

export {};
