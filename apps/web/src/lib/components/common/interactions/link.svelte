<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  import cn from "$lib/utils/cn";

  import { InteractionColor } from "./enums/color";
  import { InteractionEmphasis } from "./enums/emphasis";
  import { getInteractionStyle } from "./utils/get-style";

  interface Props extends HTMLAnchorAttributes {
    color?: InteractionColor;
    emphasis?: InteractionEmphasis;

    class?: string;

    children: Snippet;
  }

  const {
    color = InteractionColor.Default,
    emphasis = InteractionEmphasis.Text,
    class: classes,
    children,
    ...rest
  }: Props = $props();
</script>

<a {...rest} class={cn(getInteractionStyle(color, emphasis), classes)}>
  {@render children()}
</a>
