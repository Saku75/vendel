import { describe, it } from "vitest";

import { ValidatorCode } from "../main";
import { expectInvalid, expectValid } from "../test/utils/assertions";
import {
  firstNameValidator,
  lastNameValidator,
  middleNameValidator,
} from "./name";

describe("firstNameValidator", () => {
  describe("valid names", () => {
    it("should accept simple names", () => {
      expectValid(firstNameValidator, "John");
      expectValid(firstNameValidator, "Mary");
    });

    it("should accept hyphenated names", () => {
      expectValid(firstNameValidator, "Anne-Marie");
    });

    it("should accept names with apostrophes", () => {
      expectValid(firstNameValidator, "O'Brien");
    });

    it("should accept names with accented characters", () => {
      expectValid(firstNameValidator, "José");
      expectValid(firstNameValidator, "Søren");
    });

    it("should accept names exactly 64 characters", () => {
      const exactlyMaxLength = "A".repeat(64);
      expectValid(firstNameValidator, exactlyMaxLength);
    });

    it("should preserve internal whitespace", () => {
      expectValid(firstNameValidator, "Mary Jane");
      expectValid(firstNameValidator, "Jean Pierre");
    });
  });

  describe("whitespace handling", () => {
    it("should trim leading and trailing whitespace", () => {
      expectValid(firstNameValidator, "  John  ", "John");
      expectValid(firstNameValidator, "\tMary\t", "Mary");
      expectValid(firstNameValidator, "\n Anne \n", "Anne");
      expectValid(firstNameValidator, "  Søren  ", "Søren");
    });
  });

  describe("empty and undefined values", () => {
    it("should fail on empty string with Required error", () => {
      expectInvalid(firstNameValidator, "", ValidatorCode.Required);
    });

    it("should fail on whitespace-only string with Required error", () => {
      expectInvalid(firstNameValidator, "   ", ValidatorCode.Required);
    });

    it("should fail on undefined with InvalidType error", () => {
      expectInvalid(firstNameValidator, undefined, ValidatorCode.InvalidType);
    });

    it("should fail on null with InvalidType error", () => {
      expectInvalid(firstNameValidator, null, ValidatorCode.InvalidType);
    });
  });

  describe("invalid types", () => {
    it("should fail on non-string with InvalidType error", () => {
      expectInvalid(firstNameValidator, 123, ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should fail on names over 64 characters with TooLong error", () => {
      const longName = "A".repeat(65);
      expectInvalid(firstNameValidator, longName, ValidatorCode.TooLong);
    });
  });
});

describe("middleNameValidator", () => {
  describe("valid middle names", () => {
    it("should accept simple middle names", () => {
      expectValid(middleNameValidator, "Marie");
    });

    it("should accept compound middle names", () => {
      expectValid(middleNameValidator, "van der");
      expectValid(middleNameValidator, "de la");
    });

    it("should accept names with apostrophes", () => {
      expectValid(middleNameValidator, "O'Connor");
    });

    it("should accept names exactly 256 characters", () => {
      const exactlyMaxLength = "A".repeat(256);
      expectValid(middleNameValidator, exactlyMaxLength);
    });

    it("should handle long compound middle names", () => {
      const compoundName = "Marie Louise Anne Charlotte Elisabeth";
      expectValid(middleNameValidator, compoundName);
    });
  });

  describe("optional handling", () => {
    it("should accept undefined", () => {
      expectValid(middleNameValidator, undefined);
    });

    it("should accept empty string", () => {
      expectValid(middleNameValidator, "");
    });

    it("should accept whitespace-only string (becomes empty after trim)", () => {
      expectValid(middleNameValidator, "   ", "");
    });
  });

  describe("whitespace handling", () => {
    it("should trim leading and trailing whitespace", () => {
      expectValid(middleNameValidator, "  Marie  ", "Marie");
      expectValid(middleNameValidator, "\tvan der\t", "van der");
      expectValid(middleNameValidator, "\n de la \n", "de la");
    });

    it("should preserve internal whitespace", () => {
      expectValid(middleNameValidator, "van der Berg");
      expectValid(middleNameValidator, "de la Cruz");
    });
  });

  describe("invalid types", () => {
    it("should fail on non-string with InvalidType error", () => {
      expectInvalid(middleNameValidator, 123, ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should fail on names over 256 characters with TooLong error", () => {
      const longName = "A".repeat(257);
      expectInvalid(middleNameValidator, longName, ValidatorCode.TooLong);
    });
  });
});

describe("lastNameValidator", () => {
  describe("valid last names", () => {
    it("should accept simple last names", () => {
      expectValid(lastNameValidator, "Smith");
      expectValid(lastNameValidator, "McDonald");
      expectValid(lastNameValidator, "Hansen");
    });

    it("should accept names with apostrophes", () => {
      expectValid(lastNameValidator, "O'Brien");
    });

    it("should accept compound last names", () => {
      expectValid(lastNameValidator, "van der Berg");
      expectValid(lastNameValidator, "de la Cruz");
    });

    it("should accept names with accented characters", () => {
      expectValid(lastNameValidator, "Müller");
    });

    it("should accept hyphenated last names", () => {
      expectValid(lastNameValidator, "Smith-Jones");
      expectValid(lastNameValidator, "García-López");
    });

    it("should accept names exactly 64 characters", () => {
      const exactlyMaxLength = "A".repeat(64);
      expectValid(lastNameValidator, exactlyMaxLength);
    });
  });

  describe("optional handling", () => {
    it("should accept undefined", () => {
      expectValid(lastNameValidator, undefined);
    });

    it("should accept empty string", () => {
      expectValid(lastNameValidator, "");
    });

    it("should accept whitespace-only string (becomes empty after trim)", () => {
      expectValid(lastNameValidator, "   ", "");
    });
  });

  describe("whitespace handling", () => {
    it("should trim leading and trailing whitespace", () => {
      expectValid(lastNameValidator, "  Smith  ", "Smith");
      expectValid(lastNameValidator, "\tJohnson\t", "Johnson");
      expectValid(lastNameValidator, "\n Hansen \n", "Hansen");
    });

    it("should preserve internal whitespace", () => {
      expectValid(lastNameValidator, "van der Berg");
      expectValid(lastNameValidator, "de la Cruz");
    });
  });

  describe("invalid types", () => {
    it("should fail on non-string with InvalidType error", () => {
      expectInvalid(lastNameValidator, 123, ValidatorCode.InvalidType);
    });
  });

  describe("length validation", () => {
    it("should fail on names over 64 characters with TooLong error", () => {
      const longName = "A".repeat(65);
      expectInvalid(lastNameValidator, longName, ValidatorCode.TooLong);
    });
  });
});
