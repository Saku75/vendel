<script lang="ts">
  import { page } from "$app/state";

  import Footer from "$lib/components/layout/footer.svelte";
  import Header from "$lib/components/layout/header.svelte";
  import { authStore } from "$lib/stores/auth.svelte";
  import { configStore } from "$lib/stores/config.svelte";
  import { layoutStore } from "$lib/stores/layout.svelte";

  import "../app.css";
  import type { LayoutProps } from "./$types";

  const { data, children }: LayoutProps = $props();

  $effect(() => {
    if (data.whoAmI) {
      authStore.setAuthenticated(data.whoAmI);
    } else {
      authStore.setUnauthenticated();
    }
  });

  $effect(() => {
    configStore.version = data.config.version;
    configStore.turnstileSiteKey = data.config.turnstileSiteKey;
  });

  $effect(() => {
    layoutStore.theme = data.config.theme;
  });
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
