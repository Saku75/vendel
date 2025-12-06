import { describe, expect, it } from "vitest";

import { ValidatorCode } from "../main";
import { expectInvalid, expectValid } from "../test/utils/assertions";
import { emailValidator } from "./email";

describe("emailValidator", () => {
  describe("valid email addresses", () => {
    it("should pass for simple valid email", () => {
      expectValid(emailValidator, "test@example.com");
    });

    it("should pass for email with subdomain", () => {
      expectValid(emailValidator, "user@mail.example.com");
    });

    it("should pass for email with plus addressing", () => {
      expectValid(emailValidator, "user+tag@example.com");
    });

    it("should pass for email with dots in local part", () => {
      expectValid(emailValidator, "first.last@example.com");
    });

    it("should pass for email with numbers", () => {
      expectValid(emailValidator, "user123@example456.com");
    });

    it("should trim leading and trailing whitespace", () => {
      expectValid(emailValidator, "  test@example.com  ", "test@example.com");
    });

    it("should trim tabs", () => {
      expectValid(emailValidator, "\ttest@example.com\t", "test@example.com");
    });

    it("should trim newlines", () => {
      expectValid(emailValidator, "\ntest@example.com\n", "test@example.com");
    });
  });

  describe("required validation", () => {
    it("should fail for empty string", () => {
      expectInvalid(emailValidator, "", ValidatorCode.InvalidFormat);
    });

    it("should fail for whitespace-only string", () => {
      expectInvalid(emailValidator, "   ", ValidatorCode.InvalidFormat);
    });

    it("should fail for undefined", () => {
      expectInvalid(emailValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should fail for null", () => {
      expectInvalid(emailValidator, null, ValidatorCode.InvalidType);
    });
  });

  describe("type validation", () => {
    it("should fail for number", () => {
      expectInvalid(emailValidator, 123, ValidatorCode.InvalidType);
    });

    it("should fail for boolean", () => {
      expectInvalid(emailValidator, true, ValidatorCode.InvalidType);
    });

    it("should fail for object", () => {
      expectInvalid(
        emailValidator,
        { email: "test@example.com" },
        ValidatorCode.InvalidType,
      );
    });

    it("should fail for array", () => {
      expectInvalid(
        emailValidator,
        ["test@example.com"],
        ValidatorCode.InvalidType,
      );
    });
  });

  describe("format validation", () => {
    it("should fail for string without @ symbol", () => {
      expectInvalid(emailValidator, "notanemail", ValidatorCode.InvalidFormat);
    });

    it("should fail for string with @ but no domain", () => {
      expectInvalid(emailValidator, "user@", ValidatorCode.InvalidFormat);
    });

    it("should fail for string with @ but no local part", () => {
      expectInvalid(emailValidator, "@example.com", ValidatorCode.InvalidFormat);
    });

    it("should fail for multiple @ symbols", () => {
      expectInvalid(
        emailValidator,
        "user@@example.com",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should fail for domain without TLD", () => {
      expectInvalid(emailValidator, "user@domain", ValidatorCode.InvalidFormat);
    });

    it("should fail for spaces in email", () => {
      expectInvalid(
        emailValidator,
        "user name@example.com",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should fail for email ending with dot", () => {
      expectInvalid(
        emailValidator,
        "user@example.com.",
        ValidatorCode.InvalidFormat,
      );
    });
  });

  describe("length validation", () => {
    it("should pass for email at exactly 320 characters", () => {
      const localPart = "a".repeat(64);
      const domainPart = "b".repeat(243) + ".example.com";
      const email = `${localPart}@${domainPart}`;
      expect(email.length).toBe(320);
      expectValid(emailValidator, email);
    });

    it("should fail for email over 320 characters", () => {
      const localPart = "a".repeat(64);
      const domainPart = "b".repeat(244) + ".example.com";
      const email = `${localPart}@${domainPart}`;
      expect(email.length).toBe(321);
      expectInvalid(emailValidator, email, ValidatorCode.TooLong);
    });

    it("should fail for very long email", () => {
      const longEmail = "a".repeat(400) + "@example.com";
      expectInvalid(emailValidator, longEmail, ValidatorCode.TooLong);
    });
  });

  describe("edge cases", () => {
    it("should pass for single character local part", () => {
      expectValid(emailValidator, "a@example.com");
    });

    it("should pass for hyphenated domain", () => {
      expectValid(emailValidator, "user@my-domain.com");
    });

    it("should pass for email with multiple subdomains", () => {
      expectValid(emailValidator, "user@mail.server.example.com");
    });
  });
});
