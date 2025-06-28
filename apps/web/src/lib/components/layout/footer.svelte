<script lang="ts">
  import { Copyright } from "@lucide/svelte";
</script>

<footer
  class="text-s flex justify-between py-1 text-stone-600 dark:text-stone-400"
>
  <div>
    <small><a href="/privacy" class="underline">Privatlivspolitik</a></small>
  </div>
  <small class="flex items-center gap-1">
    <Copyright class="h-3 w-3" />
    <span>Vendel - {new Date().getFullYear()}</span>
  </small>
</footer>
