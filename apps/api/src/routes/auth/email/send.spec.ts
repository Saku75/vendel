import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { ZodIssueCode } from "zod";

import { ValidatorCode } from "@package/validators";

import { users } from "$lib/server/database/schema/users";
import { TEST_USERS } from "$lib/test/fixtures/users";
import { testDatabase } from "$lib/test/utils/database";
import { testFetch } from "$lib/test/utils/fetch";
import { Err, Ok } from "$lib/types/result";

import { SignInStartResponse } from "../sign-in";

async function createUnverifiedUserAndSignIn(
  email: string,
  firstName: string = "Test",
  lastName: string = "User",
) {
  const startResponse = await testFetch("/auth/sign-up/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      captcha: "mock-captcha-token",
    }),
  });

  const startData = await startResponse.json<Ok<SignInStartResponse>>();
  const { sessionId } = startData.data!;

  const finishResponse = await testFetch("/auth/sign-up/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      passwordClientHash: "a".repeat(128),
      captcha: "mock-captcha-token",
    }),
  });

  const [user] = await testDatabase
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return {
    user,
    authCookies: finishResponse.headers.getSetCookie(),
  };
}

describe("Email Send", () => {
  describe("POST /auth/email/send", () => {
    it("should send confirmation email for authenticated user with unverified email", async () => {
      const { authCookies } = await createUnverifiedUserAndSignIn(
        "john.unverified@example.com",
        "John",
        "Doe",
      );

      const response = await testFetch("/auth/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookies.join("; "),
        },
        body: JSON.stringify({
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as Ok;

      expect(data).toEqual({
        ok: true,
        status: 200,
        message: "Confirmation email sent",
      });
    });

    it("should reject unauthenticated requests", async () => {
      const response = await testFetch("/auth/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(401);
      const data = (await response.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 401,
        message: "Not authenticated",
      });
    });

    it("should reject requests for already verified email", async () => {
      const verifiedUser = TEST_USERS.USER_ONE;

      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifiedUser.email,
          captcha: "mock-captcha-token",
        }),
      });

      const startData = await startResponse.json<Ok<SignInStartResponse>>();
      const { sessionId } = startData.data!;

      const finishResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: verifiedUser.password,
          captcha: "mock-captcha-token",
        }),
      });

      const authCookies = finishResponse.headers.getSetCookie();

      const response = await testFetch("/auth/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookies.join("; "),
        },
        body: JSON.stringify({
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 400,
        message: "Email already verified",
      });
    });

    it("should validate captcha", async () => {
      const { authCookies } = await createUnverifiedUserAndSignIn(
        "jane.captcha@example.com",
      );

      const response = await testFetch("/auth/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookies.join("; "),
        },
        body: JSON.stringify({
          captcha: "",
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data.ok).toBe(false);
      expect(data.status).toBe(400);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: ZodIssueCode.custom,
            message: ValidatorCode.Invalid,
            path: ["captcha"],
          }),
        ]),
      );
    });

    it("should handle missing captcha", async () => {
      const { authCookies } = await createUnverifiedUserAndSignIn(
        "bob.nocaptcha@example.com",
      );

      const response = await testFetch("/auth/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookies.join("; "),
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data.ok).toBe(false);
      expect(data.status).toBe(400);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["captcha"],
            message: expect.any(String),
          }),
        ]),
      );
    });

    it("should handle non-existent user", async () => {
      const { user, authCookies } = await createUnverifiedUserAndSignIn(
        "temp.user@example.com",
      );

      await testDatabase.delete(users).where(eq(users.id, user.id));

      const response = await testFetch("/auth/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookies.join("; "),
        },
        body: JSON.stringify({
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(404);
      const data = (await response.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 404,
        message: "User not found",
      });
    });
  });
});
