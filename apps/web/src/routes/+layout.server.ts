import { npm_package_version } from "$env/static/private";

import { LayoutTheme } from "$lib/enums/layout/theme";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ platform, cookies, locals }) => {
  const themePreferenceCookie =
    (cookies.get("theme-preference") as LayoutTheme) || LayoutTheme.System;

  const whoAmI = await locals.api.auth.whoAmI();

  return {
    config: {
      themePreference: themePreferenceCookie,
      version: npm_package_version,
      turnstileSiteKey: platform!.env.TURNSTILE_SITE_KEY,
    },
    auth: whoAmI.ok ? whoAmI.data : undefined,
  };
};
