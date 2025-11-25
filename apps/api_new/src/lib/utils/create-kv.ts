interface KVOptions {
  prefix?: string;
  suffix?: string;
}

/**
 * Creates a scoped KV instance with automatic key prefixing/suffixing
 *
 * @example
 * ```typescript
 * import { env } from "cloudflare:workers";
 *
 * const sessionKV = createKV<Session>(env.KV, { prefix: "session" });
 * await sessionKV.set("user-123", { userId: "123" });
 * ```
 */
function createKV<T = unknown>(kv: KVNamespace, options: KVOptions = {}) {
  const constructKey = (key: string): string => {
    const parts: string[] = [];
    if (options.prefix) parts.push(options.prefix);
    parts.push(key);
    if (options.suffix) parts.push(options.suffix);
    return parts.join(":");
  };

  return {
    /** Get a value as JSON */
    get: async (
      key: string,
      opts?: Omit<KVNamespaceGetOptions<"json">, "type">,
    ): Promise<T | null> => {
      return kv.get<T>(constructKey(key), { type: "json", ...opts });
    },

    /** Set a value (auto-serializes to JSON) */
    set: async (
      key: string,
      value: T,
      opts?: KVNamespacePutOptions,
    ): Promise<void> => {
      await kv.put(constructKey(key), JSON.stringify(value), opts);
    },

    /** Delete a key */
    delete: async (key: string): Promise<void> => {
      await kv.delete(constructKey(key));
    },

    /** Check if a key exists */
    has: async (key: string): Promise<boolean> => {
      return (await kv.get(constructKey(key))) !== null;
    },
  };
}

export { createKV };
