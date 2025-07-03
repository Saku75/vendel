import { Context } from "hono";

import { HonoEnv } from "$lib/server";

function useKV<T = unknown>({
  prefix,
  suffix,
}: { prefix?: string; suffix?: string } = {}) {
  function constructName(name: string) {
    const fullName: string[] = [];

    if (prefix) fullName.push(prefix);
    fullName.push(name);
    if (suffix) fullName.push(suffix);

    return fullName.join(":");
  }

  async function get(
    c: Context<HonoEnv>,
    name: string,
    options?: KVNamespaceGetOptions<"json">,
  ) {
    return await c.env.KV.get<T>(constructName(name), {
      type: "json",
      ...options,
    });
  }

  async function set(
    c: Context<HonoEnv>,
    name: string,
    value: T,
    options?: KVNamespacePutOptions,
  ) {
    return await c.env.KV.put(
      constructName(name),
      JSON.stringify(value),
      options,
    );
  }

  async function unset(c: Context<HonoEnv>, name: string) {
    return await c.env.KV.delete(constructName(name));
  }

  return [get, set, unset] as const;
}

export { useKV };
