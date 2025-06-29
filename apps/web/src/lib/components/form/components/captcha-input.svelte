<script lang="ts">
  import { onDestroy } from "svelte";
  import { Turnstile } from "svelte-turnstile";

  import { configStore } from "$lib/stores/config.svelte";
  import { layoutStore } from "$lib/stores/layout.svelte";
  import cn from "$lib/utils/cn";

  import { getFormConfig } from "../config.svelte";
  import { getFormContext } from "../context.svelte";
  import { FieldType } from "../enums/field/type";
  import type { CaptchaField } from "../types/field";

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, fieldContext] = formContext.addField<CaptchaField>({
    key,
    type: FieldType.Captcha,
    action,
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
    theme={layoutStore.theme !== "system" ? layoutStore.theme : "auto"}
    siteKey={configStore.turnstileSiteKey}
    {action}
    bind:reset={fieldContext.reset}
    on:callback={(event) => (fieldContext.value = event.detail.token)}
  />

  {#if fieldContext.error}
    <span class="px-4 text-sm text-red-700 dark:text-red-500">
      {fieldContext.error}
    </span>
  {/if}
</div>
