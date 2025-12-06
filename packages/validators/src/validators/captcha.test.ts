import { describe, it } from "vitest";

import { ValidatorCode } from "../main";
import { expectInvalid, expectValid } from "../test/utils/assertions";
import { captchaValidator } from "./captcha";

describe("captchaValidator", () => {
  describe("valid captcha tokens", () => {
    it("should validate a valid captcha token", () => {
      expectValid(captchaValidator, "valid-captcha-token-123");
    });

    it("should pass for single character", () => {
      expectValid(captchaValidator, "a");
    });

    it("should pass for token exactly 2048 characters", () => {
      const maxToken = "a".repeat(2048);
      expectValid(captchaValidator, maxToken);
    });

    it("should validate realistic Cloudflare Turnstile token", () => {
      const turnstileToken =
        "0.AAAAAAAAAAAAAAAAAAAAAA.BBBBBBBBBBBBBBBBBBBBBB.CCCCCCCCCCCCCCCCCCCCCC.DDDDDDDDDDDDDDDDDDDDDD";
      expectValid(captchaValidator, turnstileToken);
    });
  });

  describe("empty and undefined values", () => {
    it("should fail for empty string after trim", () => {
      expectInvalid(captchaValidator, "", ValidatorCode.Required);
    });

    it("should fail for whitespace-only string", () => {
      expectInvalid(captchaValidator, "   ", ValidatorCode.Required);
    });

    it("should fail for undefined", () => {
      expectInvalid(captchaValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should fail for null", () => {
      expectInvalid(captchaValidator, null, ValidatorCode.InvalidType);
    });
  });

  describe("invalid types", () => {
    it("should fail for number", () => {
      expectInvalid(captchaValidator, 123, ValidatorCode.InvalidType);
    });

    it("should fail for boolean", () => {
      expectInvalid(captchaValidator, true, ValidatorCode.InvalidType);
    });

    it("should fail for object", () => {
      expectInvalid(captchaValidator, { token: "test" }, ValidatorCode.InvalidType);
    });

    it("should fail for array", () => {
      expectInvalid(captchaValidator, ["test"], ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should fail for token over 2048 characters", () => {
      const longToken = "a".repeat(2049);
      expectInvalid(captchaValidator, longToken, ValidatorCode.TooLong);
    });

    it("should fail for token with whitespace that exceeds 2048 after trim", () => {
      const longToken = "  " + "a".repeat(2049) + "  ";
      expectInvalid(captchaValidator, longToken, ValidatorCode.TooLong);
    });
  });

  describe("whitespace handling", () => {
    it("should trim leading and trailing whitespace", () => {
      expectValid(captchaValidator, "  token  ", "token");
    });

    it("should trim leading whitespace only", () => {
      expectValid(captchaValidator, "  token", "token");
    });

    it("should trim trailing whitespace only", () => {
      expectValid(captchaValidator, "token  ", "token");
    });

    it("should trim tabs and newlines", () => {
      expectValid(captchaValidator, "\t\ntoken\n\t", "token");
    });

    it("should pass when whitespace is trimmed and length is within limit", () => {
      const token = "  " + "a".repeat(2047) + "  ";
      expectValid(captchaValidator, token, "a".repeat(2047));
    });
  });
});
