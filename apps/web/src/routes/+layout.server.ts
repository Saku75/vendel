import { TokenExpiresIn, TokenService } from "@package/token-service";

import { npm_package_version } from "$env/static/private";

import type { ConfigContext } from "$lib/contexts/config.svelte";
import { Theme } from "$lib/enums/theme";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ platform, cookies, locals }) => {
  const whoAmI = await getAuthenticatedUser(platform!, cookies, locals);

  return {
    config: {
      version: npm_package_version,
      canonicalOrigin: platform!.env.CANONICAL_ORIGIN,
      turnstileSiteKey: platform!.env.TURNSTILE_SITE_KEY,
    } as ConfigContext,
    theme: (cookies.get("theme-preference") as Theme) || Theme.System,
    whoAmI,
  };
};

async function getAuthenticatedUser(
  platform: App.Platform,
  cookies: Parameters<LayoutServerLoad>[0]["cookies"],
  locals: App.Locals,
) {
  const cookiePrefix = platform.env.COOKIE_PREFIX;
  const accessCookie = cookies.get(`${cookiePrefix}-access`);
  const refreshCookie = cookies.get(`${cookiePrefix}-refresh`);

  if (!accessCookie || !refreshCookie) {
    return undefined;
  }

  const { metadata } = await locals.tokenService.read(accessCookie, {
    metadataOnly: true,
  });

  const expiringThreshold = TokenService.getExpiresAt(
    TokenExpiresIn.FiveMinutes,
  );
  const shouldRefresh = metadata.expiresAt <= expiringThreshold;

  if (shouldRefresh) {
    const refreshResult = await locals.api.auth.refresh();
    if (!refreshResult.ok) {
      return undefined;
    }
  }

  const result = await locals.api.user.whoAmI();
  return result.ok ? result.data : undefined;
}
