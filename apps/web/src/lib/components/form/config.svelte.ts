import { getContext, setContext } from "svelte";

import type { FormConfig } from "./types/config";

function setFormConfig(config: FormConfig) {
  return setContext("form-config", config);
}

function getFormConfig() {
  return getContext<FormConfig>("form-config");
}

export { getFormConfig, setFormConfig };
