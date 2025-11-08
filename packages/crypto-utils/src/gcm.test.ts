import { describe, expect, it } from "vitest";

import { gcm } from "./gcm";

describe("gcm", () => {
  const key256 = new Uint8Array(32); // 256-bit key
  const key128 = new Uint8Array(16); // 128-bit key
  const nonce = new Uint8Array(12); // 96-bit nonce (recommended)

  // Fill with test data
  for (let i = 0; i < key256.length; i++) {
    key256[i] = i;
  }
  for (let i = 0; i < key128.length; i++) {
    key128[i] = i;
  }
  for (let i = 0; i < nonce.length; i++) {
    nonce[i] = i + 100;
  }

  describe("encrypt/decrypt round-trip", () => {
    it("should encrypt and decrypt data correctly", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher = gcm(key256, nonce);

      const encrypted = await cipher.encrypt(plaintext);
      const decrypted = await cipher.decrypt(encrypted);

      expect(decrypted).toEqual(plaintext);
    });

    it("should handle empty data", async () => {
      const plaintext = new Uint8Array([]);
      const cipher = gcm(key256, nonce);

      const encrypted = await cipher.encrypt(plaintext);
      const decrypted = await cipher.decrypt(encrypted);

      expect(decrypted).toEqual(plaintext);
    });

    it("should handle single byte", async () => {
      const plaintext = new Uint8Array([42]);
      const cipher = gcm(key256, nonce);

      const encrypted = await cipher.encrypt(plaintext);
      const decrypted = await cipher.decrypt(encrypted);

      expect(decrypted).toEqual(plaintext);
    });

    it("should handle large data", async () => {
      const plaintext = new Uint8Array(1024);
      for (let i = 0; i < plaintext.length; i++) {
        plaintext[i] = i % 256;
      }
      const cipher = gcm(key256, nonce);

      const encrypted = await cipher.encrypt(plaintext);
      const decrypted = await cipher.decrypt(encrypted);

      expect(decrypted).toEqual(plaintext);
    });

    it("should handle text data", async () => {
      const plaintext = new TextEncoder().encode("Hello, World!");
      const cipher = gcm(key256, nonce);

      const encrypted = await cipher.encrypt(plaintext);
      const decrypted = await cipher.decrypt(encrypted);

      expect(decrypted).toEqual(plaintext);
      expect(new TextDecoder().decode(decrypted)).toBe("Hello, World!");
    });
  });

  describe("encryption properties", () => {
    it("should produce different ciphertext than plaintext", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher = gcm(key256, nonce);

      const encrypted = await cipher.encrypt(plaintext);

      expect(encrypted).not.toEqual(plaintext);
    });

    it("should produce ciphertext longer than plaintext (includes auth tag)", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher = gcm(key256, nonce);

      const encrypted = await cipher.encrypt(plaintext);

      // Auth tag is 16 bytes (128 bits) by default
      expect(encrypted.length).toBe(plaintext.length + 16);
    });

    it("should produce same ciphertext for same input (deterministic with same nonce)", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher = gcm(key256, nonce);

      const encrypted1 = await cipher.encrypt(plaintext);
      const encrypted2 = await cipher.encrypt(plaintext);

      expect(encrypted1).toEqual(encrypted2);
    });

    it("should produce different ciphertext with different nonces", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const nonce1 = new Uint8Array(12).fill(1);
      const nonce2 = new Uint8Array(12).fill(2);

      const cipher1 = gcm(key256, nonce1);
      const cipher2 = gcm(key256, nonce2);

      const encrypted1 = await cipher1.encrypt(plaintext);
      const encrypted2 = await cipher2.encrypt(plaintext);

      expect(encrypted1).not.toEqual(encrypted2);
    });

    it("should produce different ciphertext with different keys", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const key1 = new Uint8Array(32).fill(1);
      const key2 = new Uint8Array(32).fill(2);

      const cipher1 = gcm(key1, nonce);
      const cipher2 = gcm(key2, nonce);

      const encrypted1 = await cipher1.encrypt(plaintext);
      const encrypted2 = await cipher2.encrypt(plaintext);

      expect(encrypted1).not.toEqual(encrypted2);
    });
  });

  describe("key sizes", () => {
    it("should work with 128-bit keys", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher = gcm(key128, nonce);

      const encrypted = await cipher.encrypt(plaintext);
      const decrypted = await cipher.decrypt(encrypted);

      expect(decrypted).toEqual(plaintext);
    });

    it("should work with 256-bit keys", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher = gcm(key256, nonce);

      const encrypted = await cipher.encrypt(plaintext);
      const decrypted = await cipher.decrypt(encrypted);

      expect(decrypted).toEqual(plaintext);
    });
  });

  describe("authentication", () => {
    it("should fail to decrypt tampered ciphertext", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher = gcm(key256, nonce);

      const encrypted = await cipher.encrypt(plaintext);

      // Tamper with the ciphertext
      encrypted[0] ^= 0xff;

      await expect(cipher.decrypt(encrypted)).rejects.toThrow();
    });

    it("should fail to decrypt with wrong key", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher1 = gcm(key256, nonce);
      const wrongKey = new Uint8Array(32).fill(255);
      const cipher2 = gcm(wrongKey, nonce);

      const encrypted = await cipher1.encrypt(plaintext);

      await expect(cipher2.decrypt(encrypted)).rejects.toThrow();
    });

    it("should fail to decrypt with wrong nonce", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const nonce1 = new Uint8Array(12).fill(1);
      const nonce2 = new Uint8Array(12).fill(2);
      const cipher1 = gcm(key256, nonce1);
      const cipher2 = gcm(key256, nonce2);

      const encrypted = await cipher1.encrypt(plaintext);

      await expect(cipher2.decrypt(encrypted)).rejects.toThrow();
    });
  });

  describe("tag length", () => {
    it("should work with custom tag length 96 bits", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher = gcm(key256, nonce, 96);

      const encrypted = await cipher.encrypt(plaintext);
      const decrypted = await cipher.decrypt(encrypted);

      expect(decrypted).toEqual(plaintext);
      // Auth tag is 12 bytes (96 bits)
      expect(encrypted.length).toBe(plaintext.length + 12);
    });

    it("should work with custom tag length 128 bits (default)", async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const cipher = gcm(key256, nonce, 128);

      const encrypted = await cipher.encrypt(plaintext);
      const decrypted = await cipher.decrypt(encrypted);

      expect(decrypted).toEqual(plaintext);
      // Auth tag is 16 bytes (128 bits)
      expect(encrypted.length).toBe(plaintext.length + 16);
    });
  });
});
