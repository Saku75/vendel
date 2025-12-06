import { describe, it } from "vitest";

import { ValidatorCode } from "../main";
import { expectInvalid, expectValid } from "../test/utils/assertions";
import { tokenValidator } from "./token";

describe("tokenValidator", () => {
  describe("valid tokens", () => {
    it("should accept valid token format with version 1", () => {
      expectValid(tokenValidator, "v1.abc123.def456.ghi789");
    });

    it("should accept valid token with different version numbers", () => {
      expectValid(tokenValidator, "v2.abc.def.ghi");
    });

    it("should accept token with alphanumeric and special characters", () => {
      expectValid(tokenValidator, "v1.A-Za-z0-9_.B-C-D-E.F_G_H_I");
    });

    it("should accept token with underscores and hyphens", () => {
      expectValid(tokenValidator, "v1.test_token.data-part.signature_part");
    });

    it("should accept token with long base64-like strings", () => {
      expectValid(
        tokenValidator,
        "v1.SGVsbG8gV29ybGQ.QWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo.MTIzNDU2Nzg5MA",
      );
    });

    it("should accept token with single character parts", () => {
      expectValid(tokenValidator, "v1.a.b.c");
    });
  });

  describe("whitespace handling", () => {
    it("should trim leading and trailing whitespace", () => {
      expectValid(tokenValidator, "  v1.abc.def.ghi  ", "v1.abc.def.ghi");
    });

    it("should trim whitespace with tabs and newlines", () => {
      expectValid(tokenValidator, "\t\nv1.abc.def.ghi\n\t", "v1.abc.def.ghi");
    });
  });

  describe("invalid tokens - undefined/null", () => {
    it("should reject undefined with InvalidType error", () => {
      expectInvalid(tokenValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should reject null with InvalidType error", () => {
      expectInvalid(tokenValidator, null, ValidatorCode.InvalidType);
    });
  });

  describe("invalid tokens - wrong type", () => {
    it("should reject number with InvalidType error", () => {
      expectInvalid(tokenValidator, 123, ValidatorCode.InvalidType);
    });

    it("should reject object with InvalidType error", () => {
      expectInvalid(
        tokenValidator,
        { token: "v1.a.b.c" },
        ValidatorCode.InvalidType,
      );
    });

    it("should reject array with InvalidType error", () => {
      expectInvalid(tokenValidator, ["v1.a.b.c"], ValidatorCode.InvalidType);
    });
  });

  describe("invalid tokens - empty/whitespace", () => {
    it("should reject empty string with InvalidFormat error", () => {
      expectInvalid(tokenValidator, "", ValidatorCode.InvalidFormat);
    });

    it("should reject whitespace-only string with InvalidFormat error", () => {
      expectInvalid(tokenValidator, "   ", ValidatorCode.InvalidFormat);
    });
  });

  describe("invalid tokens - wrong number of parts", () => {
    it("should reject token with only 1 part", () => {
      expectInvalid(tokenValidator, "v1", ValidatorCode.InvalidFormat);
    });

    it("should reject token with only 2 parts", () => {
      expectInvalid(tokenValidator, "v1.abc", ValidatorCode.InvalidFormat);
    });

    it("should reject token with only 3 parts (missing signature)", () => {
      expectInvalid(tokenValidator, "v1.abc.def", ValidatorCode.InvalidFormat);
    });

    it("should reject token with 5 parts (too many)", () => {
      expectInvalid(tokenValidator, "v1.a.b.c.d", ValidatorCode.InvalidFormat);
    });

    it("should reject token with 6 parts (too many)", () => {
      expectInvalid(tokenValidator, "v1.a.b.c.d.e", ValidatorCode.InvalidFormat);
    });
  });

  describe("invalid tokens - invalid version format", () => {
    it("should reject version without number (just 'v')", () => {
      expectInvalid(tokenValidator, "v.abc.def.ghi", ValidatorCode.InvalidFormat);
    });

    it("should reject version with letter instead of number", () => {
      expectInvalid(tokenValidator, "vX.abc.def.ghi", ValidatorCode.InvalidFormat);
    });

    it("should reject version without 'v' prefix", () => {
      expectInvalid(tokenValidator, "1.abc.def.ghi", ValidatorCode.InvalidFormat);
    });

    it("should reject uppercase 'V' prefix", () => {
      expectInvalid(tokenValidator, "V1.abc.def.ghi", ValidatorCode.InvalidFormat);
    });

    it("should reject version with multiple digits after 'v'", () => {
      expectInvalid(tokenValidator, "v12.abc.def.ghi", ValidatorCode.InvalidFormat);
    });
  });

  describe("invalid tokens - invalid characters", () => {
    it("should reject token with spaces in parts", () => {
      expectInvalid(
        tokenValidator,
        "v1.abc def.ghi.jkl",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should reject token with special characters in parts", () => {
      expectInvalid(
        tokenValidator,
        "v1.abc@def.ghi.jkl",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should reject token with slash in parts", () => {
      expectInvalid(
        tokenValidator,
        "v1.abc/def.ghi.jkl",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should reject token with plus sign in parts", () => {
      expectInvalid(
        tokenValidator,
        "v1.abc+def.ghi.jkl",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should reject token with equals sign in parts", () => {
      expectInvalid(
        tokenValidator,
        "v1.abc=def.ghi.jkl",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should reject token with comma in parts", () => {
      expectInvalid(
        tokenValidator,
        "v1.abc,def.ghi.jkl",
        ValidatorCode.InvalidFormat,
      );
    });
  });

  describe("invalid tokens - missing parts", () => {
    it("should reject token with empty first part after version", () => {
      expectInvalid(tokenValidator, "v1..def.ghi", ValidatorCode.InvalidFormat);
    });

    it("should reject token with empty middle part", () => {
      expectInvalid(tokenValidator, "v1.abc..ghi", ValidatorCode.InvalidFormat);
    });

    it("should reject token with empty last part", () => {
      expectInvalid(tokenValidator, "v1.abc.def.", ValidatorCode.InvalidFormat);
    });

    it("should reject token with all empty parts", () => {
      expectInvalid(tokenValidator, "v1...", ValidatorCode.InvalidFormat);
    });
  });

  describe("edge cases", () => {
    it("should reject token with trailing dot", () => {
      expectInvalid(
        tokenValidator,
        "v1.abc.def.ghi.",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should reject token with leading dot", () => {
      expectInvalid(
        tokenValidator,
        ".v1.abc.def.ghi",
        ValidatorCode.InvalidFormat,
      );
    });

    it("should reject token with no dots", () => {
      expectInvalid(tokenValidator, "v1abcdefghi", ValidatorCode.InvalidFormat);
    });

    it("should reject token with newline in middle", () => {
      expectInvalid(
        tokenValidator,
        "v1.abc\n.def.ghi",
        ValidatorCode.InvalidFormat,
      );
    });
  });
});
