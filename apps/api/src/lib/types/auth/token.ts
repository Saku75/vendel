import { AuthRole } from "$lib/enums/auth/role";

type AuthTokenData = {
  refreshToken: AuthRefreshTokenData & {
    expiresAt: number;
  };

  user: {
    id: string;
    role: AuthRole | null;
  };
};

type AuthRefreshTokenData = {
  family: string;
  id: string;
};

export type { AuthRefreshTokenData, AuthTokenData };
