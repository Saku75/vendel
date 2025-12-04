import type { RequestEvent } from "@sveltejs/kit";
import { parseString } from "set-cookie-parser";

import { createClient } from "@app/api/client";

function createApiLocal(event: RequestEvent) {
  const cookieHeader = event.request.headers.get("cookie") ?? "";

  return createClient({
    prefix: `${event.url.origin}/api`,
    headers: {
      cookie: cookieHeader,
    },
    fetch: event.platform?.env.API.fetch.bind(event.platform?.env.API),

    hooks: {
      afterResponse: (_, res) => {
        const cookies = res.headers.getSetCookie();

        for (const key in cookies) {
          const cookie = cookies[key];
          const { name, value, path, sameSite, ...rest } = parseString(cookie);
          event.cookies.set(name, value, {
            ...rest,
            path: path || "/",
            sameSite: sameSite as
              | boolean
              | "lax"
              | "strict"
              | "none"
              | undefined,
          });
        }
      },
    },
  });
}

export { createApiLocal };
