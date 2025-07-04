import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { parseString } from "set-cookie-parser";

import { createClient } from "@app/api/client";

import { LayoutTheme } from "$lib/enums/layout/theme";

const theme: Handle = async ({ event, resolve }) => {
  const themePreferenceCookie =
    (event.cookies.get("theme-preference") as LayoutTheme) ||
    LayoutTheme.System;
  return await resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace(
        "%theme-preference%",
        themePreferenceCookie && themePreferenceCookie != LayoutTheme.System
          ? `data-theme="${themePreferenceCookie}"`
          : "",
      ),
  });
};

const headers: Handle = async ({ event, resolve }) => {
  event.setHeaders({
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  return await resolve(event);
};

const preload: Handle = async ({ event, resolve }) => {
  return await resolve(event, {
    preload: ({ type, path }) => {
      const preloadedType: boolean = ["font", "css", "js"].includes(type);
      const preloadedPath: boolean =
        type === "font" ? path.includes("latin") : true;
      return preloadedType && preloadedPath;
    },
  });
};

const initiateLocals: Handle = async ({ event, resolve }) => {
  const cookieHeader = event.request.headers.get("cookie") ?? "";

  event.locals = {
    api: createClient({
      prefix: `${event.url.origin}/api`,
      headers: {
        cookie: cookieHeader,
      },
      fetch: event.platform?.env.API.fetch.bind(event.platform?.env.API),

      hooks: {
        afterRequest: (res) => {
          const cookies = res.headers.getSetCookie();
          for (const key in cookies) {
            const cookie = cookies[key];
            const { name, value, path, sameSite, ...rest } =
              parseString(cookie);
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
    }),
  };

  return await resolve(event);
};

export const handle = sequence(theme, headers, preload, initiateLocals);
