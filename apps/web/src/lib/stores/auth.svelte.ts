import type { WhoAmIResponse } from "@app/api/client";

type AuthStore = { auth?: WhoAmIResponse };

const authStore = $state<AuthStore>({ auth: undefined });

export { authStore };
