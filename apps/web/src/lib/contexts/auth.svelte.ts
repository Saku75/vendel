import { getContext, setContext } from "svelte";

import { AuthStatus } from "@app/api/enums";
import type { WhoAmIResponse } from "@app/api/types";

type AuthContext = {
  status: AuthStatus;
  user?: WhoAmIResponse["user"];
  session?: WhoAmIResponse["session"];

  setAuthenticated: (whoAmI: WhoAmIResponse) => void;
  setUnauthenticated: () => void;
};

const AUTH_CONTEXT_KEY = "auth-context";

function setAuthContext(whoAmI?: WhoAmIResponse) {
  const authContext = $state<AuthContext>({
    status: whoAmI ? AuthStatus.Authenticated : AuthStatus.Unauthenticated,
    user: whoAmI?.user,
    session: whoAmI?.session,

    setAuthenticated(whoAmI) {
      this.status = AuthStatus.Authenticated;
      this.user = whoAmI.user;
      this.session = whoAmI.session;
    },
    setUnauthenticated() {
      this.status = AuthStatus.Unauthenticated;
      this.user = undefined;
      this.session = undefined;
    },
  });

  return setContext(AUTH_CONTEXT_KEY, authContext);
}

function getAuthContext() {
  return getContext<AuthContext>(AUTH_CONTEXT_KEY);
}

export { getAuthContext, setAuthContext, type AuthContext };
