<script lang="ts">
  import { emailValidator } from "@package/validators/email";
  import {
    firstNameValidator,
    lastNameValidator,
    middleNameValidator,
  } from "@package/validators/name";
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

  interface SignUpForm extends Fields {
    firstName: TextField;
    middleName: TextField;
    lastName: TextField;

    email: TextField;
    password: TextField;
    confirmPassword: TextField;

    captcha: CaptchaField;
  }

  const formContext = setFormContext<SignUpForm>("signUp");

  async function onsubmit() {
    const { firstName, middleName, lastName, email, password, captcha } =
      formContext.getValues();
    await apiClient.auth.signUp({
      firstName: firstName as string,
      middleName,
      lastName,

      email: email as string,
      password: password as string,

      captcha: captcha as string,
    });

    await goto("/");
  }
</script>

<Form name="signUp" class="mx-auto w-full max-w-xs items-center" {onsubmit}>
  <h1 class="mb-4 text-4xl">Opret</h1>

  <TextInput
    key="firstName"
    type={FieldType.Text}
    label="Fornavn"
    autocomplete="given-name"
    validator={firstNameValidator}
    required
  />
  <TextInput
    key="middleName"
    type={FieldType.Text}
    label="Mellemnavn"
    autocomplete="additional-name"
    validator={middleNameValidator}
  />
  <TextInput
    key="lastName"
    type={FieldType.Text}
    label="Efternavn"
    autocomplete="family-name"
    validator={lastNameValidator}
  />

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
    autocomplete="new-password"
    validator={passwordValidator}
    required
  />
  <TextInput
    key="confirmPassword"
    type={FieldType.Password}
    label="Bekræft adgangskode"
    autocomplete="new-password"
    validator={passwordValidator}
    required
  />

  <CaptchaInput key="captcha" />

  <FormSubmit label="Opret" />
</Form>
