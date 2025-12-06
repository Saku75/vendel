<script lang="ts">
  import { onDestroy } from "svelte";
  import { Turnstile } from "svelte-turnstile";

  import { getConfigContext } from "$lib/contexts/config.svelte";
  import { Theme } from "$lib/enums/theme";
  import { themeStore } from "$lib/stores/theme.svelte";
  import cn from "$lib/utils/cn";

  import { getFormConfig } from "../config.svelte";
  import { getFormContext } from "../context.svelte";
  import { FieldType } from "../enums/field/type";
  import type { CaptchaField } from "../types/field";
  import { getValidatorMessage } from "../utils/get-validator-message";

  interface Props {
    readonly key: CaptchaField["key"];

    action?: CaptchaField["action"];

    class?: string;
  }

  const {
    key,

    action,

    class: classes,
  }: Props = $props();

  const formConfig = getFormConfig();
  const formContext = getFormContext(formConfig.name);
  const configContext = getConfigContext();

  // svelte-ignore state_referenced_locally
  const { fieldContext } = formContext.addField<CaptchaField>({
    key,
    type: FieldType.Captcha,
    isValid: false,
    action,
  });

  $effect(() => {
    fieldContext.isValid = !!fieldContext.value;
  });

  onDestroy(() => {
    formContext.removeField(key);
  });
</script>

<div class={cn("min-h-[65px]", classes)}>
  <Turnstile
    class="h-[65px]"
    size="flexible"
    language="da"
    theme={themeStore.current !== Theme.System ? themeStore.current : "auto"}
    siteKey={configContext.turnstileSiteKey}
    {action}
    bind:reset={fieldContext.reset}
    on:callback={(event) => (fieldContext.value = event.detail.token)}
  />

  {#if fieldContext.error}
    <span class="px-4 text-sm text-red-700 dark:text-red-500">
      {getValidatorMessage(fieldContext.error)}
    </span>
  {/if}
</div>
