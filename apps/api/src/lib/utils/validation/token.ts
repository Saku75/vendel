import { Context } from "hono";
import { ZodIssueCode, type RefinementCtx } from "zod";

import { TokenPurpose } from "@package/token";
import { ValidatorCode } from "@package/validators";

import { HonoEnv } from "$lib/server";
import { Err } from "$lib/types/result";

export interface TokenValidationResult<T> {
  success: true;
  data: T;
}

export interface TokenValidationError {
  success: false;
  error: Err;
}

export type TokenValidationResponse<T> =
  | TokenValidationResult<T>
  | TokenValidationError;

/**
 * Validates a token with comprehensive error handling
 * Returns either success with data or structured error response
 */
export function validateToken<T = unknown>(
  c: Context<HonoEnv>,
  token: string,
  expectedPurpose: TokenPurpose,
): TokenValidationResponse<T> {
  // Step 1: Parse and decrypt token
  let tokenResult;
  try {
    tokenResult = c.var.token.read(token);
  } catch {
    return {
      success: false,
      error: {
        ok: false,
        status: 400,
        errors: [
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.Invalid,
            path: ["token"],
          },
        ],
      },
    };
  }

  // Step 2: Check token validity
  if (!tokenResult || !tokenResult.valid) {
    return {
      success: false,
      error: {
        ok: false,
        status: 400,
        errors: [
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.Invalid,
            path: ["token"],
          },
        ],
      },
    };
  }

  // Step 3: Check token expiration
  if (tokenResult.expired) {
    return {
      success: false,
      error: {
        ok: false,
        status: 400,
        errors: [
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.Expired,
            path: ["token"],
          },
        ],
      },
    };
  }

  // Step 4: Check token purpose
  if (tokenResult.payload.purpose !== expectedPurpose) {
    return {
      success: false,
      error: {
        ok: false,
        status: 400,
        errors: [
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.InvalidType,
            path: ["token"],
          },
        ],
      },
    };
  }

  // Success - return validated token data
  return {
    success: true,
    data: tokenResult.payload.data as T,
  };
}

/**
 * Creates a Zod superRefine function for token validation
 * Use this in schema validation
 */
export function createTokenValidator<T = unknown>(
  c: Context<HonoEnv>,
  expectedPurpose: TokenPurpose,
) {
  return async (values: { token: string }, context: RefinementCtx) => {
    const result = validateToken<T>(c, values.token, expectedPurpose);
    if (!result.success) {
      // Extract the first error from the result
      const error = result.error.errors![0];
      context.addIssue({
        code: ZodIssueCode.custom,
        message: error.message,
        path: error.path,
      });
    }
  };
}
