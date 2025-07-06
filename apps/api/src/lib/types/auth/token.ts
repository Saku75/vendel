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

type ConfirmEmailTokenData = {
  userId: string;
};

export type { AuthRefreshTokenData, AuthTokenData, ConfirmEmailTokenData };
