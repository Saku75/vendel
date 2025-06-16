import { Hono } from "hono";
import { getContext } from "hono/context-storage";
import { HonoOptions } from "hono/hono-base";

type HonoEnv = {
  Bindings: CloudflareBindings;
};

function app(config?: HonoOptions<HonoEnv>) {
  const app = new Hono<HonoEnv>(config);

  app.notFound((c) => c.json({ status: 404, message: "Not found" }, 404));

  return app;
}

function appContext() {
  return getContext<HonoEnv>();
}

export { app, appContext };
export type { HonoEnv };
