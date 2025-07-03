import type { WhoAmIResponse } from "@app/api/types";

type AuthStore = { auth?: WhoAmIResponse };

const authStore = $state<AuthStore>({ auth: undefined });

export { authStore };
