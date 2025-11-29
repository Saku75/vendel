import { eq } from "drizzle-orm";

import {
  TokenExpiresIn,
  TokenPurpose,
  TokenService,
} from "@package/token-service";

import { db } from "$lib/database";
import { refreshTokenFamilies } from "$lib/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/database/schema/refresh-tokens";
import { users } from "$lib/database/schema/users";
import type { ServerContext } from "$lib/server";
import { getAuth } from "$lib/server/middleware/require-auth";
import type { AuthAccessToken } from "$lib/types/auth/tokens/access";
import type { AuthRefreshToken } from "$lib/types/auth/tokens/refresh";
import { setCookieWithToken } from "$lib/utils/cookies";

async function invalidateTokenFamily(familyId: string): Promise<void> {
  await Promise.all([
    db
      .update(refreshTokenFamilies)
      .set({ invalidated: true, updatedAt: new Date() })
      .where(eq(refreshTokenFamilies.id, familyId)),
    db
      .update(refreshTokens)
      .set({ used: true, updatedAt: new Date() })
      .where(eq(refreshTokens.refreshTokenFamilyId, familyId)),
  ]);
}

type RefreshResult = { success: true } | { success: false; error: string };

async function refresh(c: ServerContext): Promise<RefreshResult> {
  const { refresh, access } = getAuth(c, { allowExpired: true });

  const refreshToken = await db
    .select({
      id: refreshTokens.id,
      family: refreshTokens.refreshTokenFamilyId,
      used: refreshTokens.used,
      expiresAt: refreshTokens.expiresAt,
    })
    .from(refreshTokens)
    .where(eq(refreshTokens.id, refresh.id))
    .get();

  if (!refreshToken || refreshToken.used) {
    await invalidateTokenFamily(refresh.family);
    return {
      success: false,
      error: "Refresh token invalid",
    };
  }

  if (refreshToken.expiresAt < new Date()) {
    return { success: false, error: "Refresh token expired" };
  }

  const tokenFamily = await db
    .select({ invalidated: refreshTokenFamilies.invalidated })
    .from(refreshTokenFamilies)
    .where(eq(refreshTokenFamilies.id, refresh.family))
    .get();

  if (!tokenFamily || tokenFamily.invalidated) {
    return { success: false, error: "Refresh token family invalid" };
  }

  const [newRefreshToken, user] = await Promise.all([
    db
      .insert(refreshTokens)
      .values({ refreshTokenFamilyId: refresh.family })
      .returning({ id: refreshTokens.id, expiresAt: refreshTokens.expiresAt })
      .get(),
    db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, access.user.id))
      .get(),
    db
      .update(refreshTokens)
      .set({ used: true, updatedAt: new Date() })
      .where(eq(refreshTokens.id, refresh.id)),
  ]);

  const newExpiresAt = newRefreshToken.expiresAt.valueOf();

  const accessTokenResult = await setCookieWithToken<AuthAccessToken>(
    c,
    "access",
    {
      user: user!,
    },
    {
      purpose: TokenPurpose.Auth,
      expiresAt: TokenService.getExpiresAt(TokenExpiresIn.FifteenMinutes),
    },
    { expires: new Date(newExpiresAt) },
  );

  await setCookieWithToken<AuthRefreshToken>(
    c,
    "refresh",
    {
      family: refresh.family,
      id: newRefreshToken.id,
      accessTokenId: accessTokenResult.id,
    },
    {
      purpose: TokenPurpose.Refresh,
      expiresAt: newExpiresAt,
    },
    { expires: new Date(newExpiresAt) },
  );

  return { success: true };
}

export { refresh };
