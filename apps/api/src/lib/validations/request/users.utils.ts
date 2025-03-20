import { eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "$lib/database";
import { usersSchema } from "$lib/database/schema/users";

const userIdExists = z
  .string()
  .nonempty()
  .cuid2()
  .superRefine(async (value, context) => {
    const users = await database()
      .select({
        id: usersSchema.id,
      })
      .from(usersSchema)
      .where(eq(usersSchema.id, value));

    if (!users.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
      });
    }
  });

const userIdExistsObject = z.object({
  userId: userIdExists,
});

export { userIdExists, userIdExistsObject };
