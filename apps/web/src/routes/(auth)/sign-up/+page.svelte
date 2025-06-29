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
  import TextInput from "$lib/components/form/components/text-input.svelte";
  import FormSubmit from "$lib/components/form/components/utils/form-submit.svelte";
  import { setFormContext } from "$lib/components/form/context.svelte";
  import { FieldType } from "$lib/components/form/enums/field/type";
  import Form from "$lib/components/form/form.svelte";
  import type {
    Fields,
    Require,
    TextField,
  } from "$lib/components/form/types/field";

  interface SignUpForm extends Fields {
    firstName: Require<TextField>;
    middleName: TextField;
    lastName: TextField;

    email: Require<TextField>;
    password: Require<TextField>;
    confirmPassword: Require<TextField>;

    captcha: Require<TextField>;
  }

  const formContext = setFormContext<SignUpForm>("signUp");

  async function onsubmit() {
    const formValues = formContext.getValues();

    const response = await apiClient.auth.signUp(formValues);

    if (!response.ok) {
      formContext.setErrors(response.errors);
      return;
    }

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
