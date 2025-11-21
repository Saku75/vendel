import ky, { type Options } from "ky";
import { parseString } from "set-cookie-parser";

import type { ClientConfig, RouteContext } from "./types";

function createBaseClient(config: ClientConfig = {}): RouteContext {
  const cookies = new Map<string, string>();

  const kyOptions: Options = {
    prefixUrl: config.prefix || "",
    fetch: config.fetch,
    headers: config.headers,
    hooks: {
      beforeRequest: config.hooks?.beforeRequest
        ? [
            async (request) => {
              const cookieEntries = Array.from(cookies.entries());
              if (cookieEntries.length > 0) {
                const cookieHeader = cookieEntries
                  .map(([k, v]) => `${k}=${v}`)
                  .join("; ");
                request.headers.set("cookie", cookieHeader);
              }

              await config.hooks?.beforeRequest?.(request);
            },
          ]
        : [
            async (request) => {
              const cookieEntries = Array.from(cookies.entries());
              if (cookieEntries.length > 0) {
                const cookieHeader = cookieEntries
                  .map(([k, v]) => `${k}=${v}`)
                  .join("; ");
                request.headers.set("cookie", cookieHeader);
              }
            },
          ],
      afterResponse: config.hooks?.afterResponse
        ? [
            async (request, _options, response) => {
              const setCookies = response.headers.getSetCookie?.() ?? [];
              for (const raw of setCookies) {
                const parsed = parseString(raw);
                if (parsed.name && parsed.value) {
                  cookies.set(parsed.name, parsed.value);
                }
              }

              await config.hooks?.afterResponse?.(request, response);
            },
          ]
        : [
            async (_request, _options, response) => {
              const setCookies = response.headers.getSetCookie?.() ?? [];
              for (const raw of setCookies) {
                const parsed = parseString(raw);
                if (parsed.name && parsed.value) {
                  cookies.set(parsed.name, parsed.value);
                }
              }
            },
          ],
    },
  };

  const kyInstance = ky.create(kyOptions);

  return {
    ky: kyInstance,
    config,
    cookies,
  };
}

export { createBaseClient };
