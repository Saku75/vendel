import { describe, expect, it } from "vitest";

import {
  base64ToBytes,
  bytesToBase64,
  bytesToUtf8,
  utf8ToBytes,
} from "@package/crypto-utils/bytes";
import { gcm } from "@package/crypto-utils/gcm";

import { TokenExpiresIn } from "./enums/expires-in";
import { TokenService } from "./main";

describe("TokenService", () => {
  const createTestKeys = () => {
    const encryptionKey = new Uint8Array(32);
    const signingKey = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      encryptionKey[i] = i;
      signingKey[i] = i + 100;
    }

    return {
      encryption: encryptionKey,
      signing: signingKey,
    };
  };

  const createTestService = () => {
    return new TokenService(createTestKeys(), {
      issuer: "test-issuer",
      audience: "test-audience",
    });
  };

  describe("create", () => {
    it("should create a token with null data", async () => {
      const svc = createTestService();
      const result = await svc.create(null);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
    });

    it("should create a token with string data", async () => {
      const svc = createTestService();
      const result = await svc.create("test-data");

      expect(result.id).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it("should create a token with object data", async () => {
      const svc = createTestService();
      const data = { userId: "123", name: "Test User" };
      const result = await svc.create(data);

      expect(result.id).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it("should create a token with array data", async () => {
      const svc = createTestService();
      const data = [1, 2, 3, 4, 5];
      const result = await svc.create(data);

      expect(result.id).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it("should create a token with custom purpose", async () => {
      const svc = createTestService();
      const result = await svc.create(null, {
        purpose: "email-verification",
      });

      expect(result.id).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it("should create a token with custom expiration", async () => {
      const svc = createTestService();
      const expiresAt = TokenService.getExpiresAt(TokenExpiresIn.FiveMinutes);
      const result = await svc.create(null, { expiresAt });

      expect(result.id).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it("should create token in correct format (version.metadata.data.signature)", async () => {
      const svc = createTestService();
      const result = await svc.create(null);
      const parts = result.token.split(".");

      expect(parts.length).toBe(4);
      expect(parts[0]).toBe("v1");
      expect(parts[1]).toBeTruthy();
      expect(parts[2]).toBeTruthy();
      expect(parts[3]).toBeTruthy();
    });

    it("should create unique tokens for same data", async () => {
      const svc = createTestService();
      const data = { test: "data" };
      const result1 = await svc.create(data);
      const result2 = await svc.create(data);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.token).not.toBe(result2.token);
    });
  });

  describe("read", () => {
    it("should read a token and decrypt data", async () => {
      const svc = createTestService();
      const data = { userId: "123", name: "Test User" };
      const createResult = await svc.create(data);
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.expired).toBe(false);
      expect(readResult.token.data).toEqual(data);
      expect(readResult.token.metadata.id).toBe(createResult.id);
      expect(readResult.token.metadata.issuer).toBe("test-issuer");
      expect(readResult.token.metadata.audience).toBe("test-audience");
    });

    it("should read a token with null data", async () => {
      const svc = createTestService();
      const createResult = await svc.create(null);
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.token.data).toBe(null);
    });

    it("should read a token with string data", async () => {
      const svc = createTestService();
      const data = "test-string";
      const createResult = await svc.create(data);
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.token.data).toBe(data);
    });

    it("should read a token with array data", async () => {
      const svc = createTestService();
      const data = [1, 2, 3, 4, 5];
      const createResult = await svc.create(data);
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.token.data).toEqual(data);
    });

    it("should read token with custom purpose", async () => {
      const svc = createTestService();
      const createResult = await svc.create(null, {
        purpose: "password-reset",
      });
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.token.metadata.purpose).toBe("password-reset");
    });

    it("should read metadata only without decrypting data", async () => {
      const svc = createTestService();
      const data = { secret: "sensitive-data" };
      const createResult = await svc.create(data, {
        purpose: "test-purpose",
      });
      const readResult = await svc.read(createResult.token, {
        metadataOnly: true,
      });

      expect(readResult.verified).toBe(true);
      expect(readResult.expired).toBe(false);
      expect(readResult.metadata.id).toBe(createResult.id);
      expect(readResult.metadata.purpose).toBe("test-purpose");
      expect(readResult.metadata.issuer).toBe("test-issuer");
      expect(readResult.metadata.audience).toBe("test-audience");
      // @ts-expect-error - should not have token property in metadata-only mode
      expect(readResult.token).toBeUndefined();
    });

    it("should detect expired tokens", async () => {
      const svc = createTestService();
      const expiresAt = TokenService.now() - 1000;
      const createResult = await svc.create(null, { expiresAt });
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.expired).toBe(true);
    });

    it("should detect non-expired tokens", async () => {
      const svc = createTestService();
      const expiresAt = TokenService.getExpiresAt(TokenExpiresIn.OneHour);
      const createResult = await svc.create(null, { expiresAt });
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.expired).toBe(false);
    });
  });

  describe("signature verification", () => {
    it("should fail verification for tampered token data", async () => {
      const keys = createTestKeys();
      const svc = new TokenService(keys, {
        issuer: "test-issuer",
        audience: "test-audience",
      });
      const createResult = await svc.create({ original: "data" });

      const parts = createResult.token.split(".");
      const metadataBytes = base64ToBytes(parts[1]);
      const metadata = JSON.parse(bytesToUtf8(metadataBytes));
      const nonce = base64ToBytes(metadata.nonce);

      const tamperedData = { tampered: "different data" };
      const tamperedDataBytes = utf8ToBytes(JSON.stringify(tamperedData));
      const cipher = gcm(keys.encryption, nonce);
      const encryptedTamperedData = await cipher.encrypt(tamperedDataBytes);
      parts[2] = bytesToBase64(encryptedTamperedData);

      const tamperedToken = parts.join(".");
      const readResult = await svc.read(tamperedToken);

      expect(readResult.verified).toBe(false);
      expect(readResult.token.data).toEqual(tamperedData);
    });

    it("should fail verification for tampered metadata", async () => {
      const svc = createTestService();
      const createResult = await svc.create(
        { test: "data" },
        {
          purpose: "original-purpose",
        },
      );

      const parts = createResult.token.split(".");
      const metadataBytes = base64ToBytes(parts[1]);
      const metadata = JSON.parse(bytesToUtf8(metadataBytes));

      metadata.purpose = "tampered-purpose";

      const tamperedMetadataBytes = utf8ToBytes(JSON.stringify(metadata));
      parts[1] = bytesToBase64(tamperedMetadataBytes);

      const tamperedToken = parts.join(".");
      const readResult = await svc.read(tamperedToken);

      expect(readResult.verified).toBe(false);
      expect(readResult.token.metadata.purpose).toBe("tampered-purpose");
      expect(readResult.token.data).toEqual({ test: "data" });
    });

    it("should fail verification for invalid signature", async () => {
      const svc = createTestService();
      const createResult = await svc.create({ test: "data" });

      const parts = createResult.token.split(".");
      parts[3] = parts[3].slice(0, -1) + "X";
      const tamperedToken = parts.join(".");

      const readResult = await svc.read(tamperedToken);
      expect(readResult.verified).toBe(false);
    });

    it("should fail verification with different signing key", async () => {
      const svc = createTestService();
      const keys = createTestKeys();
      const differentKey = new Uint8Array(32).fill(255);
      const differentService = new TokenService(
        {
          encryption: keys.encryption,
          signing: differentKey,
        },
        {
          issuer: "test-issuer",
          audience: "test-audience",
        },
      );

      const createResult = await svc.create({ test: "data" });
      const readResult = await differentService.read(createResult.token);

      expect(readResult.verified).toBe(false);
    });
  });

  describe("encryption/decryption", () => {
    it("should fail to decrypt with wrong encryption key", async () => {
      const svc = createTestService();
      const keys = createTestKeys();
      const differentKey = new Uint8Array(32).fill(255);
      const differentService = new TokenService(
        {
          encryption: differentKey,
          signing: keys.signing,
        },
        {
          issuer: "test-issuer",
          audience: "test-audience",
        },
      );

      const createResult = await svc.create({ test: "data" });

      await expect(differentService.read(createResult.token)).rejects.toThrow();
    });

    it("should encrypt different data differently", async () => {
      const svc = createTestService();
      const result1 = await svc.create({ data: "first" });
      const result2 = await svc.create({ data: "second" });

      const parts1 = result1.token.split(".");
      const parts2 = result2.token.split(".");

      expect(parts1[2]).not.toBe(parts2[2]);
    });
  });

  describe("invalid tokens", () => {
    it("should throw for invalid token format (too few parts)", async () => {
      const svc = createTestService();
      const invalidToken = "v1.metadata.data";

      await expect(svc.read(invalidToken)).rejects.toThrow(
        "Invalid token format",
      );
    });

    it("should throw for invalid token format (too many parts)", async () => {
      const svc = createTestService();
      const invalidToken = "v1.metadata.data.signature.extra";

      await expect(svc.read(invalidToken)).rejects.toThrow(
        "Invalid token format",
      );
    });

    it("should throw for unsupported version", async () => {
      const svc = createTestService();
      const createResult = await svc.create(null);
      const parts = createResult.token.split(".");
      parts[0] = "v999";
      const invalidToken = parts.join(".");

      await expect(svc.read(invalidToken)).rejects.toThrow(
        "Unsupported version",
      );
    });

    it("should throw for invalid base64 in metadata", async () => {
      const svc = createTestService();
      const invalidToken = "v1.not-valid-base64!.data.signature";

      await expect(svc.read(invalidToken)).rejects.toThrow();
    });
  });

  describe("round-trip operations", () => {
    it("should handle complex nested objects", async () => {
      const svc = createTestService();
      const data = {
        user: {
          id: "123",
          profile: {
            name: "Test User",
            email: "test@example.com",
            settings: {
              theme: "dark",
              notifications: true,
            },
          },
        },
        permissions: ["read", "write", "delete"],
        metadata: {
          createdAt: TokenService.now(),
          version: 1,
        },
      };

      const createResult = await svc.create(data);
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.token.data).toEqual(data);
    });

    it("should handle unicode characters", async () => {
      const svc = createTestService();
      const data = {
        message: "Hello 世界 👋",
        emoji: "🎉🎊🎈",
        languages: ["English", "中文", "العربية", "Русский"],
      };

      const createResult = await svc.create(data);
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.token.data).toEqual(data);
    });

    it("should handle special characters and escape sequences", async () => {
      const svc = createTestService();
      const data = {
        text: "Special chars: \n\t\r\"'\\",
        json: '{"key": "value"}',
      };

      const createResult = await svc.create(data);
      const readResult = await svc.read(createResult.token);

      expect(readResult.verified).toBe(true);
      expect(readResult.token.data).toEqual(data);
    });

    it("should handle boolean and number data types", async () => {
      const svc = createTestService();
      const testCases = [
        true,
        false,
        0,
        -1,
        42,
        3.14159,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ];

      for (const data of testCases) {
        const createResult = await svc.create(data);
        const readResult = await svc.read(createResult.token);

        expect(readResult.verified).toBe(true);
        expect(readResult.token.data).toBe(data);
      }
    });
  });

  describe("metadata validation", () => {
    it("should include all required metadata fields", async () => {
      const svc = createTestService();
      const createResult = await svc.create(null);
      const readResult = await svc.read(createResult.token);

      expect(readResult.token.metadata.id).toBeDefined();
      expect(readResult.token.metadata.issuer).toBe("test-issuer");
      expect(readResult.token.metadata.audience).toBe("test-audience");
      expect(readResult.token.metadata.issuedAt).toBeDefined();
      expect(readResult.token.metadata.expiresAt).toBeDefined();
      expect(readResult.token.metadata.nonce).toBeDefined();
      expect(typeof readResult.token.metadata.nonce).toBe("string");
    });

    it("should have expiresAt after issuedAt", async () => {
      const svc = createTestService();
      const createResult = await svc.create(null);
      const readResult = await svc.read(createResult.token);

      expect(readResult.token.metadata.expiresAt).toBeGreaterThan(
        readResult.token.metadata.issuedAt,
      );
    });

    it("should preserve custom metadata fields", async () => {
      const svc = createTestService();
      const expiresAt = TokenService.getExpiresAt(
        TokenExpiresIn.FifteenMinutes,
      );
      const createResult = await svc.create(null, {
        purpose: "custom-purpose",
        expiresAt,
      });
      const readResult = await svc.read(createResult.token);

      expect(readResult.token.metadata.purpose).toBe("custom-purpose");
      expect(readResult.token.metadata.expiresAt).toBe(expiresAt);
    });
  });

  describe("static utility methods", () => {
    it("should convert seconds to milliseconds", () => {
      expect(TokenService.convertSeconds(1)).toBe(1000);
      expect(TokenService.convertSeconds(60)).toBe(60000);
      expect(TokenService.convertSeconds(3600)).toBe(3600000);
    });

    it("should get current timestamp", () => {
      const now = TokenService.now();
      const dateNow = Date.now();

      expect(now).toBeGreaterThan(0);
      expect(now).toBeLessThanOrEqual(dateNow);
      expect(dateNow - now).toBeLessThan(100);
    });

    it("should calculate correct expiration time", () => {
      const before = TokenService.now();
      const expiresAt = TokenService.getExpiresAt(TokenExpiresIn.OneHour);
      const after = TokenService.now();

      const expectedMin =
        before + TokenService.convertSeconds(TokenExpiresIn.OneHour);
      const expectedMax =
        after + TokenService.convertSeconds(TokenExpiresIn.OneHour);

      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });

    it("should work with all TokenExpiresIn enum values", () => {
      const expiryTimes = [
        TokenExpiresIn.FiveMinutes,
        TokenExpiresIn.FifteenMinutes,
        TokenExpiresIn.ThirtyMinutes,
        TokenExpiresIn.OneHour,
        TokenExpiresIn.OneDay,
        TokenExpiresIn.OneWeek,
        TokenExpiresIn.OneMonth,
      ];

      for (const expiryTime of expiryTimes) {
        const expiresAt = TokenService.getExpiresAt(expiryTime);
        const now = TokenService.now();

        expect(expiresAt).toBeGreaterThan(now);
        expect(expiresAt - now).toBeCloseTo(
          TokenService.convertSeconds(expiryTime),
          -2,
        );
      }
    });
  });

  describe("TokenExpiresIn integration", () => {
    it("should create tokens with different expiry times", async () => {
      const svc = createTestService();
      const expiryTimes = [
        TokenExpiresIn.FiveMinutes,
        TokenExpiresIn.OneHour,
        TokenExpiresIn.OneDay,
      ];

      for (const expiryTime of expiryTimes) {
        const expiresAt = TokenService.getExpiresAt(expiryTime);
        const createResult = await svc.create(null, { expiresAt });
        const readResult = await svc.read(createResult.token);

        expect(readResult.token.metadata.expiresAt).toBe(expiresAt);
        expect(readResult.expired).toBe(false);
      }
    });

    it("should respect short expiry times", async () => {
      const svc = createTestService();
      const expiresAt = TokenService.getExpiresAt(TokenExpiresIn.FiveMinutes);
      const createResult = await svc.create(null, { expiresAt });
      const readResult = await svc.read(createResult.token);

      const expectedExpiry =
        TokenService.now() +
        TokenService.convertSeconds(TokenExpiresIn.FiveMinutes);

      expect(readResult.token.metadata.expiresAt).toBeCloseTo(
        expectedExpiry,
        -2,
      );
      expect(readResult.expired).toBe(false);
    });

    it("should respect long expiry times", async () => {
      const svc = createTestService();
      const expiresAt = TokenService.getExpiresAt(TokenExpiresIn.OneMonth);
      const createResult = await svc.create(null, { expiresAt });
      const readResult = await svc.read(createResult.token);

      const expectedExpiry =
        TokenService.now() +
        TokenService.convertSeconds(TokenExpiresIn.OneMonth);

      expect(readResult.token.metadata.expiresAt).toBeCloseTo(
        expectedExpiry,
        -2,
      );
      expect(readResult.expired).toBe(false);
    });
  });
});
