import { describe, it } from "vitest";

import { ValidatorCode } from "../main";
import { expectInvalid, expectValid } from "../test/utils/assertions";
import {
  passwordConfirmValidator,
  passwordHashValidator,
  passwordValidator,
} from "./password";

describe("passwordValidator", () => {
  describe("valid passwords", () => {
    it("should accept valid password with all requirements", () => {
      expectValid(passwordValidator, "ValidPass1!");
    });

    it("should accept password with exactly 10 characters", () => {
      expectValid(passwordValidator, "Valid1Pas!");
    });

    it("should accept password with 64 characters", () => {
      const password = "aA1!" + "x".repeat(60);
      expectValid(passwordValidator, password);
    });

    it("should accept password with spaces (spaces are allowed)", () => {
      expectValid(passwordValidator, "Valid Pass1!");
    });

    it("should accept password with multiple special characters", () => {
      expectValid(passwordValidator, "ValidPass1!@#$%");
    });

    it("should accept various special characters", () => {
      const specialChars = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"];
      specialChars.forEach((char) => {
        const password = `ValidPass1${char}`;
        expectValid(passwordValidator, password);
      });
    });
  });

  describe("length validation", () => {
    it("should reject password that is too short (< 10 chars)", () => {
      expectInvalid(passwordValidator, "Short1!aA", ValidatorCode.TooShort);
    });

    it("should reject password that is too long (> 64 chars)", () => {
      const password = "aA1!" + "x".repeat(61);
      expectInvalid(passwordValidator, password, ValidatorCode.TooLong);
    });
  });

  describe("format validation", () => {
    it("should reject password missing lowercase letter", () => {
      expectInvalid(passwordValidator, "UPPERCASE123!", ValidatorCode.InvalidFormat);
    });

    it("should reject password missing uppercase letter", () => {
      expectInvalid(passwordValidator, "lowercase123!", ValidatorCode.InvalidFormat);
    });

    it("should reject password missing digit", () => {
      expectInvalid(passwordValidator, "ValidPassword!", ValidatorCode.InvalidFormat);
    });

    it("should reject password missing special character", () => {
      expectInvalid(passwordValidator, "ValidPassword123", ValidatorCode.InvalidFormat);
    });
  });

  describe("type validation", () => {
    it("should reject undefined", () => {
      expectInvalid(passwordValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should reject null", () => {
      expectInvalid(passwordValidator, null, ValidatorCode.InvalidType);
    });

    it("should reject non-string value", () => {
      expectInvalid(passwordValidator, 12345, ValidatorCode.InvalidType);
    });
  });
});

describe("passwordConfirmValidator", () => {
  describe("valid values", () => {
    it("should accept non-empty string", () => {
      expectValid(passwordConfirmValidator, "any password");
    });

    it("should accept single character", () => {
      expectValid(passwordConfirmValidator, "a");
    });

    it("should accept very long string", () => {
      const password = "a".repeat(1000);
      expectValid(passwordConfirmValidator, password);
    });
  });

  describe("required validation", () => {
    it("should reject empty string", () => {
      expectInvalid(passwordConfirmValidator, "", ValidatorCode.Required);
    });
  });

  describe("type validation", () => {
    it("should reject undefined", () => {
      expectInvalid(passwordConfirmValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should reject null", () => {
      expectInvalid(passwordConfirmValidator, null, ValidatorCode.InvalidType);
    });

    it("should reject non-string value", () => {
      expectInvalid(passwordConfirmValidator, 12345, ValidatorCode.InvalidType);
    });
  });
});

describe("passwordHashValidator", () => {
  describe("valid base64url strings", () => {
    it("should accept valid base64url string", () => {
      expectValid(passwordHashValidator, "SGVsbG8gV29ybGQ");
    });

    it("should accept base64url with hyphens", () => {
      expectValid(passwordHashValidator, "SGVs-G8gV29ybGQ");
    });

    it("should accept base64url with underscores", () => {
      expectValid(passwordHashValidator, "SGVs_G8gV29ybGQ");
    });

    it("should accept base64url without padding", () => {
      expectValid(passwordHashValidator, "SGVsbG8");
    });

    it("should accept long base64url string", () => {
      const hash = "a".repeat(100);
      expectValid(passwordHashValidator, hash);
    });

    it("should accept empty string (valid base64url)", () => {
      expectValid(passwordHashValidator, "");
    });
  });

  describe("format validation", () => {
    it("should reject base64 with plus sign (not base64url)", () => {
      expectInvalid(passwordHashValidator, "SGVs+G8gV29ybGQ", ValidatorCode.InvalidFormat);
    });

    it("should reject base64 with slash (not base64url)", () => {
      expectInvalid(passwordHashValidator, "SGVs/G8gV29ybGQ", ValidatorCode.InvalidFormat);
    });

    it("should reject base64url with padding", () => {
      expectInvalid(passwordHashValidator, "SGVsbG8=", ValidatorCode.InvalidFormat);
    });

    it("should reject string with invalid characters", () => {
      expectInvalid(passwordHashValidator, "SGVs bG8", ValidatorCode.InvalidFormat);
    });
  });

  describe("type validation", () => {
    it("should reject undefined", () => {
      expectInvalid(passwordHashValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should reject null", () => {
      expectInvalid(passwordHashValidator, null, ValidatorCode.InvalidType);
    });

    it("should reject non-string value", () => {
      expectInvalid(passwordHashValidator, 12345, ValidatorCode.InvalidType);
    });
  });
});
