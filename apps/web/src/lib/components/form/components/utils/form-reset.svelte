<script lang="ts">
  import cn from "$lib/utils/cn";

  interface Props {
    class?: string;
  }

  const { class: classes }: Props = $props();
</script>

<button
  class={cn(
    "w-full cursor-pointer rounded-full bg-stone-300/50 p-1 px-4 py-2 backdrop-blur transition-colors active:bg-stone-300/90! dark:bg-stone-800/50 dark:active:bg-stone-800/90! hocus:bg-stone-300/70 dark:hocus:bg-stone-800/70",
    classes,
  )}
  type="reset"
>
  Nulstil
</button>
