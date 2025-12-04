import { getContext, setContext } from "svelte";

type ConfigContext = {
  version: string;
  canonicalOrigin: string;
  turnstileSiteKey: string;
};

const CONFIG_CONTEXT_KEY = "config-context";

function setConfigContext(config: ConfigContext) {
  const configContext = $state<ConfigContext>({
    version: config.version,
    canonicalOrigin: config.canonicalOrigin,
    turnstileSiteKey: config.turnstileSiteKey,
  });

  return setContext(CONFIG_CONTEXT_KEY, configContext);
}

function getConfigContext() {
  return getContext<ConfigContext>(CONFIG_CONTEXT_KEY);
}

export { getConfigContext, setConfigContext, type ConfigContext };
