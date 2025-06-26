<script lang="ts">
  import { Copyright } from "@lucide/svelte";
</script>

<footer class="flex justify-end py-1">
  <small
    class="flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400"
  >
    <Copyright class="h-3 w-3" />
    <span>Vendel - {new Date().getFullYear()}</span>
  </small>
</footer>
