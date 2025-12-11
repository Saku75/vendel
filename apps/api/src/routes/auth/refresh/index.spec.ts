import { eq } from "drizzle-orm";
import { parseString } from "set-cookie-parser";
import { describe, expect, it } from "vitest";

import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { createId } from "@package/crypto-utils/cuid";
import { scrypt } from "@package/crypto-utils/scrypt";
import { TokenPurpose } from "@package/token-service";

import { refreshTokenFamilies } from "$lib/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/database/schema/refresh-tokens";
import type { AuthRole } from "$lib/enums/auth/role";
import { tokenService } from "$lib/services/token";
import type { RefreshResponse, SignInStartResponse } from "$lib/types";
import type { AuthAccessToken } from "$lib/types/auth/tokens/access";
import type { AuthRefreshToken } from "$lib/types/auth/tokens/refresh";
import type { Err, Ok } from "$lib/types/result";

import { testUsers } from "$test/fixtures/users";
import { testDatabase } from "$test/utils/database";
import { testFetch } from "$test/utils/fetch";

async function signInAndGetTokenInfo(
  user: (typeof testUsers)[keyof typeof testUsers],
) {
  const signInStart = await testFetch("/auth/sign-in/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.emails[0].email,
      captcha: "test-captcha-token",
    }),
  });

  const signInStartJson = await signInStart.json<Ok<SignInStartResponse>>();

  const passwordClientHash = bytesToBase64(
    await scrypt(user.password, signInStartJson.data.clientSalt),
  );

  const signInFinish = await testFetch("/auth/sign-in/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: signInStartJson.data.sessionId,
      passwordClientHash,
      captcha: "test-captcha-token",
    }),
  });

  const setCookies = signInFinish.headers.getSetCookie();
  const cookieHeader = setCookies
    .map((cookie) => {
      const parsed = parseString(cookie);
      return `${parsed.name}=${parsed.value}`;
    })
    .filter((cookie) => !cookie.endsWith("="))
    .join("; ");

  const refreshToken = await testDatabase
    .select({
      id: refreshTokens.id,
      familyId: refreshTokens.refreshTokenFamilyId,
    })
    .from(refreshTokens)
    .innerJoin(
      refreshTokenFamilies,
      eq(refreshTokens.refreshTokenFamilyId, refreshTokenFamilies.id),
    )
    .where(eq(refreshTokenFamilies.userId, user.id))
    .orderBy(refreshTokens.createdAt)
    .get();

  return {
    cookieHeader,
    refreshTokenId: refreshToken?.id,
    familyId: refreshToken?.familyId,
  };
}

async function createExpiringTokens(
  user: (typeof testUsers)[keyof typeof testUsers],
) {
  const family = await testDatabase
    .insert(refreshTokenFamilies)
    .values({ userId: user.id })
    .returning({ id: refreshTokenFamilies.id })
    .get();

  const refreshTokenRecord = await testDatabase
    .insert(refreshTokens)
    .values({ refreshTokenFamilyId: family.id })
    .returning({ id: refreshTokens.id, expiresAt: refreshTokens.expiresAt })
    .get();

  const accessTokenId = createId();

  const accessTokenResult = await tokenService.create<AuthAccessToken>(
    { id: accessTokenId, user: { id: user.id, role: user.role as AuthRole } },
    {
      purpose: TokenPurpose.Auth,
      expiresAt: Date.now() + 60 * 1000,
    },
  );

  const refreshExpiresAt = refreshTokenRecord.expiresAt.valueOf();
  const refreshTokenResult = await tokenService.create<AuthRefreshToken>(
    {
      family: family.id,
      id: refreshTokenRecord.id,
      accessTokenId: accessTokenId,
    },
    {
      purpose: TokenPurpose.Refresh,
      expiresAt: refreshExpiresAt,
    },
  );

  const cookieHeader = `vendel_local-access=${accessTokenResult.token}; vendel_local-refresh=${refreshTokenResult.token}`;

  return {
    cookieHeader,
    refreshTokenId: refreshTokenRecord.id,
    familyId: family.id,
  };
}

