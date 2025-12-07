import { describe, expect, it } from "vitest";

import { hmac } from "./hmac";

describe("hmac", () => {
  const key = new Uint8Array(32);
  for (let i = 0; i < key.length; i++) {
    key[i] = i;
  }

  describe("sign and verify", () => {
    it("should sign data and verify signature", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signer = hmac(key);

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
    });

    it("should handle empty data", async () => {
      const data = new Uint8Array([]);
      const signer = hmac(key);

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
    });

    it("should handle single byte", async () => {
      const data = new Uint8Array([42]);
      const signer = hmac(key);

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
    });

    it("should handle large data", async () => {
      const data = new Uint8Array(1024);
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 256;
      }
      const signer = hmac(key);

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
    });

    it("should handle text data", async () => {
      const data = new TextEncoder().encode("Hello, World!");
      const signer = hmac(key);

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
    });
  });

  describe("signature properties", () => {
    it("should produce consistent signatures for same input", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signer = hmac(key);

      const signature1 = await signer.sign(data);
      const signature2 = await signer.sign(data);

      expect(signature1).toEqual(signature2);
    });

    it("should produce different signatures for different data", async () => {
      const data1 = new Uint8Array([1, 2, 3, 4, 5]);
      const data2 = new Uint8Array([5, 4, 3, 2, 1]);
      const signer = hmac(key);

      const signature1 = await signer.sign(data1);
      const signature2 = await signer.sign(data2);

      expect(signature1).not.toEqual(signature2);
    });

    it("should produce different signatures with different keys", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const key1 = new Uint8Array(32).fill(1);
      const key2 = new Uint8Array(32).fill(2);

      const signer1 = hmac(key1);
      const signer2 = hmac(key2);

      const signature1 = await signer1.sign(data);
      const signature2 = await signer2.sign(data);

      expect(signature1).not.toEqual(signature2);
    });

    it("should reject verification with wrong signature", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signer = hmac(key);

      const signature = await signer.sign(data);
      const wrongSignature = new Uint8Array(signature);
      wrongSignature[0] ^= 0xff; // Flip bits

      const isValid = await signer.verify(data, wrongSignature);

      expect(isValid).toBe(false);
    });

    it("should reject verification with wrong data", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const wrongData = new Uint8Array([5, 4, 3, 2, 1]);
      const signer = hmac(key);

      const signature = await signer.sign(data);
      const isValid = await signer.verify(wrongData, signature);

      expect(isValid).toBe(false);
    });

    it("should reject verification with wrong key", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const key1 = new Uint8Array(32).fill(1);
      const key2 = new Uint8Array(32).fill(2);

      const signer1 = hmac(key1);
      const signer2 = hmac(key2);

      const signature = await signer1.sign(data);
      const isValid = await signer2.verify(data, signature);

      expect(isValid).toBe(false);
    });

    it("should reject verification with tampered data", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signer = hmac(key);

      const signature = await signer.sign(data);

      // Tamper with data
      data[0] = 255;

      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(false);
    });
  });

  describe("hash algorithms", () => {
    it("should work with SHA-256 (default)", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signer = hmac(key, "SHA-256");

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
      expect(signature.length).toBe(32); // SHA-256 produces 32-byte hash
    });

    it("should work with SHA-384", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signer = hmac(key, "SHA-384");

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
      expect(signature.length).toBe(48); // SHA-384 produces 48-byte hash
    });

    it("should work with SHA-512", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signer = hmac(key, "SHA-512");

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
      expect(signature.length).toBe(64); // SHA-512 produces 64-byte hash
    });

    it("should produce different signatures for different hash algorithms", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);

      const signer256 = hmac(key, "SHA-256");
      const signer512 = hmac(key, "SHA-512");

      const signature256 = await signer256.sign(data);
      const signature512 = await signer512.sign(data);

      expect(signature256).not.toEqual(signature512);
      expect(signature256.length).toBe(32);
      expect(signature512.length).toBe(64);
    });

    it("should fail verification when using different hash algorithms", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);

      const signer256 = hmac(key, "SHA-256");
      const signer512 = hmac(key, "SHA-512");

      const signature256 = await signer256.sign(data);

      // Cannot verify SHA-256 signature with SHA-512 verifier
      // Returns false because signature length doesn't match
      const isValid = await signer512.verify(data, signature256);
      expect(isValid).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle very long messages", async () => {
      const data = new Uint8Array(10000);
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 256;
      }
      const signer = hmac(key);

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
    });

    it("should handle short keys", async () => {
      const shortKey = new Uint8Array(8); // 64-bit key
      for (let i = 0; i < shortKey.length; i++) {
        shortKey[i] = i;
      }
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signer = hmac(shortKey);

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
    });

    it("should handle long keys", async () => {
      const longKey = new Uint8Array(128); // 1024-bit key
      for (let i = 0; i < longKey.length; i++) {
        longKey[i] = i % 256;
      }
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signer = hmac(longKey);

      const signature = await signer.sign(data);
      const isValid = await signer.verify(data, signature);

      expect(isValid).toBe(true);
    });
  });
});
