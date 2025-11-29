import { npm_package_version } from "$env/static/private";

import { LayoutTheme } from "$lib/enums/layout/theme";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ platform, cookies, locals }) => {
  const themePreferenceCookie =
    (cookies.get("theme-preference") as LayoutTheme) || LayoutTheme.System;

  if (
    cookies.get(`${platform?.env.COOKIE_PREFIX}-access`) &&
    cookies.get(`${platform?.env.COOKIE_PREFIX}-refresh`)
  ) {
    const refresh = await locals.api.auth.refresh();

    if (refresh.ok) {
      const whoAmI = await locals.api.user.whoAmI();

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
