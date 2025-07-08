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
