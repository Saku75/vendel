import { Context } from "hono";
import { setCookie } from "hono/cookie";

import { TokenPurpose } from "@repo/token";

import { refreshTokenFamilies } from "$lib/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/database/schema/refresh-tokens";
import { HonoEnv } from "$lib/utils/app";

async function signIn(c: Context<HonoEnv>, userId: string) {
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
    `${url.hostname}-auth-refresh`,
    c.var.token.create(
      { refreshTokenId: refreshToken[0].id },
      {
        purpose: TokenPurpose.Refresh,
        expiresAt: Number(refreshToken[0].expiresAt.toUTCString()),
      },
    ),
    {
      domain: c.env.MODE !== "local" ? ".vendel.dk" : undefined,
      httpOnly: true,
      secure: c.env.MODE !== "local",
      sameSite: "strict",
      expires: refreshToken[0].expiresAt,
      path:
        c.env.MODE !== "local" && url.origin === c.env.API_ORIGIN
          ? "/auth/refresh"
          : "/api/auth/refresh",
    },
  );

  setCookie(
    c,
    `${url.hostname}-auth`,
    c.var.token.create(
      { refreshTokenId: refreshToken[0].id, userId },
      { purpose: TokenPurpose.Auth },
    ),
    {
      domain: c.env.MODE !== "local" ? ".vendel.dk" : undefined,
      httpOnly: true,
      secure: c.env.MODE !== "local",
      sameSite: "strict",
      expires: refreshToken[0].expiresAt,
      path:
        c.env.MODE !== "local" && url.origin === c.env.API_ORIGIN
          ? "/"
          : "/api",
    },
  );
}

export { signIn };
