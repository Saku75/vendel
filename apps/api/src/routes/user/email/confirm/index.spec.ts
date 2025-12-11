import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  TokenExpiresIn,
  TokenPurpose,
  TokenService,
} from "@package/token-service";

import { userEmails } from "$lib/database/schema/user-emails";
import { tokenService } from "$lib/services/token";
import type { ConfirmEmailResponse } from "$lib/types";
import type { Err, Ok } from "$lib/types/result";
import type { UserConfirmEmailToken } from "$lib/types/user/tokens/confirm-email";

import { testUsers } from "$test/fixtures/users";
import { testDatabase } from "$test/utils/database";
import { testFetch } from "$test/utils/fetch";

describe("Confirm Email", () => {
  describe("POST /user/email/confirm", () => {
    it("should confirm email with valid token", async () => {
      const token = await tokenService.create<UserConfirmEmailToken>(
        {
          userId: testUsers.UserTwo.id,
          email: testUsers.UserTwo.emails[0].email,
        },
        {
          purpose: TokenPurpose.ConfirmEmail,
          expiresAt: TokenService.getExpiresAt(TokenExpiresIn.OneDay),
        },
      );

      const response = await testFetch("/user/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.token,
        }),
      });

      expect(response.status).toBe(200);

      const json = await response.json<Ok<ConfirmEmailResponse>>();
      expect(json.status).toBe(200);

      const userEmail = await testDatabase
        .select({ verified: userEmails.verified })
        .from(userEmails)
        .where(
          and(
            eq(userEmails.userId, testUsers.UserTwo.id),
            eq(userEmails.email, testUsers.UserTwo.emails[0].email),
          ),
        )
        .get();

      expect(userEmail!.verified).toBe(true);
    });

    it("should reject invalid token format", async () => {
      const response = await testFetch("/user/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "invalid-token",
        }),
      });

      expect(response.status).toBe(400);

      const json = await response.json<Err>();
      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
    });

    it("should reject expired token", async () => {
      const token = await tokenService.create<UserConfirmEmailToken>(
        {
          userId: testUsers.UserTwo.id,
          email: testUsers.UserTwo.emails[0].email,
        },
        {
          purpose: TokenPurpose.ConfirmEmail,
          expiresAt: Date.now() - 1000,
        },
      );

      const response = await testFetch("/user/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.token,
        }),
      });

      expect(response.status).toBe(400);

      const json = await response.json<Err>();
      expect(json.status).toBe(400);
      expect(json.message).toBe("Invalid or expired token");
    });

    it("should reject token with wrong purpose", async () => {
      const token = await tokenService.create<UserConfirmEmailToken>(
        {
          userId: testUsers.UserTwo.id,
          email: testUsers.UserTwo.emails[0].email,
        },
        {
          purpose: "wrong-purpose" as TokenPurpose,
          expiresAt: TokenService.getExpiresAt(TokenExpiresIn.OneDay),
        },
      );

      const response = await testFetch("/user/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.token,
        }),
      });

      expect(response.status).toBe(400);

      const json = await response.json<Err>();
      expect(json.status).toBe(400);
      expect(json.message).toBe("Invalid or expired token");
    });

    it("should return 404 for non-existent email", async () => {
      const token = await tokenService.create<UserConfirmEmailToken>(
        {
          userId: "non-existent-user-id",
          email: "non-existent@example.com",
        },
        {
          purpose: TokenPurpose.ConfirmEmail,
          expiresAt: TokenService.getExpiresAt(TokenExpiresIn.OneDay),
        },
      );

      const response = await testFetch("/user/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.token,
        }),
      });

      expect(response.status).toBe(404);

      const json = await response.json<Err>();
      expect(json.status).toBe(404);
      expect(json.message).toBe("Email not found");
    });
  });
});
