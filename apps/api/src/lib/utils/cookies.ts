import { env } from "cloudflare:workers";
import {
  deleteCookie as honoDeleteCookie,
  getCookie as honoGetCookie,
  setCookie as honoSetCookie,
} from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";

import type {
  TokenData,
  TokenPurpose,
  TokenServiceCreateResult,
  TokenServiceReadResult,
} from "@package/token-service";

import type { ServerContext } from "$lib/server";
import { tokenService } from "$lib/services/token";

function buildCookieName(name: string): string {
  return `${env.COOKIE_PREFIX}-${name}`;
}

function getDefaultCookieOptions(): CookieOptions {
  return {
    domain: env.MODE !== "local" ? ".vendel.dk" : undefined,
    httpOnly: true,
    secure: env.MODE !== "local",
    sameSite: "strict",
  };
}

async function setCookieWithToken<T extends TokenData = null>(
  c: ServerContext,
  name: string,
  data: T,
  tokenOptions: {
    purpose: TokenPurpose;
    expiresAt: number;
  },
  options?: CookieOptions,
): Promise<TokenServiceCreateResult> {
  const result = await tokenService.create(data, {
    purpose: tokenOptions.purpose,
    expiresAt: tokenOptions.expiresAt,
  });

  honoSetCookie(c, buildCookieName(name), result.token, {
    ...getDefaultCookieOptions(),
    ...options,
  });

  return result;
}

function setCookie(
  c: ServerContext,
  name: string,
  value: string,
  options?: CookieOptions,
): void {
  honoSetCookie(c, buildCookieName(name), value, {
    ...getDefaultCookieOptions(),
    ...options,
  });
}

async function getCookieWithToken<T extends TokenData = null>(
  c: ServerContext,
  name: string,
): Promise<TokenServiceReadResult<T> | undefined> {
  const cookie = honoGetCookie(c, buildCookieName(name));

  if (!cookie) return undefined;

  try {
    return await tokenService.read<T>(cookie);
  } catch (error) {
    console.error("Failed to read token from cookie:", error);
    return undefined;
  }
}

function getCookie(c: ServerContext, name: string): string | undefined {
  return honoGetCookie(c, buildCookieName(name));
}

function deleteCookie(c: ServerContext, name: string): void {
  honoDeleteCookie(c, buildCookieName(name));
}

export {
  deleteCookie,
  getCookie,
  getCookieWithToken,
  setCookie,
  setCookieWithToken,
};
