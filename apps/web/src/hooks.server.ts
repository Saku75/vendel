import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { LayoutTheme } from "$lib/enums/layout/theme";
import { createServerApi } from "$lib/server/api";

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
      const fontFiles = [
        "inter-latin-wght-normal",
        "playwrite-dk-loopet-fallback-wght-normal",
      ];

      switch (type) {
        case "font":
          return !!fontFiles.find((value) => path.includes(value));
        case "css":
        case "js":
          return true;
        default:
          return false;
      }
    },
  });
};

const initiateLocals: Handle = async ({ event, resolve }) => {
  event.locals = {
    api: createServerApi(event),
  };

  return await resolve(event);
};

export const handle = sequence(theme, headers, preload, initiateLocals);
