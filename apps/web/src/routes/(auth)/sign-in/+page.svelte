<script lang="ts">
  import { emailValidator } from "@package/validators/email";
  import { passwordValidator } from "@package/validators/password";

  import { goto } from "$app/navigation";

  import { apiClient } from "$lib/api/client";
  import CaptchaInput from "$lib/components/form/components/captcha-input.svelte";
  import FormSubmit from "$lib/components/form/components/form-submit.svelte";
  import TextInput from "$lib/components/form/components/text-input.svelte";
  import { setFormContext } from "$lib/components/form/context.svelte";
  import { FieldType } from "$lib/components/form/enums/field/type";
  import Form from "$lib/components/form/form.svelte";
  import type {
    CaptchaField,
    Fields,
    TextField,
  } from "$lib/components/form/types/field";

  interface SignInForm extends Fields {
    email: TextField;
    password: TextField;

    captcha: CaptchaField;
  }

  const formContext = setFormContext<SignInForm>("signIn");

  async function onsubmit() {
    const { email, password, captcha } = formContext.getValues();

    await apiClient.auth.signIn({
      email: email as string,
      password: password as string,

      captcha: captcha as string,
    });

    await goto("/");
  }
</script>

<Form name="signIn" class="mx-auto w-full max-w-xs items-center" {onsubmit}>
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

  <FormSubmit label="Log ind" />
</Form>
