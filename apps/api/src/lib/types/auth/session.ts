import { AuthTokenData } from "./token";

interface AuthSession {
  refreshToken: AuthTokenData["refreshToken"] & {
    invalidated: boolean;
    used: boolean;
  };

  user: AuthTokenData["user"];
}

export { AuthSession };
