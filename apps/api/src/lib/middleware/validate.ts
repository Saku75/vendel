import type { ValidationTargets } from "hono";
import { validator } from "hono/validator";
import type { ZodSchema, z } from "zod";
import { ZodObject } from "zod";

import { HttpStatus } from "$lib/enums/http.status";
import { ApiPostResponse, ApiPutResponse } from "$lib/types/api/response";

const validate = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
  failureStatus:
    | HttpStatus.BadRequest
    | HttpStatus.NotFound = HttpStatus.BadRequest,
) =>
  validator(target, async (value, c) => {
    let validatorValue = value;

    if (target === "header" && schema instanceof ZodObject) {
      const schemaKeys = Object.keys(schema.shape);
      const caseInsensitiveKeyMap = Object.fromEntries(
        schemaKeys.map((key) => [key.toLowerCase(), key]),
      );

      validatorValue = Object.fromEntries(
        Object.entries(value).map(([key, value]) => [
          caseInsensitiveKeyMap[key] || key,
          value,
        ]),
      );
    }

    const result = await schema.safeParseAsync(validatorValue);

    if (!result.success) {
      switch (failureStatus) {
        case HttpStatus.BadRequest:
          return c.json(
            { success: result.success, errors: result.error } satisfies
              | ApiPostResponse
              | ApiPutResponse,
            400,
          );
        case HttpStatus.NotFound:
          return c.json(
            {
              message: "Not found",
            },
            404,
          );
      }
    }

    return result.data as z.infer<T>;
  });

export { validate };
