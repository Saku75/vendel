import { Hono } from "hono";
import { HonoOptions } from "hono/hono-base";

type AppEnv = {
  Bindings: WorkerEnv;
};

function app(config?: HonoOptions<AppEnv>) {
  return new Hono<AppEnv>(config);
}

export { app };
export type { AppEnv };
