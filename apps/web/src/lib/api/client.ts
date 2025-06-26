import { createClient } from "@repo/api/client";

const apiClient = createClient({ prefix: "/api" });

export { apiClient };
