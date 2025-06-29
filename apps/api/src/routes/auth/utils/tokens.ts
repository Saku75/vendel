import { createId } from "@paralleldrive/cuid2";
import { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";

import { TokenPurpose } from "@package/token";

import { refreshTokenFamilies } from "$lib/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/database/schema/refresh-tokens";
import { AuthRole } from "$lib/enums/auth/role";
import { authSessionUserKey } from "$lib/middleware/auth";
import { AuthSessionUser } from "$lib/types/auth/session";
import {
  AuthTokenData,
  AuthTokens,
  RefreshTokenData,
} from "$lib/types/auth/tokens";
import { HonoEnv } from "$lib/utils/app";

function cookieName(
  name: string,
  options?: { prefix?: string; suffix?: string },
): string {
  const fullName: string[] = [];

  if (options?.prefix) fullName.push(options.prefix);
  fullName.push(name);
  if (options?.suffix) fullName.push(options.suffix);

  return fullName.join("-");
}

function cookieOptions(
  c: Context<HonoEnv>,
  options: CookieOptions,
): CookieOptions {
  return {
    domain: c.env.MODE !== "local" ? ".vendel.dk" : undefined,
    httpOnly: true,
    secure: c.env.MODE !== "local",
    sameSite: "strict",
    ...options,
    path: "/",
  };
}

const REFRESH_TOKEN_NAME = "auth-refresh";
const AUTH_TOKEN_NAME = "auth";

async function setAuthTokens(
  c: Context<HonoEnv>,
  userId: string,
  userRole: AuthRole | null,
) {
  const refreshTokenFamily = await c.var.database
    .insert(refreshTokenFamilies)
    .values({ userId })
    .returning({ id: refreshTokenFamilies.id });

  const refreshToken = await c.var.database
    .insert(refreshTokens)
    .values({ refreshTokenFamilyId: refreshTokenFamily[0].id })
    .returning({ id: refreshTokens.id, expiresAt: refreshTokens.expiresAt });

  const url = new URL(c.req.url);

  setCookie(
    c,
    cookieName(REFRESH_TOKEN_NAME, { prefix: url.hostname }),
    c.var.token.create<RefreshTokenData>(
      { refreshTokenId: refreshToken[0].id },
      {
        purpose: TokenPurpose.Refresh,
        expiresAt: Number(refreshToken[0].expiresAt.toUTCString()),
      },
    ),
    cookieOptions(c, {
      expires: refreshToken[0].expiresAt,
    }),
  );

  const sessionId = createId();

  await c.env.KV.put(
    authSessionUserKey(sessionId),
    JSON.stringify({
      id: userId,
      role: userRole,
    } satisfies AuthSessionUser),
    { expiration: refreshToken[0].expiresAt.valueOf() / 1000 },
  );

  setCookie(
    c,
    cookieName(AUTH_TOKEN_NAME, { prefix: url.hostname }),
    c.var.token.create<AuthTokenData>(
      { refreshTokenId: refreshToken[0].id, authTokenId: sessionId },
      { purpose: TokenPurpose.Auth },
    ),
    cookieOptions(c, {
      expires: refreshToken[0].expiresAt,
    }),
  );
}

function getAuthTokens(c: Context<HonoEnv>): Partial<AuthTokens> {
  const url = new URL(c.req.url);

  const refreshCookie = getCookie(
    c,
    cookieName(REFRESH_TOKEN_NAME, { prefix: url.hostname }),
  );
  const authCookie = getCookie(
    c,
    cookieName(AUTH_TOKEN_NAME, { prefix: url.hostname }),
  );

  return {
    refresh: refreshCookie
      ? c.var.token.read<RefreshTokenData>(refreshCookie)
      : undefined,
    auth: authCookie ? c.var.token.read<AuthTokenData>(authCookie) : undefined,
  };
}

function removeAuthTokens(c: Context<HonoEnv>) {
  const url = new URL(c.req.url);

  deleteCookie(c, cookieName(REFRESH_TOKEN_NAME, { prefix: url.hostname }));
  deleteCookie(c, cookieName(AUTH_TOKEN_NAME, { prefix: url.hostname }));
}

export { getAuthTokens, removeAuthTokens, setAuthTokens };
