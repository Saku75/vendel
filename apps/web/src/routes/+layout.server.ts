import { cookieName } from "@app/api/client";

import { npm_package_version } from "$env/static/private";

import { LayoutTheme } from "$lib/enums/layout/theme";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
  platform,
  cookies,
  locals,
  url,
}) => {
  const themePreferenceCookie =
    (cookies.get("theme-preference") as LayoutTheme) || LayoutTheme.System;

  const normalizedHostname = url.hostname.replace("www.", "");

  if (
    cookies.get(cookieName("auth", { prefix: normalizedHostname })) &&
    cookies.get(cookieName("auth-refresh", { prefix: normalizedHostname }))
  ) {
    const refresh = await locals.api.auth.refresh();

    if (refresh.ok) {
      const whoAmI = await locals.api.auth.whoAmI();

      return {
        config: {
          themePreference: themePreferenceCookie,
          version: npm_package_version,
          turnstileSiteKey: platform!.env.TURNSTILE_SITE_KEY,
        },
        whoAmI: whoAmI.ok ? whoAmI.data : undefined,
      };
    }
  }

  return {
    config: {
      themePreference: themePreferenceCookie,
      version: npm_package_version,
      turnstileSiteKey: platform!.env.TURNSTILE_SITE_KEY,
    },
  };
};
