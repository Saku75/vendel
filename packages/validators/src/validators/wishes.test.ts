import { describe, it } from "vitest";

import { ValidatorCode } from "../main";
import { expectInvalid, expectValid } from "../test/utils/assertions";
import {
  wishBrandValidator,
  wishDescriptionValidator,
  wishPriceValidator,
  wishTitleValidator,
  wishUrlValidator,
} from "./wishes";

describe("wishTitleValidator", () => {
  describe("valid titles", () => {
    it("should accept valid title", () => {
      expectValid(wishTitleValidator, "Valid wish title");
    });

    it("should accept title with exactly 256 characters", () => {
      const title = "a".repeat(256);
      expectValid(wishTitleValidator, title);
    });
  });

  describe("whitespace handling", () => {
    it("should trim whitespace from valid title", () => {
      expectValid(
        wishTitleValidator,
        "  Valid wish title  ",
        "Valid wish title",
      );
    });
  });

  describe("required validation", () => {
    it("should reject empty string with Required error", () => {
      expectInvalid(wishTitleValidator, "", ValidatorCode.Required);
    });

    it("should reject whitespace-only string with Required error", () => {
      expectInvalid(wishTitleValidator, "   ", ValidatorCode.Required);
    });
  });

  describe("type validation", () => {
    it("should reject undefined with InvalidType error", () => {
      expectInvalid(wishTitleValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should reject non-string values with InvalidType error", () => {
      expectInvalid(wishTitleValidator, 123, ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should reject title over 256 characters with TooLong error", () => {
      const longTitle = "a".repeat(257);
      expectInvalid(wishTitleValidator, longTitle, ValidatorCode.TooLong);
    });
  });
});

describe("wishBrandValidator", () => {
  describe("valid brands", () => {
    it("should accept valid brand", () => {
      expectValid(wishBrandValidator, "Brand Name");
    });

    it("should accept brand with exactly 128 characters", () => {
      const brand = "a".repeat(128);
      expectValid(wishBrandValidator, brand);
    });
  });

  describe("whitespace handling", () => {
    it("should trim whitespace from valid brand", () => {
      expectValid(wishBrandValidator, "  Brand Name  ", "Brand Name");
    });
  });

  describe("optional handling", () => {
    it("should accept undefined (optional)", () => {
      expectValid(wishBrandValidator, undefined);
    });

    it("should accept empty string (becomes empty after trim)", () => {
      expectValid(wishBrandValidator, "");
    });

    it("should accept whitespace-only string (becomes empty after trim)", () => {
      expectValid(wishBrandValidator, "   ", "");
    });
  });

  describe("type validation", () => {
    it("should reject non-string values with InvalidType error", () => {
      expectInvalid(wishBrandValidator, 123, ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should reject brand over 128 characters with TooLong error", () => {
      const longBrand = "a".repeat(129);
      expectInvalid(wishBrandValidator, longBrand, ValidatorCode.TooLong);
    });
  });
});

describe("wishDescriptionValidator", () => {
  describe("valid descriptions", () => {
    it("should accept valid description", () => {
      expectValid(wishDescriptionValidator, "This is a wish description");
    });

    it("should accept description with exactly 512 characters", () => {
      const description = "a".repeat(512);
      expectValid(wishDescriptionValidator, description);
    });
  });

  describe("whitespace handling", () => {
    it("should trim whitespace from valid description", () => {
      expectValid(
        wishDescriptionValidator,
        "  This is a wish description  ",
        "This is a wish description",
      );
    });
  });

  describe("optional handling", () => {
    it("should accept undefined (optional)", () => {
      expectValid(wishDescriptionValidator, undefined);
    });

    it("should accept empty string (becomes empty after trim)", () => {
      expectValid(wishDescriptionValidator, "");
    });

    it("should accept whitespace-only string (becomes empty after trim)", () => {
      expectValid(wishDescriptionValidator, "   ", "");
    });
  });

  describe("type validation", () => {
    it("should reject non-string values with InvalidType error", () => {
      expectInvalid(wishDescriptionValidator, 123, ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should reject description over 512 characters with TooLong error", () => {
      const longDescription = "a".repeat(513);
      expectInvalid(
        wishDescriptionValidator,
        longDescription,
        ValidatorCode.TooLong,
      );
    });
  });
});

describe("wishPriceValidator", () => {
  describe("valid prices", () => {
    it("should accept valid number", () => {
      expectValid(wishPriceValidator, 100);
    });

    it("should accept zero", () => {
      expectValid(wishPriceValidator, 0);
    });

    it("should accept negative numbers", () => {
      expectValid(wishPriceValidator, -50);
    });

    it("should accept decimal numbers", () => {
      expectValid(wishPriceValidator, 99.99);
    });
  });

  describe("optional handling", () => {
    it("should accept null (nullable)", () => {
      expectValid(wishPriceValidator, null);
    });

    it("should accept undefined (optional)", () => {
      expectValid(wishPriceValidator, undefined);
    });
  });

  describe("type validation", () => {
    it("should reject string values with InvalidType error", () => {
      expectInvalid(wishPriceValidator, "100", ValidatorCode.InvalidType);
    });

    it("should reject boolean values with InvalidType error", () => {
      expectInvalid(wishPriceValidator, true, ValidatorCode.InvalidType);
    });

    it("should reject object values with InvalidType error", () => {
      expectInvalid(wishPriceValidator, {}, ValidatorCode.InvalidType);
    });
  });
});

describe("wishUrlValidator", () => {
  describe("valid URLs", () => {
    it("should accept valid URL", () => {
      expectValid(wishUrlValidator, "https://example.com/product");
    });

    it("should accept non-URL string", () => {
      expectValid(wishUrlValidator, "not a url");
    });

    it("should accept URL with exactly 2048 characters", () => {
      const url = "a".repeat(2048);
      expectValid(wishUrlValidator, url);
    });
  });

  describe("whitespace handling", () => {
    it("should trim whitespace from URL", () => {
      expectValid(
        wishUrlValidator,
        "  https://example.com  ",
        "https://example.com",
      );
    });
  });

  describe("optional handling", () => {
    it("should accept undefined (optional)", () => {
      expectValid(wishUrlValidator, undefined);
    });

    it("should accept empty string (becomes empty after trim)", () => {
      expectValid(wishUrlValidator, "");
    });

    it("should accept whitespace-only string (becomes empty after trim)", () => {
      expectValid(wishUrlValidator, "   ", "");
    });
  });

  describe("type validation", () => {
    it("should reject non-string values with InvalidType error", () => {
      expectInvalid(wishUrlValidator, 123, ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should reject URL over 2048 characters with TooLong error", () => {
      const longUrl = "https://example.com/" + "a".repeat(2030);
      expectInvalid(wishUrlValidator, longUrl, ValidatorCode.TooLong);
    });
  });
});
