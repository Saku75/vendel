import { createId } from "@package/crypto-utils/cuid";
import {
  TokenExpiresIn,
  TokenPurpose,
  TokenService,
} from "@package/token-service";

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
  const refreshTokenFamily = await db
    .insert(refreshTokenFamilies)
    .values({ userId })
    .returning({ id: refreshTokenFamilies.id })
    .get();

  const refreshToken = await db
    .insert(refreshTokens)
    .values({ refreshTokenFamilyId: refreshTokenFamily.id })
    .returning({ id: refreshTokens.id, expiresAt: refreshTokens.expiresAt })
    .get();

  const expiresAt = refreshToken.expiresAt.valueOf();

  const accessTokenId = createId();

  await Promise.all([
    setCookieWithToken<AuthAccessToken>(
      c,
      "access",
      {
        id: accessTokenId,
        user: { id: userId, role: userRole },
      },
      {
        purpose: TokenPurpose.Auth,
        expiresAt: TokenService.getExpiresAt(TokenExpiresIn.FifteenMinutes),
      },
      { expires: new Date(expiresAt) },
    ),

    setCookieWithToken<AuthRefreshToken>(
      c,
      "refresh",
      {
        family: refreshTokenFamily.id,
        id: refreshToken.id,
        accessTokenId: accessTokenId,
      },
      {
        purpose: TokenPurpose.Refresh,
        expiresAt,
      },
      { expires: new Date(expiresAt) },
    ),
  ]);
}

export { signIn };
