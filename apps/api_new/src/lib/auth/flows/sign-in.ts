import { createId } from "@package/crypto-utils/cuid";
import {
  TokenExpiresIn,
  TokenPurpose,
  TokenService,
} from "@package/token-service";

import { authSessions } from "$lib/auth/sessions";
import { db } from "$lib/database";
import { refreshTokenFamilies } from "$lib/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/database/schema/refresh-tokens";
import type { AuthRole } from "$lib/enums/auth/role";
import type { ServerContext } from "$lib/server";
import type { AuthAccessToken } from "$lib/types/auth/tokens/access";
import type { AuthRefreshToken } from "$lib/types/auth/tokens/refresh";
import { setCookieWithToken } from "$lib/utils/cookies";

async function signIn(
  c: ServerContext,
  { userId, userRole }: { userId: string; userRole: AuthRole },
): Promise<void> {
  const [refreshTokenFamily] = await db
    .insert(refreshTokenFamilies)
    .values({ userId })
    .returning({ id: refreshTokenFamilies.id });

  const [refreshToken] = await db
    .insert(refreshTokens)
    .values({ refreshTokenFamilyId: refreshTokenFamily.id })
    .returning({ id: refreshTokens.id, expiresAt: refreshTokens.expiresAt });

  const expiresAt = refreshToken.expiresAt.valueOf();

  const sessionId = createId();

  const user: AuthAccessToken["user"] = { id: userId, role: userRole };
  const refreshIds: Omit<AuthRefreshToken, "sessionId"> = {
    family: refreshTokenFamily.id,
    id: refreshToken.id,
  };

  await authSessions.set(
    refreshToken.id,
    {
      sessionId,
      user,
      refreshToken: {
        ...refreshIds,
        expiresAt,
        used: false,
      },
    },
    { expiration: Math.floor(expiresAt / 1000) },
  );

  await setCookieWithToken<AuthAccessToken>(
    c,
    "access",
    {
      sessionId,
      user,
    },
    {
      purpose: TokenPurpose.Auth,
      expiresAt: TokenService.getExpiresAt(TokenExpiresIn.FifteenMinutes),
    },
  );

  await setCookieWithToken<AuthRefreshToken>(
    c,
    "refresh",
    {
      sessionId,
      ...refreshIds,
    },
    {
      purpose: TokenPurpose.Refresh,
      expiresAt,
    },
  );
}

export { signIn };
