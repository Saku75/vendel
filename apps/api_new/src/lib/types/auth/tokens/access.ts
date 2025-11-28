import { AuthRole } from "$lib/enums/auth/role";

type AuthAccessToken = {
  sessionId: string;

  user: {
    id: string;
    role: AuthRole;
  };
};

export type { AuthAccessToken };
