import { and, eq, ne } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { z } from "zod";

import { AppEnv } from "$lib/app";
import { database } from "$lib/database";
import { usersSchema } from "$lib/database/schema/users";
import { AuthRole } from "$lib/enums/auth.role";

import {
  UserEmailValidationCode,
  UserFirstNameValidationCode,
  UserLastNameValidationCode,
  UserMiddleNameValidationCode,
  UserRoleValidationCode,
} from "./users.codes";

const userFirstNameValidation = z
  .string()
  .nonempty(UserFirstNameValidationCode.Required)
  .max(50, UserFirstNameValidationCode.TooLong);

const userMiddleNameValidation = z
  .string()
  .max(200, UserMiddleNameValidationCode.TooLong);

const userLastNameValidation = z
  .string()
  .max(50, UserLastNameValidationCode.TooLong);

const userEmailValidation = z
  .string()
  .nonempty(UserEmailValidationCode.Required)
  .max(320, UserEmailValidationCode.TooLong)
  .email(UserEmailValidationCode.Invalid)
  .superRefine(async (value, context) => {
    const { userId } = getContext<AppEnv>().req.param() as {
      userId?: string;
    };

    const users = await database()
      .select({ email: usersSchema.email })
      .from(usersSchema)
      .where(
        and(
          userId ? ne(usersSchema.id, userId) : undefined,
          eq(usersSchema.email, value),
        ),
      );

    if (users.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: UserEmailValidationCode.AlreadyExists,
      });
    }
  });

const userRoleValidation = z.enum(
  [AuthRole.Admin, AuthRole.User, AuthRole.Guest],
  { message: UserRoleValidationCode.Invalid },
);

const userValidation = z.object({
  firstName: userFirstNameValidation,
  middleName: userMiddleNameValidation,
  lastName: userLastNameValidation,
  email: userEmailValidation,
  role: userRoleValidation,
});

export {
  userEmailValidation,
  userFirstNameValidation,
  userLastNameValidation,
  userMiddleNameValidation,
  userRoleValidation,
  userValidation,
};
