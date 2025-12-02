import { createClient } from "@app/api/client";

const api = createClient({
  prefix: "/api",
});

export { api };
