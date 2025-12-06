import { refresh } from "$lib/auth/flows/refresh";
import { AuthStatus } from "$lib/enums/auth/status";
import { createServer } from "$lib/server";
import { getAuth, requireAuth } from "$lib/server/middleware/require-auth";
import { response } from "$lib/server/response";
import type { RefreshResponse } from "$lib/types";

const refreshServer = createServer();

refreshServer.post("/", requireAuth({ allowExpired: true }), async (c) => {
  const auth = getAuth(c, { allowExpired: true });

  if (
    auth.status === AuthStatus.Authenticated &&
    Date.now() < auth.access.expiresAt - 5 * 60 * 1000
  ) {
    return response(c, {
      status: 200,
      content: { message: "Session refresh not required" },
    });
  }

  const result = await refresh(c);

  if (!result.success) {
    return response(c, {
      status: 401,
      content: { message: result.error },
    });
  }

  return response<RefreshResponse>(c, {
    status: 200,
    content: { message: "Session refreshed" },
  });
});

export { refreshServer };
