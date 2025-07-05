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

    <UiFormControl
        class="login-form__field"
        label="2Fa code"
        :errors="twoFaErrors"
        v-if="twoFaEnabled"
    >
      <UiInput
          type="text"
          placeholder="********"
          :value="props.formData.twoFaCode"
          :isDirty="twoFaErrors.length > 0"
          :isInvalid="twoFaErrors.length > 0"
          @input="handleTwoFaCodeInput"
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

    <div class="login-form__social-links">
      <GoogleLogin/>
      <FacebookLogin/>
      <LinkedInLogin/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FacebookLogin from "./FacebookLogin.vue";
import GoogleLogin from "./GoogleLogin.vue";
import LinkedInLogin from "./LinkedInLogin.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

import {navigateTo} from "nuxt/app";
import {reactive, ref} from "vue";
import {useAppCore} from "~/composables/useAppCore";
import {useAuthStore} from "~/stores/authStore";
import {useToast} from "vue-toastification";

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

const isRecaptchaValid = ref(false)
const isLoading = ref(false);
const twoFaEnabled = ref(false);
const appCore = useAppCore();
const toast = useToast();
const emit = defineEmits(['input2Fa'])

let twoFaErrors = reactive([])

const handleTwoFaCodeInput = (value: string) => {
  emit('input2Fa', value);
}

const doSendForm = async () => {
  try {
    isLoading.value = true;
    const authStore = useAuthStore();
    const response = await appCore.auth.doLogin(props.formData);
    const accessToken = response.data.access_token;
    authStore.setAccessToken(accessToken);
    toast.success("Successfully!");
    navigateTo("/dashboard");
  } catch (e: any) {
    if (e.status === 401) {
      if (e.response.data?.data?.two_fa_is_required) {
        if (!twoFaEnabled.value) {
          toast.info(e.response.data.message)
          twoFaEnabled.value = true;
        } else {
          twoFaErrors = [e.response.data.message]
        }
      } else {
        toast.error("Invalid credentials");
      }
    } else {
      toast.error("Invalid credentials");
    }
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

    a {
      color: var(--ui-text-main);

      &:hover {
        color: var(--ui-text-secondary);
      }
    }

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

  &__social-links {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  &__social-link {
    display: flex;
    place-content: center;
    padding: 3px;
    background: white;

    border-radius: 100%;
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
