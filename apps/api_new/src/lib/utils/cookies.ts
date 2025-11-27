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
  TokenServiceReadResult,
} from "@package/token-service";

import type { ServerContext } from "$lib/server";
import { tokenService } from "$lib/services/token";

function getHostnamePrefix(): string {
  return env.CORS_ORIGINS.split(",")[0]
    .replace(/https?:\/\//, "")
    .replace(/[.:]/g, "_");
}

function buildCookieName(name: string): string {
  return `${getHostnamePrefix()}-${name}`;
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
  options: {
    purpose: TokenPurpose;
    expiresAt: number;
  },
): Promise<void> {
  const { token } = await tokenService.create(data, {
    purpose: options.purpose,
    expiresAt: options.expiresAt,
  });

  honoSetCookie(c, buildCookieName(name), token, {
    ...getDefaultCookieOptions(),
    expires: new Date(options.expiresAt),
  });
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
