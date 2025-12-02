import { npm_package_version } from "$env/static/private";

import { LayoutTheme } from "$lib/enums/layout/theme";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ platform, cookies, locals }) => {
  const authCookiesPresent = Boolean(
    cookies.get(`${platform?.env.COOKIE_PREFIX}-access`) &&
      cookies.get(`${platform?.env.COOKIE_PREFIX}-refresh`),
  );

  const refresh = authCookiesPresent && (await locals.api.auth.refresh());
  const whoAmI =
    refresh && refresh.ok ? await locals.api.user.whoAmI() : undefined;

  return {
    config: {
      theme:
        (cookies.get("theme-preference") as LayoutTheme) || LayoutTheme.System,
      version: npm_package_version,
      canonicalOrigin: platform!.env.CANONICAL_ORIGIN,
      turnstileSiteKey: platform!.env.TURNSTILE_SITE_KEY,
    },
    whoAmI: whoAmI && whoAmI.ok ? whoAmI.data : undefined,
  };
};
