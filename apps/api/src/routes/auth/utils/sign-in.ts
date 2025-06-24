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
    `${url.host}-auth-refresh`,
    c.var.token.create(
      { refreshTokenId: refreshToken[0].id },
      {
        purpose: TokenPurpose.Refresh,
        expiresAt: Number(refreshToken[0].expiresAt.toUTCString()),
      },
    ),
    {
      domain: c.env.MODE === "local" ? "localhost" : ".vendel.dk",
      httpOnly: true,
      secure: true,
      path:
        url.origin === c.env.API_ORIGIN ? "/auth/refresh" : "/api/auth/refresh",
    },
  );

  setCookie(
    c,
    `${url.host}-auth`,
    c.var.token.create(
      { refreshTokenId: refreshToken[0].id, userId },
      { purpose: TokenPurpose.Auth },
    ),
    {
      domain: ".vendel.dk",
      httpOnly: true,
      secure: true,
    },
  );
}

export { signIn };
