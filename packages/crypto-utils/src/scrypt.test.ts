import { describe, expect, it } from "vitest";

import { scrypt } from "./scrypt";

describe("scrypt", () => {
  it("should return a Uint8Array", async () => {
    const result = await scrypt("password", "salt");
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it("should return 256 bytes", async () => {
    const result = await scrypt("password", "salt");
    expect(result.length).toBe(256);
  });

  it("should be deterministic - same inputs produce same output", async () => {
    const result1 = await scrypt("password", "salt");
    const result2 = await scrypt("password", "salt");
    expect(result1).toEqual(result2);
  });

  it("should produce different hashes for different passwords", async () => {
    const hash1 = await scrypt("password1", "salt");
    const hash2 = await scrypt("password2", "salt");
    expect(hash1).not.toEqual(hash2);
  });

  it("should produce different hashes for different salts", async () => {
    const hash1 = await scrypt("password", "salt1");
    const hash2 = await scrypt("password", "salt2");
    expect(hash1).not.toEqual(hash2);
  });

  it("should handle empty password", async () => {
    const result = await scrypt("", "salt");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(256);
  });

  it("should handle empty salt", async () => {
    const result = await scrypt("password", "");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(256);
  });

  it("should handle both empty strings", async () => {
    const result = await scrypt("", "");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(256);
  });

  it("should handle long passwords", async () => {
    const longPassword = "a".repeat(1000);
    const result = await scrypt(longPassword, "salt");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(256);
  });

  it("should handle long salts", async () => {
    const longSalt = "a".repeat(1000);
    const result = await scrypt("password", longSalt);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(256);
  });

  it("should handle special characters in password", async () => {
    const result = await scrypt("p@ssw0rd!#$%^&*()", "salt");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(256);
  });

  it("should handle Unicode characters", async () => {
    const result = await scrypt("пароль世界👋", "salt");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(256);
  });

  it("should produce cryptographically strong output", async () => {
    const hashes = await Promise.all([
      scrypt("password1", "salt"),
      scrypt("password2", "salt"),
      scrypt("password3", "salt"),
    ]);

    const hash1Slice = hashes[0].slice(0, 32);
    const hash2Slice = hashes[1].slice(0, 32);
    const hash3Slice = hashes[2].slice(0, 32);

    expect(hash1Slice).not.toEqual(hash2Slice);
    expect(hash2Slice).not.toEqual(hash3Slice);
    expect(hash1Slice).not.toEqual(hash3Slice);
  });

  it("should handle realistic password/salt pairs", async () => {
    const password = "MyS3cur3P@ssw0rd!";
    const salt = "randomSalt123456";

    const hash1 = await scrypt(password, salt);
    const hash2 = await scrypt(password, salt);

    expect(hash1).toEqual(hash2);
    expect(hash1.length).toBe(256);
  });
});
