import { Context } from "hono";
import { CookieOptions } from "hono/utils/cookie";

import { HonoEnv } from "$lib/server";

function cookieOptions(
  c: Context<HonoEnv>,
  options: CookieOptions,
): CookieOptions {
  return {
    domain: c.env.MODE !== "local" ? ".vendel.dk" : undefined,
    httpOnly: true,
    secure: c.env.MODE !== "local",
    sameSite: "strict",
    ...options,
  };
}

export { cookieOptions };
