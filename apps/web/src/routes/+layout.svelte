<script lang="ts">
  import Footer from "$lib/components/layout/footer.svelte";
  import Header from "$lib/components/layout/header/header.svelte";
  import { layoutStore } from "$lib/stores/layout.svelte";

  import "../app.css";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();

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

{@render children()}

<Footer />
