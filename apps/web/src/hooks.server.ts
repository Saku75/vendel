import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { LayoutTheme } from "$lib/enums/layout.theme";

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
    "Permissions-Policy":
      "accelerometer=(), attribution-reporting=(), autoplay=(), bluetooth=(), browsing-topics=(), camera=(), compute-pressure=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(), gamepad=(), geolocation=(), gyroscope=(), hid=(), identity-credentials-get=(), idle-detection=(), local-fonts=(), microphone=(), midi=(), otp-credentials=(), payment=(), publickey-credentials-create=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), storage-access=(), usb=(), web-share=(), window-management=(), xr-spatial-tracking=()",
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

export const handle = sequence(theme, headers, preload);
