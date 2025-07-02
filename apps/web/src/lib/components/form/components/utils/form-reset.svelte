<script lang="ts">
  import Button from "$lib/components/common/interactions/button.svelte";
  import { InteractionEmphasis } from "$lib/components/common/interactions/enums/emphasis";
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

<Button
  emphasis={InteractionEmphasis.Secondary}
  class={cn("w-full", classes)}
  type="reset"
  disabled={!formContext.isDirty}
>
  Nulstil
</Button>
