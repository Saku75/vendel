import { Context } from "hono";
import { ZodIssueCode, type RefinementCtx } from "zod";

import { ValidatorCode } from "@package/validators";

import { HonoEnv } from "$lib/server";

/**
 * Validates captcha with a fresh idempotency key
 * Use this for immediate validation (like email sending)
 */
export async function validateCaptchaFresh(
  c: Context<HonoEnv>,
  captcha: string,
): Promise<{ valid: boolean; idempotencyKey: string }> {
  const idempotencyKey = c.var.captcha.createIdempotencyKey();
  const valid = await c.var.captcha.verify(captcha, idempotencyKey);
  return { valid, idempotencyKey };
}

/**
 * Validates captcha with an existing idempotency key
 * Use this for session-based validation (like sign-in/sign-up finish)
 */
export async function validateCaptchaWithKey(
  c: Context<HonoEnv>,
  captcha: string,
  idempotencyKey: string,
): Promise<boolean> {
  return await c.var.captcha.verify(captcha, idempotencyKey);
}

/**
 * Creates a Zod superRefine function for fresh captcha validation
 * Use this in schema validation for start endpoints
 */
export function createFreshCaptchaValidator(c: Context<HonoEnv>) {
  return async (values: { captcha: string }, context: RefinementCtx) => {
    const { valid } = await validateCaptchaFresh(c, values.captcha);
    if (!valid) {
      context.addIssue({
        code: ZodIssueCode.custom,
        message: ValidatorCode.Invalid,
        path: ["captcha"],
      });
    }
  };
}

/**
 * Creates a Zod superRefine function for fresh captcha validation with pre-created idempotency key
 * Use this when you need to control and store the idempotency key (e.g., session-based flows)
 */
export function createFreshCaptchaValidatorWithKey(
  c: Context<HonoEnv>,
  idempotencyKey: string,
) {
  return async (values: { captcha: string }, context: RefinementCtx) => {
    const valid = await validateCaptchaWithKey(
      c,
      values.captcha,
      idempotencyKey,
    );
    if (!valid) {
      context.addIssue({
        code: ZodIssueCode.custom,
        message: ValidatorCode.Invalid,
        path: ["captcha"],
      });
    }
  };
}

/**
 * Creates a Zod superRefine function for session-based captcha validation
 * Use this in schema validation for finish endpoints
 */
export function createSessionCaptchaValidator(
  c: Context<HonoEnv>,
  idempotencyKey: string,
) {
  return async (values: { captcha: string }, context: RefinementCtx) => {
    const valid = await validateCaptchaWithKey(
      c,
      values.captcha,
      idempotencyKey,
    );
    if (!valid) {
      context.addIssue({
        code: ZodIssueCode.custom,
        message: ValidatorCode.Invalid,
        path: ["captcha"],
      });
    }
  };
}
