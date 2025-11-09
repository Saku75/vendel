import { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import {
  TokenExpiresIn,
  TokenPurpose,
  TokenService,
} from "@package/token-service";

import { HonoEnv } from "$lib/server";
import { AuthRefreshTokenData, AuthTokenData } from "$lib/types/auth/token";

import { cookieName } from "../cookie/name";
import { cookieOptions } from "../cookie/options";
import { getNormalizedHostname } from "../get-normalized-hostname";

const AUTH_COOKIE_NAME = "auth";
const AUTH_REFRESH_COOKIE_NAME = "auth-refresh";

async function setAuthCookie(
  c: Context<HonoEnv>,
  expiresAt: Date,
  data: AuthTokenData,
) {
  const hostname = getNormalizedHostname(c);

  setCookie(
    c,
    cookieName(AUTH_COOKIE_NAME, { prefix: hostname }),
    (
      await c.var.token.create<AuthTokenData>(data, {
        purpose: TokenPurpose.Auth,
        expiresAt: TokenService.getExpiresAt(TokenExpiresIn.FifteenMinutes),
      })
    ).token,
    cookieOptions(c, {
      expires: expiresAt,
    }),
  );
}
async function setAuthRefreshCookie(
  c: Context<HonoEnv>,
  expiresAt: Date,
  data: AuthRefreshTokenData,
) {
  const hostname = getNormalizedHostname(c);

  setCookie(
    c,
    cookieName(AUTH_REFRESH_COOKIE_NAME, { prefix: hostname }),
    (
      await c.var.token.create<AuthRefreshTokenData>(data, {
        purpose: TokenPurpose.Refresh,
        expiresAt: expiresAt.valueOf(),
      })
    ).token,
    cookieOptions(c, {
      expires: expiresAt,
    }),
  );
}

async function getAuthCookie(c: Context<HonoEnv>) {
  const hostname = getNormalizedHostname(c);

  const cookie = getCookie(
    c,
    cookieName(AUTH_COOKIE_NAME, { prefix: hostname }),
  );

  if (!cookie) return;

  try {
    return await c.var.token.read<AuthTokenData>(cookie);
  } catch (error) {
    console.error(error);

    return null;
  }
}
async function getAuthRefreshCookie(c: Context<HonoEnv>) {
  const hostname = getNormalizedHostname(c);

  const cookie = getCookie(
    c,
    cookieName(AUTH_REFRESH_COOKIE_NAME, { prefix: hostname }),
  );

  if (!cookie) return;

  try {
    return await c.var.token.read<AuthRefreshTokenData>(cookie);
  } catch (error) {
    console.error(error);

    return null;
  }
}

function deleteAuthCookie(c: Context<HonoEnv>) {
  const hostname = getNormalizedHostname(c);

  deleteCookie(c, cookieName(AUTH_COOKIE_NAME, { prefix: hostname }));
}
function deleteAuthRefreshCookie(c: Context<HonoEnv>) {
  const hostname = getNormalizedHostname(c);

  deleteCookie(c, cookieName(AUTH_REFRESH_COOKIE_NAME, { prefix: hostname }));
}

export {
  deleteAuthCookie,
  deleteAuthRefreshCookie,
  getAuthCookie,
  getAuthRefreshCookie,
  setAuthCookie,
  setAuthRefreshCookie,
};
