import { parseString } from "set-cookie-parser";
import { describe, expect, it } from "vitest";

import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import type { WhoAmIResponse } from "$lib/types";
import type { Err, Ok } from "$lib/types/result";

import { testUsers } from "$test/fixtures/users";
import { testFetch } from "$test/utils/fetch";

describe("Who Am I", () => {
  describe("GET /user/who-am-i", () => {
    it("should return authenticated user info", async () => {
      const signInStart = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUsers.UserOne.email,
          captcha: "test-captcha-token",
        }),
      });

      const signInStartJson = await signInStart.json<
        Ok<{
          sessionId: string;
          clientSalt: string;
        }>
      >();

      const passwordClientHash = bytesToBase64(
        await scrypt(
          testUsers.UserOne.password,
          signInStartJson.data.clientSalt,
        ),
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

      const response = await testFetch("/user/who-am-i", {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
      });

      expect(response.status).toBe(200);

      const json = await response.json<Ok<WhoAmIResponse>>();
      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data.user.id).toBe(testUsers.UserOne.id);
      expect(json.data.user.email).toBe(testUsers.UserOne.email);
      expect(json.data.user.firstName).toBe(testUsers.UserOne.firstName);
      expect(json.data.user.role).toBe(testUsers.UserOne.role);
      expect(json.data.user.emailVerified).toBe(
        testUsers.UserOne.emailVerified,
      );
      expect(json.data.user.approved).toBe(testUsers.UserOne.approved);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await testFetch("/user/who-am-i", {
        method: "GET",
      });

      expect(response.status).toBe(401);

      const json = await response.json<Err>();
      expect(json.status).toBe(401);
      expect(json.message).toBe("Not authenticated");
    });

    it("should return 401 with invalid token", async () => {
      const response = await testFetch("/user/who-am-i", {
        method: "GET",
        headers: {
          Cookie: "vendel_local-access=invalid-token",
        },
      });

      expect(response.status).toBe(401);
    });
  });
});
