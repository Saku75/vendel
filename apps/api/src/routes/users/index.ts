import { bytesToHex } from "@noble/ciphers/utils";
import { randomBytes } from "@noble/ciphers/webcrypto";
import { eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { usersSchema } from "$lib/database/schema/users";
import { HttpStatus } from "$lib/enums/http.status";
import { validate } from "$lib/middleware/validate";
import { userValidation } from "$lib/validations/request/users";
import { userIdExistsObject } from "$lib/validations/request/users.utils";

import {
  ApiUserCreateResponse,
  ApiUserDeleteResponse,
  ApiUserGetResponse,
  ApiUsersResponse,
  ApiUserUpdateResponse,
} from "./index.response";
import { userWishlistsRoutes } from "./wishlists";

const usersRoutes = app();

// Get all users
usersRoutes.get("/", async (c) => {
  const [users, totalCount] = await Promise.all([
    database().select().from(usersSchema),
    database().$count(usersSchema),
  ]);

  return c.json({
    data: {
      users,
      totalCount,
    },
  } satisfies ApiUsersResponse);
});

// Create user
usersRoutes.post("/", validate("json", userValidation), async (c) => {
  const data = c.req.valid("json");

  await database()
    .insert(usersSchema)
    .values({
      ...data,
      clientSalt: bytesToHex(randomBytes(32)),
      serverSalt: bytesToHex(randomBytes(32)),
    });

  return c.json({ success: true } satisfies ApiUserCreateResponse, 201);
});

// Get user
usersRoutes.get(
  "/:userId",
  validate("param", userIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { userId } = c.req.valid("param");

    const [user] = await database()
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, userId))
      .limit(1);

    return c.json({ data: user } satisfies ApiUserGetResponse);
  },
);

// Update user
usersRoutes.put(
  "/:userId",
  validate("param", userIdExistsObject, HttpStatus.NotFound),
  validate("json", userValidation),
  async (c) => {
    const { userId } = c.req.valid("param");
    const data = c.req.valid("json");

    await database()
      .update(usersSchema)
      .set(data)
      .where(eq(usersSchema.id, userId));

    return c.json({ success: true } satisfies ApiUserUpdateResponse);
  },
);

// Delete user
usersRoutes.delete(
  "/:userId",
  validate("param", userIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { userId } = c.req.valid("param");

    await database().delete(usersSchema).where(eq(usersSchema.id, userId));

    return c.json({ success: true } satisfies ApiUserDeleteResponse);
  },
);

usersRoutes.route("/", userWishlistsRoutes);

export { usersRoutes };
