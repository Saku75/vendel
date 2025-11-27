import { AuthRole } from "$lib/enums/auth/role";

import type { AuthRefreshToken } from "./refresh";

type AuthAccessToken = {
  refreshToken: AuthRefreshToken;

  user: {
    id: string;
    role: AuthRole;
  };
};

export type { AuthAccessToken };
