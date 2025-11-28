import { parseString } from "set-cookie-parser";
import { describe, expect, it } from "vitest";

import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import type { Err, Ok } from "$lib/types/result";
import type { WhoAmIResponse } from "$lib/types/routes/user/who-am-i";

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

      const response = await testFetch("/user/who-am-i", {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
      });

      expect(response.status).toBe(200);

      const json = (await response.json()) as Ok<WhoAmIResponse>;
      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data!.id).toBe(testUsers.UserOne.id);
      expect(json.data!.email).toBe(testUsers.UserOne.email);
      expect(json.data!.firstName).toBe(testUsers.UserOne.firstName);
      expect(json.data!.role).toBe(testUsers.UserOne.role);
      expect(json.data!.emailVerified).toBe(testUsers.UserOne.emailVerified);
      expect(json.data!.approved).toBe(testUsers.UserOne.approved);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await testFetch("/user/who-am-i", {
        method: "GET",
      });

      expect(response.status).toBe(401);

      const json = (await response.json()) as Err;
      expect(json.status).toBe(401);
      expect(json.message).toBe("Not authenticated");
    });

    it("should return 401 with invalid token", async () => {
      const response = await testFetch("/user/who-am-i", {
        method: "GET",
        headers: {
          Cookie: "localhost-5173:access=invalid-token",
        },
      });

      expect(response.status).toBe(401);
    });
  });
});
