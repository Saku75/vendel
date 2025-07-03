import { AuthRefreshTokenData, AuthTokenData } from "./token";

interface AuthSession {
  refreshToken: AuthRefreshTokenData & {
    used: boolean;
  };

  user: AuthTokenData["user"];
}

export { AuthSession };
