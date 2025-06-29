<script lang="ts">
  import type { Snippet } from "svelte";

  import { LayoutSize } from "$lib/enums/layout/size";
  import { layoutStore } from "$lib/stores/layout.svelte";
  import cn from "$lib/utils/cn";

  interface Props {
    from?: LayoutSize;
    to?: LayoutSize;

    children: Snippet;
  }

  const { from, to, children }: Props = $props();

  if (!from && !to) {
    console.warn(
      "WidthLimiter: You must provide either 'from' or 'to' prop. Otherwise, The component will always be hidden.",
    );
  }

  let show = $derived.by(() => {
    if (!layoutStore.size.width) {
      return true;
    }

    if (from && to) {
      return layoutStore.size.width >= from && layoutStore.size.width < to;
    } else if (from) {
      return layoutStore.size.width >= from;
    } else if (to) {
      return layoutStore.size.width < to;
    }
  });

  const classes = cn(
    "hidden",
    {
      "sm:contents": from === LayoutSize.Small,
      "md:contents": from === LayoutSize.Medium,
      "lg:contents": from === LayoutSize.Large,
      "xl:contents": from === LayoutSize.ExtraLarge,
      "2xl::contents": from === LayoutSize.DoubleExtraLarge,
    },
    {
      "max-sm:contents": to === LayoutSize.Small,
      "max-md:contents": to === LayoutSize.Medium,
      "max-lg:contents": to === LayoutSize.Large,
      "max-xl:contents": to === LayoutSize.ExtraLarge,
      "max-2xl::contents": to === LayoutSize.DoubleExtraLarge,
    },
  );
</script>

{#if show}
  <div class={classes}>
    {@render children()}
  </div>
{/if}
