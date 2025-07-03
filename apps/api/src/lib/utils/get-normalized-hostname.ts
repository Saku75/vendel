import { Context } from "hono";

function getNormalizedHostname(c: Context) {
  return new URL(c.req.url).hostname.replace("www.", "");
}

export { getNormalizedHostname };
