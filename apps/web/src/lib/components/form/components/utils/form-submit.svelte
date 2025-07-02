<script lang="ts">
  import Button from "$lib/components/common/interactions/button.svelte";
  import cn from "$lib/utils/cn";

  import { getFormConfig } from "../../config.svelte";
  import { getFormContext } from "../../context.svelte";

  interface Props {
    label: string;

    class?: string;
  }

  const { label, class: classes }: Props = $props();

  const formConfig = getFormConfig();
  const formContext = getFormContext(formConfig.name);
</script>

<Button
  class={cn("w-full", classes)}
  type="submit"
  disabled={!formContext.isDirty || !formContext.isValid}
>
  {label}
</Button>
