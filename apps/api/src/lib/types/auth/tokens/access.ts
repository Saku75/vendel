import type { AuthRole } from "$lib/enums/auth/role";

type AuthAccessToken = {
  id: string;

  user: {
    id: string;
    role: AuthRole;
  };
};

export type { AuthAccessToken };
