import { AuthSession } from "$lib/types/auth/session";

import { useKV } from "../kv";

const [getAuthSession, setAuthSession] = useKV<AuthSession>({
  prefix: "auth:session",
});

export { getAuthSession, setAuthSession };
