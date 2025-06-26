<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  import cn from "$lib/utils/cn";

  interface Props extends HTMLButtonAttributes {
    children: Snippet;
  }

  const { children, ...props }: Props = $props();
</script>

<button
  {...props}
  class={cn(
    "flex cursor-pointer items-center rounded-full px-3 font-medium whitespace-nowrap transition-colors hocus:bg-sky-300/50 dark:hocus:bg-sky-700/50",
    props.class,
  )}
>
  {@render children()}
</button>
