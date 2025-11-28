import { eq } from "drizzle-orm";
import { parseString } from "set-cookie-parser";
import { describe, expect, it } from "vitest";

import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import { refreshTokenFamilies } from "$lib/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/database/schema/refresh-tokens";
import type { Ok } from "$lib/types/result";

import { testUsers } from "$test/fixtures/users";
import { testDatabase } from "$test/utils/database";
import { testFetch } from "$test/utils/fetch";

describe("Sign-out", () => {
  describe("POST /auth/sign-out", () => {
    it("should sign out user and delete refresh token family", async () => {
      const signInStart = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUsers.UserOne.email,
          captcha: "test-captcha-token",
        }),
      });

      const signInStartJson = (await signInStart.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      const passwordClientHash = bytesToBase64(
        await scrypt(
          testUsers.UserOne.password,
          signInStartJson.data!.clientSalt,
        ),
      );

      const signInFinish = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: signInStartJson.data!.sessionId,
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

      const [tokenFamily] = await testDatabase
        .select({ id: refreshTokenFamilies.id })
        .from(refreshTokenFamilies)
        .innerJoin(
          refreshTokens,
          eq(refreshTokens.refreshTokenFamilyId, refreshTokenFamilies.id),
        )
        .where(eq(refreshTokenFamilies.userId, testUsers.UserOne.id))
        .orderBy(refreshTokenFamilies.createdAt)
        .limit(1);

      expect(tokenFamily).toBeDefined();

      const signOutResponse = await testFetch("/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      expect(signOutResponse.status).toBe(200);

      const json = (await signOutResponse.json()) as Ok;
      expect(json.status).toBe(200);
      expect(json.message).toBe("User signed out");

      const setCookieHeader = signOutResponse.headers.get("set-cookie");
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader).toContain("access");
      expect(setCookieHeader).toContain("refresh");

      const deletedFamily = await testDatabase
        .select()
        .from(refreshTokenFamilies)
        .where(eq(refreshTokenFamilies.id, tokenFamily.id));

      expect(deletedFamily.length).toBe(0);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await testFetch("/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      expect(response.status).toBe(401);

      const json = (await response.json()) as Ok;
      expect(json.status).toBe(401);
      expect(json.message).toBe("Not authenticated");
    });

    it("should handle invalid refresh token gracefully", async () => {
      const response = await testFetch("/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "localhost-5173:refresh=invalid-token",
        },
      });

      expect(response.status).toBe(401);
    });
  });
});
