import { createClient } from "@app/api/client";

const apiClient = createClient({
  prefix: "/api",
});

export { apiClient };
