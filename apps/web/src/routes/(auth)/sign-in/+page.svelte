<script lang="ts">
  import { emailValidator } from "@package/validators/email";
  import { passwordValidator } from "@package/validators/password";

  import { goto } from "$app/navigation";

  import { apiClient } from "$lib/api/client";
  import CaptchaInput from "$lib/components/form/components/captcha-input.svelte";
  import TextInput from "$lib/components/form/components/text-input.svelte";
  import FormSubmit from "$lib/components/form/components/utils/form-submit.svelte";
  import { setFormContext } from "$lib/components/form/context.svelte";
  import { FieldType } from "$lib/components/form/enums/field/type";
  import Form from "$lib/components/form/form.svelte";
  import type {
    CaptchaField,
    Fields,
    Require,
    TextField,
  } from "$lib/components/form/types/field";
  import { authStore } from "$lib/stores/auth.svelte";

  interface SignInForm extends Fields {
    email: Require<TextField>;
    password: Require<TextField>;

    captcha: Require<CaptchaField>;
  }

  const formContext = setFormContext<SignInForm>("signIn");

  async function onsubmit() {
    const formValues = formContext.getValues();

    const response = await apiClient.auth.signIn(formValues);

    if (!response.ok) {
      formContext.setErrors(response.errors);
      formContext.resetCaptchas();
      return;
    }

    await apiClient.auth.whoAmI().then((res) => {
      if (res.ok) {
        authStore.setAuthenticated(res.data!);
      }
    });
    await goto("/");
  }
</script>

<main class="mx-auto w-full max-w-xs">
  <Form name="signIn" class="items-center" {onsubmit}>
    <h1 class="mb-4 text-4xl">Log ind</h1>

    <TextInput
      key="email"
      type={FieldType.Email}
      label="Email"
      autocomplete="email"
      validator={emailValidator}
      required
    />
    <TextInput
      key="password"
      type={FieldType.Password}
      label="Adgangskode"
      autocomplete="current-password"
      validator={passwordValidator}
      required
    />

    <CaptchaInput key="captcha" />

    <FormSubmit label="Log ind" submittingLabel="Logger ind" />
  </Form>
</main>
