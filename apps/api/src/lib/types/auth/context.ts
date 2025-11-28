import { AuthStatus } from "$lib/enums";

import { AuthAccessToken } from "./tokens/access";
import { AuthRefreshToken } from "./tokens/refresh";

type AuthContextAuthenticatedOrExpired = {
  status: AuthStatus.Authenticated | AuthStatus.Expired;
  refresh: AuthRefreshToken & {
    expiresAt: number;
  };
  access: AuthAccessToken & { expiresAt: number };
};

type AuthContextUnauthenticated = {
  status: AuthStatus.Unauthenticated;
};

type AuthContext =
  | AuthContextAuthenticatedOrExpired
  | AuthContextUnauthenticated;

export type {
  AuthContext,
  AuthContextAuthenticatedOrExpired,
  AuthContextUnauthenticated,
};
