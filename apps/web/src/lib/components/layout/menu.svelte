<script lang="ts">
  import type { Snippet } from "svelte";
  import { slide } from "svelte/transition";

  import { beforeNavigate } from "$app/navigation";

  import { LayoutMenuContent } from "$lib/enums/layout/menu/content";
  import { LayoutSize } from "$lib/enums/layout/size";
  import { layoutStore } from "$lib/stores/layout.svelte";

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  $effect(() => {
    if (
      layoutStore.size.width &&
      layoutStore.size.width > Number(LayoutSize.Medium) &&
      layoutStore.menu.content === LayoutMenuContent.Navigation
    ) {
      layoutStore.menu.open = false;
    }
  });

  beforeNavigate(() => {
    layoutStore.menu.open = false;
  });
</script>

{#if layoutStore.menu.open}
  <div transition:slide={{ duration: 500 }}>
    <div class="max-h-[calc(100vh-4.75rem-1px)] overflow-y-auto rounded-2xl">
      <hr
        class="mx-auto my-1 block max-w-32 self-center border-t border-sky-400/50 dark:border-sky-600/50"
      />
      {@render children()}
    </div>
  </div>
{/if}
