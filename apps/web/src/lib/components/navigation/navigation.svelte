<script lang="ts">
  import HeaderLink from "$lib/components/layout/header/header-link.svelte";
  import { navigationStore } from "$lib/stores/navigation.svelte";
  import cn from "$lib/utils/cn";

  interface Props {
    type?: "list" | "bar";
  }

  const { type = "list" }: Props = $props();
</script>

<nav
  class={cn("flex justify-between gap-1", {
    "flex-col": type === "list",
  })}
>
  {#each navigationStore as items, i (i)}
    <ul
      class={cn("flex gap-1", {
        "flex-col": type === "list",
      })}
    >
      {#each items as { text, href, target, Icon } (href)}
        <li class="contents">
          <HeaderLink {href} {target} class="h-10 gap-1">
            {#if Icon}
              <Icon
                class={cn({
                  "h-5.5 w-5.5": type === "list",
                  "h-4.5 w-4.5": type === "bar",
                })}
              />
            {/if}
            {text}
          </HeaderLink>
        </li>
      {/each}
    </ul>
    {#if type === "list" && i !== navigationStore.length - 1}
      <hr
        class="w-full max-w-32 self-center border-t border-sky-400/50 dark:border-sky-600/50"
      />
    {/if}
  {/each}
</nav>
