import { expect } from "vitest";
import type { ZodMiniType } from "zod/mini";

import type { ValidatorCode } from "../../main";

function expectValid<T>(
  validator: ZodMiniType<T>,
  input: unknown,
  expectedOutput?: T,
): void {
  const result = validator.safeParse(input);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toBe(expectedOutput ?? input);
  }
}

function expectInvalid(
  validator: ZodMiniType,
  input: unknown,
  expectedCode: ValidatorCode,
): void {
  const result = validator.safeParse(input);
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe(expectedCode);
  }
}

export { expectInvalid, expectValid };
