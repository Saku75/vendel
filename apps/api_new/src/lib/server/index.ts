import { Context, Hono } from "hono";
import { HonoOptions } from "hono/hono-base";

import { response } from "./response";

type ServerEnv = {
  Bindings: CloudflareBindings;
};

type ServerOptions = HonoOptions<ServerEnv>;

type ServerContext = Context<ServerEnv>;

function createServer(config?: ServerOptions) {
  const hono = new Hono<ServerEnv>(config);

  hono.notFound((c) =>
    response(c, { status: 404, content: { message: "Not found" } }),
  );

  hono.onError((err, c) => {
    console.error(err);

    return response(c, {
      status: 500,
      content: { message: "Internal server error" },
    });
  });

  return hono;
}

export { createServer };
export type { ServerContext, ServerEnv, ServerOptions };
