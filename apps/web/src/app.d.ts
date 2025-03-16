declare global {
  namespace App {
    interface Platform {
      env: WorkerEnv;
      cf: CfProperties;
      ctx: ExecutionContext;
    }
  }
}

export {};
