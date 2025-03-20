import { app } from "$lib/app";

import { routes } from "./routes";

export default {
  async fetch(request, env, context) {
    const pathPrefix = !/(api\.(dev\.)?vendel\.dk|localhost(:\d{1,5}?))$/.test(
      new URL(request.url).host,
    )
      ? "/api"
      : "/";

    const server = app();

    server.route(pathPrefix, routes);

    return await server.fetch(request, env, context);
  },
} satisfies ExportedHandler<WorkerEnv>;
