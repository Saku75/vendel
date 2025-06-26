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

  let { children }: Props = $props();

  $effect(() => {
    if (
      layoutStore.size.width &&
      layoutStore.size.width > LayoutSize.Medium &&
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
  <div class="w-full">
    <div transition:slide={{ duration: 500 }}>
      <hr
        class="mx-auto my-1 w-full max-w-32 self-center border-t border-sky-400/50 dark:border-sky-600/50"
      />
      <div class="max-h-[calc(100vh-3rem)]">
        {@render children()}
      </div>
    </div>
  </div>
{/if}
