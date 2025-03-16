import { Hono } from "hono";
import { cors } from "hono/cors";

const api = new Hono();

api.use(
  cors({
    origin: (origin) =>
      /((.*\.)?vendel\.dk|localhost(:\d{1,5}?))$/.test(origin)
        ? origin
        : "https://vendel.dk",
  }),
);

api.get("/", (c) => c.text("Vendel.dk"));

export default {
  async fetch(request: Request, env: WorkerEnv, context: ExecutionContext) {
    const url = new URL(request.url);

    const pathPrefix = !/(api\.(dev\.)?vendel\.dk|localhost(:\d{1,5}?))$/.test(
      url.host,
    )
      ? "/api"
      : "";

    const server = new Hono().basePath(pathPrefix).route("/", api);

    return await server.fetch(request);
  },
};
