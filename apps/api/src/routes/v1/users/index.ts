import { eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { usersSchema } from "$lib/database/schema/users";
import { AuthRole } from "$lib/enums/auth.role";
import { userExists } from "$lib/validations/data/user.exists";

import { userWishlistsRoutes } from "./wishlists";

const usersRoutes = app();

// Get all users
usersRoutes.get("/", async (c) => {
  const users = await database().select().from(usersSchema);

  return c.json(users);
});

// Create user
usersRoutes.post("/", async (c) => {
  const data = (await c.req.json()) as {
    firstName: string;
    middleName?: string;
    lastName?: string;

    email: string;
    emailVerified: boolean;
    clientSalt: string;
    serverSalt: string;

    role?: AuthRole;

    approved: boolean;
    approvedBy?: string;
  };

  await database().insert(usersSchema).values(data);

  return c.body(null, 201);
});

// Get user
usersRoutes.get("/:userId", async (c) => {
  const { userId } = c.req.param();

  if (!(await userExists(userId))) return c.notFound();

  const [user] = await database()
    .select()
    .from(usersSchema)
    .where(eq(usersSchema.id, userId))
    .limit(1);

  return c.json(user);
});

// Update user
usersRoutes.put("/:userId", async (c) => {
  const { userId } = c.req.param();

  if (!(await userExists(userId))) return c.notFound();

  const data = (await c.req.json()) as {
    firstName: string;
    middleName?: string;
    lastName?: string;

    email: string;
    emailVerified: boolean;
    clientSalt: string;
    serverSalt: string;

    role: AuthRole;

    approved: boolean;
    approvedBy?: string;
  };

  await database()
    .update(usersSchema)
    .set(data)
    .where(eq(usersSchema.id, userId));

  return c.body(null, 204);
});

// Delete user
usersRoutes.delete("/:userId", async (c) => {
  const { userId } = c.req.param();

  if (!(await userExists(userId))) return c.notFound();

  await database().delete(usersSchema).where(eq(usersSchema.id, userId));

  return c.body(null, 204);
});

usersRoutes.route("/", userWishlistsRoutes);

export { usersRoutes };
