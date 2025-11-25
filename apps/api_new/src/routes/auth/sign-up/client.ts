import { defineRoute, request } from "$lib/client/route";

const signUpClient = defineRoute((context) => {
  return async () => request(context, "/auth/sign-up");
});

export { signUpClient };
