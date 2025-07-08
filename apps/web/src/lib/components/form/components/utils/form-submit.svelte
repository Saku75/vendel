<script lang="ts">
  import { LoaderCircle } from "@lucide/svelte";

  import Button from "$lib/components/common/interactions/button.svelte";
  import cn from "$lib/utils/cn";

  import { getFormConfig } from "../../config.svelte";
  import { getFormContext } from "../../context.svelte";

  interface Props {
    label: string;

    submittingLabel?: string;

    class?: string;
  }

  const { label, submittingLabel, class: classes }: Props = $props();

  const formConfig = getFormConfig();
  const formContext = getFormContext(formConfig.name);
</script>

<Button
  class={cn("flex w-full items-center justify-center gap-2", classes)}
  type="submit"
  disabled={!formContext.isDirty ||
    !formContext.isValid ||
    formContext.isSubmitting}
>
  {#if submittingLabel && formContext.isSubmitting}
    <LoaderCircle class="animate-spin" />
    {submittingLabel}...
  {:else}
    {label}
  {/if}
</Button>
