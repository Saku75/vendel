import { and, eq } from "drizzle-orm";
import { Context } from "hono";

import { HonoEnv } from "$lib/server";
import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/server/database/schema/refresh-tokens";

import { setAuthCookie, setAuthRefreshCookie } from "../cookies";
import { getAuthSession, setAuthSession } from "../session";

async function invalidateTokenFamily(c: Context<HonoEnv>, familyId: string) {
  const familyTokens = await c.var.database
    .select({ id: refreshTokens.id })
    .from(refreshTokens)
    .where(eq(refreshTokens.refreshTokenFamilyId, familyId));

  await Promise.all([
    c.var.database
      .update(refreshTokenFamilies)
      .set({ invalidated: true })
      .where(eq(refreshTokenFamilies.id, familyId)),

    c.var.database
      .update(refreshTokens)
      .set({ used: true })
      .where(eq(refreshTokens.refreshTokenFamilyId, familyId)),

    ...familyTokens.map(async (token) => {
      const session = await getAuthSession(c, token.id);
      if (session) {
        await setAuthSession(
          c,
          token.id,
          {
            refreshToken: { ...session.refreshToken, used: true },
            user: session.user,
          },
          { expiration: session.refreshToken.expiresAt / 1000 },
        );
      }
    }),
  ]);
}

async function refreshSession(
  c: Context<HonoEnv>,
  {
    refreshTokenId,
    authRefreshTokenId,
  }: { refreshTokenId: string; authRefreshTokenId: string },
) {
  if (refreshTokenId !== authRefreshTokenId) {
    return { success: false, error: "Token mismatch" };
  }

  const authSession = await getAuthSession(c, refreshTokenId);
  if (!authSession) {
    return { success: false, error: "Session not found" };
  }

  if (authSession.refreshToken.used) {
    await invalidateTokenFamily(c, authSession.refreshToken.family);
    return { success: false, error: "Token family invalidated" };
  }

  const tokenFamily = await c.var.database
    .select({ invalidated: refreshTokenFamilies.invalidated })
    .from(refreshTokenFamilies)
    .where(eq(refreshTokenFamilies.id, authSession.refreshToken.family));

  if (!tokenFamily.length || tokenFamily[0].invalidated) {
    return { success: false, error: "Token family invalid" };
  }

  const currentToken = await c.var.database
    .select({ used: refreshTokens.used, expiresAt: refreshTokens.expiresAt })
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.id, refreshTokenId), eq(refreshTokens.used, false)),
    );

  if (!currentToken.length) {
    await invalidateTokenFamily(c, authSession.refreshToken.family);
    return { success: false, error: "Token family invalidated" };
  }

  if (currentToken[0].expiresAt < new Date()) {
    return { success: false, error: "Token expired" };
  }

  await c.var.database
    .update(refreshTokens)
    .set({ used: true })
    .where(eq(refreshTokens.id, refreshTokenId));

  const newRefreshToken = await c.var.database
    .insert(refreshTokens)
    .values({ refreshTokenFamilyId: authSession.refreshToken.family })
    .returning({ id: refreshTokens.id, expiresAt: refreshTokens.expiresAt });

  const newExpiresAt = newRefreshToken[0].expiresAt.valueOf();

  c.executionCtx.waitUntil(
    setAuthSession(
      c,
      newRefreshToken[0].id,
      {
        refreshToken: {
          family: authSession.refreshToken.family,
          id: newRefreshToken[0].id,
          expiresAt: newExpiresAt,
          used: false,
        },
        user: authSession.user,
      },
      { expiration: newExpiresAt / 1000 },
    ),
  );

  setAuthCookie(c, newRefreshToken[0].expiresAt, {
    refreshToken: {
      family: authSession.refreshToken.family,
      id: newRefreshToken[0].id,
      expiresAt: newExpiresAt,
    },
    user: authSession.user,
  });
  setAuthRefreshCookie(c, newRefreshToken[0].expiresAt, {
    family: authSession.refreshToken.family,
    id: newRefreshToken[0].id,
  });

  return { success: true };
}

export { refreshSession };
