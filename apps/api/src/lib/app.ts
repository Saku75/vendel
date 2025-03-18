import { Hono } from "hono";
import { HonoOptions } from "hono/hono-base";

type AppEnv = {
  Bindings: WorkerEnv;
};

function app(config?: HonoOptions<AppEnv>) {
  const app = new Hono<AppEnv>(config);

  app.notFound((c) => c.json({ message: "Not found" }, 404));

  return app;
}

export { app };
export type { AppEnv };
