import { AuthStatus } from "@app/api/enums";
import type { WhoAmIResponse } from "@app/api/types";

type AuthStore = {
  status: AuthStatus;

  user?: WhoAmIResponse["user"];
  session?: WhoAmIResponse["session"];

  setAuthenticated: (whoAmI: WhoAmIResponse) => void;
  setUnauthenticated: () => void;
};

const authStore = $state<AuthStore>({
  status: AuthStatus.Unauthenticated,

  async setAuthenticated(whoAmI) {
    this.status = AuthStatus.Authenticated;
    this.user = whoAmI.user;
    this.session = whoAmI.session;
  },
  async setUnauthenticated() {
    this.status = AuthStatus.Unauthenticated;
    this.user = undefined;
    this.session = undefined;
  },
});

export { authStore };
