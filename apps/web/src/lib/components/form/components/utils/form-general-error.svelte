<script lang="ts">
  import cn from "$lib/utils/cn";

  import { getFormConfig } from "../../config.svelte";
  import { getFormContext } from "../../context.svelte";

  interface Props {
    class?: string;
  }

  const { class: classes }: Props = $props();

  const formConfig = getFormConfig();
  const formContext = getFormContext(formConfig.name);
</script>

{#if formContext.generalError}
  <div
    class={cn(
      "rounded-[1.25rem] px-4 text-sm text-red-700 dark:text-red-500",
      classes,
    )}
  >
    {formContext.generalError}
  </div>
{/if}
