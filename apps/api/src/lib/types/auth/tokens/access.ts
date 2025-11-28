import { AuthRole } from "$lib/enums/auth/role";

type AuthAccessToken = {
  user: {
    id: string;
    role: AuthRole;
  };
};

export type { AuthAccessToken };
