import { describe, it } from "vitest";

import { ValidatorCode } from "../main";
import { expectInvalid, expectValid } from "../test/utils/assertions";
import { idValidator } from "./id";

describe("idValidator", () => {
  describe("valid CUID2 IDs", () => {
    it("should accept valid CUID2 format", () => {
      expectValid(idValidator, "ckopqwooh000001l8e77f8xyz");
      expectValid(idValidator, "clh0x8w3q0000356h7g2p4t9z");
      expectValid(idValidator, "cm4abc123def456ghi789jklm");
    });

    it("should accept 24-character CUID2", () => {
      expectValid(idValidator, "ckopqwooh000001l8e77f8xy");
    });

    it("should accept CUID2 starting with letter", () => {
      expectValid(idValidator, "abc123def456ghi789jklmno");
    });

    it("should accept numeric-only string (CUID2 allows lowercase alphanumeric)", () => {
      expectValid(idValidator, "123456789012345678901234");
    });

    it("should accept short lowercase alphanumeric string", () => {
      expectValid(idValidator, "short");
    });

    it("should accept long lowercase alphanumeric string", () => {
      expectValid(idValidator, "ckopqwooh000001l8e77f8xyzextralongsuffix");
    });

    it("should accept string starting with number (CUID2 pattern allows it)", () => {
      expectValid(idValidator, "1ckopqwooh000001l8e77f8xyz");
    });
  });

  describe("empty and undefined values", () => {
    it("should fail for empty string with InvalidFormat", () => {
      expectInvalid(idValidator, "", ValidatorCode.InvalidFormat);
    });

    it("should fail for undefined with InvalidType", () => {
      expectInvalid(idValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should fail for null with InvalidType", () => {
      expectInvalid(idValidator, null, ValidatorCode.InvalidType);
    });
  });

  describe("invalid formats", () => {
    it("should fail for random string with InvalidFormat", () => {
      expectInvalid(
        idValidator,
        "not-a-valid-cuid",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should fail for UUID with InvalidFormat", () => {
      expectInvalid(
        idValidator,
        "550e8400-e29b-41d4-a716-446655440000",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should fail for string with uppercase letters with InvalidFormat", () => {
      expectInvalid(
        idValidator,
        "CKOPQWOOH000001L8E77F8XYZ",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should fail for string with special characters with InvalidFormat", () => {
      expectInvalid(
        idValidator,
        "ckopqwooh000001l8e77f8x-z",
        ValidatorCode.InvalidFormat,
      );
    });
  });

  describe("whitespace handling", () => {
    it("should trim leading whitespace and validate", () => {
      expectValid(
        idValidator,
        "  ckopqwooh000001l8e77f8xyz",
        "ckopqwooh000001l8e77f8xyz",
      );
    });

    it("should trim trailing whitespace and validate", () => {
      expectValid(
        idValidator,
        "ckopqwooh000001l8e77f8xyz  ",
        "ckopqwooh000001l8e77f8xyz",
      );
    });

    it("should trim both leading and trailing whitespace", () => {
      expectValid(
        idValidator,
        "  ckopqwooh000001l8e77f8xyz  ",
        "ckopqwooh000001l8e77f8xyz",
      );
    });

    it("should trim tabs and newlines", () => {
      expectValid(
        idValidator,
        "\t\nckopqwooh000001l8e77f8xyz\n\t",
        "ckopqwooh000001l8e77f8xyz",
      );
    });

    it("should fail if only whitespace remains after trim", () => {
      expectInvalid(idValidator, "   ", ValidatorCode.InvalidFormat);
    });
  });

  describe("invalid types", () => {
    it("should fail for number with InvalidType", () => {
      expectInvalid(idValidator, 123456, ValidatorCode.InvalidType);
    });

    it("should fail for boolean with InvalidType", () => {
      expectInvalid(idValidator, true, ValidatorCode.InvalidType);
    });

    it("should fail for object with InvalidType", () => {
      expectInvalid(
        idValidator,
        { id: "ckopqwooh000001l8e77f8xyz" },
        ValidatorCode.InvalidType,
      );
    });

    it("should fail for array with InvalidType", () => {
      expectInvalid(
        idValidator,
        ["ckopqwooh000001l8e77f8xyz"],
        ValidatorCode.InvalidType,
      );
    });
  });
});
