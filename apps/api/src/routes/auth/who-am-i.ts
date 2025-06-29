import { eq, getTableColumns } from "drizzle-orm";

import { users } from "$lib/database/schema/users";
import { Err, Ok } from "$lib/types/result";
import { app } from "$lib/utils/app";

import { removeAuthTokens } from "./utils/tokens";

const whoAmIRoute = app();

type WhoAmIResponse = Omit<
  typeof users.$inferSelect,
  "password" | "clientSalt" | "serverSalt"
>;

whoAmIRoute.get("/", async (c) => {
  if (!c.var.auth)
    return c.json(
      {
        ok: false,
        status: 401,
        message: "Not authenticated",
      } satisfies Err,
      401,
    );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, clientSalt, serverSalt, ...rest } = getTableColumns(users);

  const user = await c.var.database
    .select({ ...rest })
    .from(users)
    .where(eq(users.id, c.var.auth.user.id));

  if (!user.length) {
    removeAuthTokens(c);

    return c.json(
      {
        ok: false,
        status: 400,
        message: "User does not exist",
      } satisfies Err,
      400,
    );
  }

  return c.json({
    ok: true,
    status: 200,
    data: user[0],
  } satisfies Ok<WhoAmIResponse>);
});

export { whoAmIRoute };
export type { WhoAmIResponse };
