<script lang="ts">
  import Footer from "$lib/components/layout/footer.svelte";
  import Header from "$lib/components/layout/header/header.svelte";
  import { authStore } from "$lib/stores/auth.svelte";
  import { configStore } from "$lib/stores/config.svelte";
  import { layoutStore } from "$lib/stores/layout.svelte";

  import "../app.css";
  import type { LayoutProps } from "./$types";

  const { data, children }: LayoutProps = $props();

  authStore.auth = data.auth;

  configStore.version = data.config.version;
  configStore.turnstileSiteKey = data.config.turnstileSiteKey;

  layoutStore.theme = data.config.themePreference;
</script>

<svelte:window
  bind:innerHeight={layoutStore.size.height}
  bind:innerWidth={layoutStore.size.width}
/>

<svelte:head>
  <title>Vendel.dk</title>
</svelte:head>

<Header />

<div class="flex flex-col justify-center py-8">
  {@render children()}
</div>

<Footer />
