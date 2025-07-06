import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { ZodIssueCode } from "zod";

import { TokenPurpose } from "@package/token";
import { ValidatorCode } from "@package/validators";

import { users } from "$lib/server/database/schema/users";
import { testDatabase } from "$lib/test/utils/database";
import { testFetch } from "$lib/test/utils/fetch";
import { testToken } from "$lib/test/utils/token";
import { ConfirmEmailTokenData } from "$lib/types/auth/token";
import { Err, Ok } from "$lib/types/result";

async function createUnverifiedUser(
  email: string,
  firstName: string = "Test",
  lastName: string = "User",
) {
  // Use the sign-up flow to create a properly configured user
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

  const startData = await startResponse.json();
  const { sessionId } = startData.data;

  // Complete sign-up (this creates the user)
  await testFetch("/auth/sign-up/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      passwordClientHash: "a".repeat(128), // Mock password hash
      captcha: "mock-captcha-token",
    }),
  });

  // Get the created user from database
  const [user] = await testDatabase
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return [user];
}

describe("Email Confirm", () => {
  describe("POST /auth/email/confirm", () => {
    it("should confirm email with valid token", async () => {
      const [user] = await createUnverifiedUser(
        "john.confirm@example.com",
        "John",
        "Doe",
      );

      const token = testToken.create<ConfirmEmailTokenData>(
        { userId: user.id },
        { purpose: TokenPurpose.ConfirmEmail },
      );

      const response = await testFetch("/auth/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as Ok;

      expect(data).toEqual({
        ok: true,
        status: 200,
        message: "Email confirmed successfully",
      });

      // Verify user's email is now verified in database
      const updatedUser = await testDatabase
        .select({ emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      expect(updatedUser[0].emailVerified).toBe(true);
    });

    it("should reject malformed tokens", async () => {
      const response = await testFetch("/auth/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "invalid-token-format",
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data.ok).toBe(false);
      expect(data.status).toBe(400);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: ZodIssueCode.invalid_string,
            message: ValidatorCode.InvalidFormat,
            path: ["token"],
          }),
        ]),
      );
    });

    it("should reject expired tokens", async () => {
      const [user] = await createUnverifiedUser("jane.expired@example.com");

      // Create an expired token (expires 1 second ago)
      const expiredToken = testToken.create<ConfirmEmailTokenData>(
        { userId: user.id },
        {
          purpose: TokenPurpose.ConfirmEmail,
          expiresAt: Date.now() - 1000, // 1 second ago
        },
      );

      const response = await testFetch("/auth/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: expiredToken,
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
            message: ValidatorCode.Expired,
            path: ["token"],
          }),
        ]),
      );
    });

    it("should reject tokens with wrong purpose", async () => {
      const [user] = await createUnverifiedUser("bob.wrongpurpose@example.com");

      // Create a token with wrong purpose
      const wrongPurposeToken = testToken.create<ConfirmEmailTokenData>(
        { userId: user.id },
        { purpose: TokenPurpose.Auth }, // Wrong purpose
      );

      const response = await testFetch("/auth/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: wrongPurposeToken,
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
            message: ValidatorCode.InvalidType,
            path: ["token"],
          }),
        ]),
      );
    });

    it("should handle non-existent user", async () => {
      const fakeUserId = "fake_user_id_123";

      const token = testToken.create<ConfirmEmailTokenData>(
        { userId: fakeUserId },
        { purpose: TokenPurpose.ConfirmEmail },
      );

      const response = await testFetch("/auth/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
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

    it("should reject confirmation for already verified email", async () => {
      const [user] = await createUnverifiedUser(
        "alice.alreadyverified@example.com",
      );

      // First confirm the email
      const firstToken = testToken.create<ConfirmEmailTokenData>(
        { userId: user.id },
        { purpose: TokenPurpose.ConfirmEmail },
      );

      await testFetch("/auth/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: firstToken,
        }),
      });

      // Try to confirm again with a new token
      const secondToken = testToken.create<ConfirmEmailTokenData>(
        { userId: user.id },
        { purpose: TokenPurpose.ConfirmEmail },
      );

      const response = await testFetch("/auth/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: secondToken,
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

    it("should validate token format", async () => {
      const response = await testFetch("/auth/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "", // Empty token
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data.ok).toBe(false);
      expect(data.status).toBe(400);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["token"],
            message: expect.any(String),
          }),
        ]),
      );
    });

    it("should handle missing token", async () => {
      const response = await testFetch("/auth/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data.ok).toBe(false);
      expect(data.status).toBe(400);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["token"],
            message: expect.any(String),
          }),
        ]),
      );
    });
  });
});
