import { AuthStatus } from "$lib/enums/auth/status";

import { AuthTokenData } from "./token";

interface AuthAuthenticated {
  status: AuthStatus.Authenticated | AuthStatus.Expired;

  authToken: { expiresAt: number };
  refreshToken: AuthTokenData["refreshToken"];

  user: AuthTokenData["user"];
}

interface AuthUnauthenticated {
  status: AuthStatus.Unauthenticated;
}

type Auth = AuthAuthenticated | AuthUnauthenticated;

export type { Auth };
