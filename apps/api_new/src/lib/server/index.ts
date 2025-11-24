import { DrizzleD1Database } from "drizzle-orm/d1";
import { Context, Hono } from "hono";
import { HonoOptions } from "hono/hono-base";

import { MailService } from "@package/mail-service";
import { TokenService } from "@package/token-service";

import { Captcha } from "$lib/captcha";

import { response } from "./response";

type ServerEnv = {
  Bindings: CloudflareBindings;

  Variables: {
    captcha: Captcha;
    database: DrizzleD1Database;
    mailService: MailService;
    tokenService: TokenService;
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
