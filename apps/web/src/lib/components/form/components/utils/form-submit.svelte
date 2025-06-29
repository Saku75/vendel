<script lang="ts">
  import cn from "$lib/utils/cn";

  interface Props {
    label: string;

    class?: string;
  }

  const { label, class: classes }: Props = $props();
</script>

<button
  class={cn(
    "w-full cursor-pointer rounded-full bg-sky-300/50 p-1 px-4 py-2 backdrop-blur transition-colors active:bg-sky-300/90! dark:bg-sky-800/50 dark:active:bg-sky-800/90! hocus:bg-sky-300/70 dark:hocus:bg-sky-800/70",
    classes,
  )}
  type="submit"
>
  {label}
</button>
