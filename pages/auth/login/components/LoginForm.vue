<template>
  <div class="login-form">
    <UiTextH2 class="login-form__title">LOGIN</UiTextH2>

    <UiFormControl
      class="login-form__field"
      label="Email"
      :errors="validatorLoginForm?.errorsFormData?.email?.errors"
    >
      <UiInput
        type="text"
        placeholder="example@test.com"
        @input="validatorLoginForm?.doValidateField('email', $event.target.value)"
        @blur="validatorLoginForm?.doValidateField('email', $event.target.value)"
        :value="props.formData?.email"
        :isDirty="validatorLoginForm?.errorsFormData?.email?.isDirty"
        :isInvalid="
          validatorLoginForm?.errorsFormData?.email?.errors?.length > 0
        "
      />
    </UiFormControl>

    <UiFormControl
      class="login-form__field"
      label="Password"
      :errors="validatorLoginForm?.errorsFormData?.password?.errors"
    >
      <UiInput
        type="password"
        placeholder="********"
        @input="
          validatorLoginForm?.doValidateField('password', $event.target.value)
        "
        @blur="
          validatorLoginForm?.doValidateField('password', $event.target.value)
        "
        :value="props.formData?.password"
        :isDirty="validatorLoginForm?.errorsFormData?.password?.isDirty"
        :isInvalid="
          validatorLoginForm?.errorsFormData?.password?.errors?.length > 0
        "
      />
    </UiFormControl>

    <UiButtonDefault
      type="submit"
      @click="validateLoginForm(doSendForm)"
      :isLoading="isLoading"
      state="dark"
      >LOGIN
    </UiButtonDefault>

    <div class="login-form__forgot-link">
      <br>
      <nuxt-link to="/auth/forgot">Forgot password?</nuxt-link>
      <br>
      <br>
      <nuxt-link to="/auth/registration">Registration</nuxt-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {useRouter} from "vue-router";

import UiTextH2 from "~/components/ui/UiTextH2.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import { useAppCore } from "~/composables/useAppCore";
import {
  validatorLoginForm,
  validateLoginForm,
  resetValidationLoginForm,
} from "@/pages/auth/login/composables/validation";

const props = defineProps({ formData: { type: Object, required: true } });

const isLoading = ref(false);
const appCore = useAppCore();

const doSendForm = async () => {
  try {
    isLoading.value = true;
    await appCore.auth.doLogin(props.formData);
    await useRouter().push({path: "/"});
  } catch (e: any) {
    console.log("LoginForm -> doSendForm -> catch", e.message);
  } finally {
    resetValidationLoginForm();
    setTimeout(() => {isLoading.value = false;}, 1500)
  }
};

// @ts-ignore
onUnmounted(() => resetValidationLoginForm());
</script>

<style lang="scss" scoped>
.login-form {
  display: flex;
  justify-content: center;
  flex-direction: column;

  &__title {
    text-align: center;
  }

  &__field {
    margin-bottom: 20px;
  }

  &__submit {
    margin: auto;
  }

  &__forgot-link {
    margin-top: 10px;
    text-align: center;
  }
}
</style>
