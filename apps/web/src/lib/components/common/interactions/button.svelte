<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  import cn from "$lib/utils/cn";

  import { InteractionColor } from "./enums/color";
  import { InteractionEmphasis } from "./enums/emphasis";
  import { getInteractionStyle } from "./utils/get-style";

  interface Props extends HTMLButtonAttributes {
    color?: InteractionColor;
    emphasis?: InteractionEmphasis;

    class?: string;

    children: Snippet;
  }

  const {
    color = InteractionColor.Default,
    emphasis = InteractionEmphasis.Primary,
    class: classes,
    children,
    ...rest
  }: Props = $props();
</script>

<button {...rest} class={cn(getInteractionStyle(color, emphasis), classes)}>
  {@render children()}
</button>
