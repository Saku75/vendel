import { AuthStatus } from "$lib/enums";

import { AuthAccessToken } from "./tokens/access";

type AuthContextAuthenticatedOrExpired = {
  status: AuthStatus.Authenticated | AuthStatus.Expired;
  sessionId: AuthAccessToken["sessionId"];
  user: AuthAccessToken["user"];
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
