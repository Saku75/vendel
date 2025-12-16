import { env } from "cloudflare:workers";
import type { Context } from "hono";
import { Hono } from "hono";
import type { HonoOptions } from "hono/hono-base";

import type { CaptchaService } from "$lib/services/captcha";
import type { AuthContext } from "$lib/types/auth/context";

import { response } from "./response";

type ServerEnv = {
  Bindings: CloudflareBindings;

  Variables: {
    auth: AuthContext;
    captcha: CaptchaService;
  };
};

type ServerOptions = HonoOptions<ServerEnv>;

type ServerContext = Context<ServerEnv>;

function createServer(config?: ServerOptions) {
  const hono = new Hono<ServerEnv>(config);

  hono.notFound((c) =>
    response(c, { status: 404, content: { message: "Not found" } }),
  );

  hono.onError((err, c) => {
    if (env.MODE === "local") {
      // Full error details only in local development
      console.error(err);
    } else {
      // In production/dev environments, log only safe error info to prevent
      // leaking sensitive data like stack traces, tokens, or query details
      console.error("Server error:", err.message);
    }

    return response(c, {
      status: 500,
      content: { message: "Internal server error" },
    });
  });

  return hono;
}

export { createServer };
export type { ServerContext, ServerEnv, ServerOptions };
