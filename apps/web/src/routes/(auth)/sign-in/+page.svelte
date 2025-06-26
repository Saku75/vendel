<script lang="ts">
  import { Turnstile } from "svelte-turnstile";

  import { goto } from "$app/navigation";

  import { apiClient } from "$lib/api/client";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let reset = $state<() => void>();

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const data: {
      email: string;
      password: string;
      captcha: string;
    } = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      captcha: formData.get("cf-turnstile-response") as string,
    };

    await apiClient.auth.signIn(data);
    await goto("/");
  }
</script>

<form novalidate onsubmit={handleSubmit}>
  <input type="email" name="email" required />
  <input type="password" name="password" required />

  <Turnstile siteKey={data.config.turnstileSiteKey} bind:reset />

  <button type="submit">Submit</button>
</form>
