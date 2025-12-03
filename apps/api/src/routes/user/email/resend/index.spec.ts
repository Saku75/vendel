import { parseString } from "set-cookie-parser";
import { describe, expect, it } from "vitest";

import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import type { Err, Ok } from "$lib/types/result";

import { testUsers } from "$test/fixtures/users";
import { testFetch } from "$test/utils/fetch";

describe("Resend Confirm Email", () => {
  describe("POST /user/email/resend", () => {
    it("should resend confirmation email for unverified user", async () => {
      const signInStart = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUsers.UserTwo.email,
          captcha: "test-captcha-token",
        }),
      });

      const signInStartJson = (await signInStart.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      const passwordClientHash = bytesToBase64(
        await scrypt(
          testUsers.UserTwo.password,
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

      const response = await testFetch("/user/email/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      expect(response.status).toBe(200);

      const json = (await response.json()) as Ok;
      expect(json.status).toBe(200);
      expect(json.message).toBe("Confirmation email sent");
    });

    it("should return 400 if email already verified", async () => {
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

      const response = await testFetch("/user/email/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      expect(response.status).toBe(400);

      const json = (await response.json()) as Err;
      expect(json.status).toBe(400);
      expect(json.message).toBe("Email already verified");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await testFetch("/user/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      expect(response.status).toBe(401);

      const json = (await response.json()) as Err;
      expect(json.status).toBe(401);
      expect(json.message).toBe("Not authenticated");
    });

    it("should return 401 with invalid token", async () => {
      const response = await testFetch("/user/email/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vendel_local-access=invalid-token",
        },
      });

      expect(response.status).toBe(401);
    });
  });
});
