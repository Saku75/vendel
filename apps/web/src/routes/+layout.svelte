<script lang="ts">
  import { page } from "$app/state";

  import Footer from "$lib/components/layout/footer.svelte";
  import Header from "$lib/components/layout/header.svelte";
  import { setAuthContext } from "$lib/contexts/auth.svelte";
  import { setConfigContext } from "$lib/contexts/config.svelte";
  import { layoutStore } from "$lib/stores/layout.svelte";
  import { themeStore } from "$lib/stores/theme.svelte";

  import "../app.css";
  import type { LayoutProps } from "./$types";

  const { data, children }: LayoutProps = $props();

  // svelte-ignore state_referenced_locally
  setAuthContext(data.whoAmI);
  // svelte-ignore state_referenced_locally
  setConfigContext(data.config);
  // svelte-ignore state_referenced_locally
  themeStore.current = data.theme;
</script>

<svelte:window
  bind:innerHeight={layoutStore.size.height}
  bind:innerWidth={layoutStore.size.width}
/>

<svelte:head>
  <title>Vendel.dk</title>
  <link
    rel="canonical"
    href={data.config.canonicalOrigin + page.url.pathname}
  />
</svelte:head>

<Header />

<div class="flex flex-col justify-center py-8">
  {@render children()}
</div>

<Footer />