describe("Refresh", () => {
  describe("POST /auth/refresh", () => {
    it("should return 'Session refresh not required' when access token is still valid", async () => {
      const { cookieHeader } = await signInAndGetTokenInfo(testUsers.UserOne);

      const response = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      expect(response.status).toBe(200);

      const json = await response.json<Ok<RefreshResponse>>();
      expect(json.status).toBe(200);
      expect(json.message).toBe("Session refresh not required");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await testFetch("/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      expect(response.status).toBe(401);

      const json = await response.json<Err>();
      expect(json.status).toBe(401);
      expect(json.message).toBe("Not authenticated");
    });

    it("should return 401 with invalid cookie", async () => {
      const response = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vendel_local-access=invalid; vendel_local-refresh=invalid",
        },
      });

      expect(response.status).toBe(401);
    });

    it("should successfully refresh and rotate tokens when access token is about to expire", async () => {
      const { cookieHeader, refreshTokenId } = await createExpiringTokens(
        testUsers.UserTwo,
      );

      const response = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      expect(response.status).toBe(200);

      const json = await response.json<Ok<RefreshResponse>>();
      expect(json.message).toBe("Session refreshed");

      const originalToken = await testDatabase
        .select({ used: refreshTokens.used })
        .from(refreshTokens)
        .where(eq(refreshTokens.id, refreshTokenId))
        .get();

      expect(originalToken).toBeDefined();
      expect(originalToken!.used).toBe(true);

      const setCookies = response.headers.getSetCookie();
      expect(setCookies.length).toBeGreaterThan(0);

      const hasAccessCookie = setCookies.some((c) =>
        c.includes("vendel_local-access"),
      );
      const hasRefreshCookie = setCookies.some((c) =>
        c.includes("vendel_local-refresh"),
      );
      expect(hasAccessCookie).toBe(true);
      expect(hasRefreshCookie).toBe(true);
    });

    it("should invalidate token family when refresh token is reused", async () => {
      const { cookieHeader, refreshTokenId, familyId } =
        await createExpiringTokens(testUsers.Admin);

      await testDatabase
        .update(refreshTokens)
        .set({ used: true, updatedAt: new Date() })
        .where(eq(refreshTokens.id, refreshTokenId));

      const response = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      expect(response.status).toBe(401);

      const json = await response.json<Err>();
      expect(json.message).toBe("Refresh token invalid");

      const family = await testDatabase
        .select({ invalidated: refreshTokenFamilies.invalidated })
        .from(refreshTokenFamilies)
        .where(eq(refreshTokenFamilies.id, familyId))
        .get();

      expect(family).toBeDefined();
      expect(family!.invalidated).toBe(true);
    });

    it("should return 401 when token family is already invalidated", async () => {
      const { cookieHeader, familyId } = await createExpiringTokens(
        testUsers.UserOne,
      );

      await testDatabase
        .update(refreshTokenFamilies)
        .set({ invalidated: true, updatedAt: new Date() })
        .where(eq(refreshTokenFamilies.id, familyId));

      const response = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      expect(response.status).toBe(401);

      const json = await response.json<Err>();
      expect(json.message).toBe("Refresh token family invalid");
    });

    it("should return 401 when refresh token is expired", async () => {
      const { cookieHeader, refreshTokenId } = await createExpiringTokens(
        testUsers.UserTwo,
      );

      const pastDate = new Date(Date.now() - 1000 * 60 * 60);
      await testDatabase
        .update(refreshTokens)
        .set({ expiresAt: pastDate, updatedAt: new Date() })
        .where(eq(refreshTokens.id, refreshTokenId));

      const response = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      expect(response.status).toBe(401);

      const json = await response.json<Err>();
      expect(json.message).toBe("Refresh token expired");
    });
  });
});
