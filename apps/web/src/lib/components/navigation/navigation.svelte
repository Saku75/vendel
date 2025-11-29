<script lang="ts">
  import {
    type NavigationItem,
    navigationStore,
  } from "$lib/stores/navigation.svelte";
  import cn from "$lib/utils/cn";

  import Authenticated from "../common/auth/authenticated.svelte";
  import Unauthenticated from "../common/auth/unauthenticated.svelte";
  import { InteractionEmphasis } from "../common/interactions/enums/emphasis";
  import Link from "../common/interactions/link.svelte";

  interface Props {
    type?: "list" | "bar";
  }

  const { type = "list" }: Props = $props();
</script>

{#snippet navigationItem({ text, href, target, Icon }: NavigationItem)}
  <li class="contents">
    <Link
      emphasis={InteractionEmphasis.Header}
      {href}
      {target}
      class="h-10 w-auto gap-1"
    >
      {#if Icon}
        <Icon
          class={cn({
            "h-5.5 w-5.5": type === "list",
            "h-4.5 w-4.5": type === "bar",
          })}
        />
      {/if}
      {text}
    </Link>
  </li>
{/snippet}

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
      {#each items as item (item.href)}
        {#if item.showWhen}
          {#if item.showWhen.authenticated}
            <Authenticated role={item.showWhen.role}>
              {@render navigationItem(item)}
            </Authenticated>
          {:else}
            <Unauthenticated>
              {@render navigationItem(item)}
            </Unauthenticated>
          {/if}
        {:else}
          {@render navigationItem(item)}
        {/if}
      {/each}
    </ul>
    {#if type === "list" && i !== navigationStore.length - 1}
      <hr
        class="w-full max-w-32 self-center border-t border-sky-400/50 dark:border-sky-600/50"
      />
    {/if}
  {/each}
</nav>
