<template>
  <div class="login-form">
    <UiTextH3 class="login-form__title">Login</UiTextH3>

    <UiFormControl
      class="login-form__field"
      label="Email"
      :errors="validatorLoginForm.errorsFormData.email.errors"
    >
      <UiInput
        type="text"
        placeholder="example@test.com"
        :value="props.formData.email"
        :isDirty="validatorLoginForm.errorsFormData.email.isDirty"
        :isInvalid="validatorLoginForm.errorsFormData.email.errors.length > 0"
        @input="
          validatorLoginForm.doValidateField('email', $event.target.value)
        "
        @blur="validatorLoginForm.doValidateField('email', $event.target.value)"
      />
    </UiFormControl>

    <UiFormControl
      class="login-form__field"
      label="Password"
      :errors="validatorLoginForm.errorsFormData.password.errors"
    >
      <UiInput
        type="password"
        placeholder="********"
        :value="props.formData.password"
        :isDirty="validatorLoginForm.errorsFormData.password.isDirty"
        :isInvalid="
          validatorLoginForm.errorsFormData.password.errors.length > 0
        "
        @input="
          validatorLoginForm.doValidateField('password', $event.target.value)
        "
        @blur="
          validatorLoginForm.doValidateField('password', $event.target.value)
        "
      />
    </UiFormControl>

    <UiButtonDefault
      type="submit"
      state="primary"
      class="login-form__btn"
      :isLoading="isLoading"
      @click="validateLoginForm(doSendForm)"
    >
      Login
    </UiButtonDefault>

    <div class="login-form__links">
      <div class="login-form__link">
        <NuxtLink to="/auth/registration">Sign Up</NuxtLink>
      </div>
      <div class="login-form__link">
        <NuxtLink to="/auth/forgot">Forgot password</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { navigateTo } from "nuxt/app";
import { useAuthStore } from "~/stores/authStore";
import { useAppCore } from "~/composables/useAppCore";

import UiInput from "~/components/ui/UiInput.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

import { useToast } from "vue-toastification";

import {
  validatorLoginForm,
  validateLoginForm,
  resetValidationLoginForm,
} from "@/pages/auth/login/composables/validation";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const isLoading = ref(false);
const appCore = useAppCore();
const toast = useToast();

const doSendForm = async () => {
  try {
    isLoading.value = true;
    const authStore = useAuthStore();

    const response = await appCore.auth.doLogin(props.formData);

    const accessToken = response.data.data.access_token;
    const refreshToken = response.data.data.refresh_token;

    localStorage.setItem("user_access_token", accessToken);
    localStorage.setItem("user_refresh_token", refreshToken);

    authStore.setAccessToken(accessToken);
    authStore.setRefreshToken(refreshToken);

    navigateTo("/dashboard");
    console.log("DO REDIRECT TO DASHBOARD");
  } catch (e: any) {
    console.log("LoginForm -> doSendForm -> catch", e.message);
    toast.error("Invalid credentials");
  } finally {
    resetValidationLoginForm();
    setTimeout(() => {
      isLoading.value = false;
    }, 1500);
  }
};

// @ts-ignore
onUnmounted(() => resetValidationLoginForm());
</script>

<style lang="scss" scoped>
.login-form {
  color: var(--ui-text-main);
  display: flex;
  justify-content: center;
  flex-direction: column;

  &__link {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__links {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  &__title {
    text-align: center;
    margin-bottom: 30px;
  }

  &__field {
    margin-bottom: 20px;
  }

  &__btn {
    margin-top: 30px;
    margin-bottom: 40px;
  }
}
</style>
