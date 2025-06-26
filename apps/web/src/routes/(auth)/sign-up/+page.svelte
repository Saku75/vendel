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
      firstName: string;
      middleName?: string;
      lastName?: string;
      email: string;
      password: string;
      captcha: string;
    } = {
      firstName: formData.get("firstName") as string,
      middleName: formData.get("middleName") as string | undefined,
      lastName: formData.get("lastName") as string | undefined,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      captcha: formData.get("cf-turnstile-response") as string,
    };

    const signUpRes = await apiClient.auth.signUp(data);

    if (!signUpRes.ok) {
      reset?.();
    } else {
      await goto("/");
    }
  }
</script>

<form novalidate onsubmit={handleSubmit}>
  <input type="text" name="firstName" required />
  <input type="text" name="middleName" />
  <input type="text" name="lastName" />

  <input type="email" name="email" required />
  <input type="password" name="password" required />

  <Turnstile
    siteKey={data.config.turnstileSiteKey}
    action="auth:sign-up"
    bind:reset
  />

  <button type="submit">Submit</button>
</form>
