import { describe, it } from "vitest";

import { ValidatorCode } from "../main";
import { expectInvalid, expectValid } from "../test/utils/assertions";
import { wishlistDescriptionValidator, wishlistNameValidator } from "./wishlist";

describe("wishlistNameValidator", () => {
  describe("valid names", () => {
    it("should accept valid name", () => {
      expectValid(wishlistNameValidator, "My Wishlist");
    });

    it("should accept string exactly 128 characters", () => {
      const maxString = "a".repeat(128);
      expectValid(wishlistNameValidator, maxString);
    });

    it("should accept single character name", () => {
      expectValid(wishlistNameValidator, "A");
    });

    it("should preserve internal whitespace", () => {
      expectValid(wishlistNameValidator, "My   Wishlist   Name");
    });
  });

  describe("whitespace handling", () => {
    it("should trim whitespace from valid name", () => {
      expectValid(wishlistNameValidator, "  My Wishlist  ", "My Wishlist");
    });

    it("should trim leading whitespace", () => {
      expectValid(wishlistNameValidator, "   My Wishlist", "My Wishlist");
    });

    it("should trim trailing whitespace", () => {
      expectValid(wishlistNameValidator, "My Wishlist   ", "My Wishlist");
    });

    it("should trim both leading and trailing whitespace", () => {
      expectValid(wishlistNameValidator, "   My Wishlist   ", "My Wishlist");
    });
  });

  describe("required validation", () => {
    it("should reject empty string with Required error", () => {
      expectInvalid(wishlistNameValidator, "", ValidatorCode.Required);
    });

    it("should reject whitespace-only string with Required error", () => {
      expectInvalid(wishlistNameValidator, "   ", ValidatorCode.Required);
    });
  });

  describe("type validation", () => {
    it("should reject undefined with InvalidType error", () => {
      expectInvalid(wishlistNameValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should reject null with InvalidType error", () => {
      expectInvalid(wishlistNameValidator, null, ValidatorCode.InvalidType);
    });

    it("should reject non-string types with InvalidType error", () => {
      expectInvalid(wishlistNameValidator, 123, ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should reject string over 128 characters with TooLong error", () => {
      const longString = "a".repeat(129);
      expectInvalid(wishlistNameValidator, longString, ValidatorCode.TooLong);
    });
  });
});

describe("wishlistDescriptionValidator", () => {
  describe("valid descriptions", () => {
    it("should accept valid description", () => {
      expectValid(
        wishlistDescriptionValidator,
        "This is a description of my wishlist",
      );
    });

    it("should accept string exactly 256 characters", () => {
      const maxString = "a".repeat(256);
      expectValid(wishlistDescriptionValidator, maxString);
    });

    it("should accept single character description", () => {
      expectValid(wishlistDescriptionValidator, "A");
    });

    it("should preserve internal whitespace", () => {
      expectValid(
        wishlistDescriptionValidator,
        "My   description   with   spaces",
      );
    });

    it("should accept multiline description", () => {
      expectValid(wishlistDescriptionValidator, "Line 1\nLine 2\nLine 3");
    });
  });

  describe("optional handling", () => {
    it("should accept undefined (optional)", () => {
      expectValid(wishlistDescriptionValidator, undefined);
    });

    it("should accept empty string as empty string after trim", () => {
      expectValid(wishlistDescriptionValidator, "");
    });

    it("should convert whitespace-only string to empty string", () => {
      expectValid(wishlistDescriptionValidator, "   ", "");
    });
  });

  describe("whitespace handling", () => {
    it("should trim whitespace from valid description", () => {
      expectValid(
        wishlistDescriptionValidator,
        "  My description  ",
        "My description",
      );
    });

    it("should trim leading whitespace", () => {
      expectValid(
        wishlistDescriptionValidator,
        "   My description",
        "My description",
      );
    });

    it("should trim trailing whitespace", () => {
      expectValid(
        wishlistDescriptionValidator,
        "My description   ",
        "My description",
      );
    });

    it("should trim both leading and trailing whitespace", () => {
      expectValid(
        wishlistDescriptionValidator,
        "   My description   ",
        "My description",
      );
    });
  });

  describe("type validation", () => {
    it("should reject null with InvalidType error", () => {
      expectInvalid(
        wishlistDescriptionValidator,
        null,
        ValidatorCode.InvalidType,
      );
    });

    it("should reject non-string types with InvalidType error", () => {
      expectInvalid(wishlistDescriptionValidator, 123, ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should reject string over 256 characters with TooLong error", () => {
      const longString = "a".repeat(257);
      expectInvalid(wishlistDescriptionValidator, longString, ValidatorCode.TooLong);
    });
  });
});
