import { and, eq } from "drizzle-orm";
import { Context } from "hono";

import { HonoEnv } from "$lib/server";
import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/server/database/schema/refresh-tokens";

import { setAuthCookie, setAuthRefreshCookie } from "../cookies";
import { getAuthSession, setAuthSession } from "../session";

async function invalidateTokenFamily(c: Context<HonoEnv>, familyId: string) {
  // Get all refresh tokens in the family
  const familyTokens = await c.var.database
    .select({ id: refreshTokens.id })
    .from(refreshTokens)
    .where(eq(refreshTokens.refreshTokenFamilyId, familyId));

  // Update family and all tokens in parallel
  await Promise.all([
    // Invalidate the family
    c.var.database
      .update(refreshTokenFamilies)
      .set({ invalidated: true })
      .where(eq(refreshTokenFamilies.id, familyId)),
    // Mark all tokens as used
    c.var.database
      .update(refreshTokens)
      .set({ used: true })
      .where(eq(refreshTokens.refreshTokenFamilyId, familyId)),
    // Update all auth sessions for this family
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
  // Verify the refresh token IDs match (prevent token substitution attacks)
  if (refreshTokenId !== authRefreshTokenId) {
    return { success: false, error: "Token mismatch" };
  }

  // Get current auth session
  const authSession = await getAuthSession(c, refreshTokenId);
  if (!authSession) {
    return { success: false, error: "Session not found" };
  }

  // Check if token is already used
  if (authSession.refreshToken.used) {
    // Token replay attack - invalidate entire family
    await invalidateTokenFamily(c, authSession.refreshToken.family);
    return { success: false, error: "Token family invalidated" };
  }

  // Check if token family is invalidated
  const tokenFamily = await c.var.database
    .select({ invalidated: refreshTokenFamilies.invalidated })
    .from(refreshTokenFamilies)
    .where(eq(refreshTokenFamilies.id, authSession.refreshToken.family));

  if (!tokenFamily.length || tokenFamily[0].invalidated) {
    return { success: false, error: "Token family invalid" };
  }

  // Check if token exists and is not used in database
  const currentToken = await c.var.database
    .select({ used: refreshTokens.used, expiresAt: refreshTokens.expiresAt })
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.id, refreshTokenId), eq(refreshTokens.used, false)),
    );

  if (!currentToken.length) {
    // Token doesn't exist or is already used - invalidate family
    await invalidateTokenFamily(c, authSession.refreshToken.family);
    return { success: false, error: "Token family invalidated" };
  }

  // Check if token is expired
  if (currentToken[0].expiresAt < new Date()) {
    return { success: false, error: "Token expired" };
  }

  // Mark current token as used
  await c.var.database
    .update(refreshTokens)
    .set({ used: true })
    .where(eq(refreshTokens.id, refreshTokenId));

  // Create new refresh token
  const newRefreshToken = await c.var.database
    .insert(refreshTokens)
    .values({ refreshTokenFamilyId: authSession.refreshToken.family })
    .returning({ id: refreshTokens.id, expiresAt: refreshTokens.expiresAt });

  const newExpiresAt = newRefreshToken[0].expiresAt.valueOf();

  // Create new auth session
  await setAuthSession(
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
  );

  // Set new cookies
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
