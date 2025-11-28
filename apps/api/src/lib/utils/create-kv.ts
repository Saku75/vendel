interface KVOptions {
  prefix?: string;
  suffix?: string;
}

function createKV<T = unknown>(kv: KVNamespace, options: KVOptions = {}) {
  const constructKey = (key: string): string => {
    const parts: string[] = [];
    if (options.prefix) parts.push(options.prefix);
    parts.push(key);
    if (options.suffix) parts.push(options.suffix);
    return parts.join(":");
  };

  return {
    get: async (
      key: string,
      opts?: Omit<KVNamespaceGetOptions<"json">, "type">,
    ): Promise<T | null> => {
      return kv.get<T>(constructKey(key), { type: "json", ...opts });
    },

    set: async (
      key: string,
      value: T,
      opts?: KVNamespacePutOptions,
    ): Promise<void> => {
      await kv.put(constructKey(key), JSON.stringify(value), opts);
    },

    delete: async (key: string): Promise<void> => {
      await kv.delete(constructKey(key));
    },

    has: async (key: string): Promise<boolean> => {
      return (await kv.get(constructKey(key))) !== null;
    },
  };
}

export { createKV };
