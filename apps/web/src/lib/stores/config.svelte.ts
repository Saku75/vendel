type ConfigStore = {
  version: string;
  turnstileSiteKey: string;
};

const configStore = $state<ConfigStore>({ version: "", turnstileSiteKey: "" });

export { configStore };
