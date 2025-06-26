<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  import cn from "$lib/utils/cn";

  interface Props extends HTMLAnchorAttributes {
    children: Snippet;
  }

  const { children, ...props }: Props = $props();
</script>

<a
  {...props}
  class={cn(
    "flex items-center rounded-full px-3 whitespace-nowrap transition-colors hocus:bg-sky-300/50 dark:hocus:bg-sky-700/50",
    props.class,
  )}
>
  {@render children()}
</a>
