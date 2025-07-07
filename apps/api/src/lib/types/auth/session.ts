import { AuthTokenData } from "./token";

interface AuthSession {
  refreshToken: AuthTokenData["refreshToken"] & {
    used: boolean;
  };

  user: AuthTokenData["user"];
}

export { AuthSession };
