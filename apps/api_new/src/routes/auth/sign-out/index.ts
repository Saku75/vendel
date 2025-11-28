import { signOut } from "$lib/auth/flows/sign-out";
import { createServer } from "$lib/server";
import { requireAuth } from "$lib/server/middleware/require-auth";
import { response } from "$lib/server/response";

const signOutServer = createServer();

signOutServer.post("/", requireAuth({ allowExpired: true }), async (c) => {
  await signOut(c);

  return response(c, {
    status: 200,
    content: { message: "User signed out" },
  });
});

export { signOutServer };
