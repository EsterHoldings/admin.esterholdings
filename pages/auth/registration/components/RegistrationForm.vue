<template>
  <div class="registration-form">
    <UiTextH3 class="registration-form__title">Registration</UiTextH3>

    <UiFormControl
        class="registration-form__field"
        label="Email"
        :errors="validatorRegistrationForm?.errorsFormData?.email?.errors"
    >
      <UiInput
          type="text"
          placeholder="example@test.com"
          :value="props.formData.email"
          @input="
          validatorRegistrationForm?.doValidateField(
            'email',
            $event.target.value
          )
        "
          @blur="
          validatorRegistrationForm?.doValidateField(
            'email',
            $event.target.value
          )
        "
          :isDirty="validatorRegistrationForm?.errorsFormData?.email?.isDirty"
          :isInvalid="
          validatorRegistrationForm?.errorsFormData?.email?.errors?.length > 0
        "
      />
    </UiFormControl>

    <UiFormControl
        class="registration-form__field"
        label="Password"
        :errors="validatorRegistrationForm?.errorsFormData?.password.errors"
    >
      <UiInput
          type="password"
          placeholder="********"
          @input="
          validatorRegistrationForm?.doValidateField(
            'password',
            $event.target.value
          )
        "
          @blur="
          validatorRegistrationForm?.doValidateField(
            'password',
            $event.target.value
          )
        "
          :value="props.formData.password"
          :isDirty="validatorRegistrationForm?.errorsFormData?.password?.isDirty"
          :isInvalid="
          validatorRegistrationForm?.errorsFormData?.password?.errors?.length >
          0
        "
      />
    </UiFormControl>

    <UiFormControl
        class="registration-form__field"
        label="Confirm password"
        :errors="
        validatorRegistrationForm?.errorsFormData?.confirmPassword.errors
      "
    >
      <UiInput
          type="password"
          placeholder="********"
          @input="
          validatorRegistrationForm?.doValidateField(
            'confirmPassword',
            $event.target.value
          )
        "
          @blur="
          validatorRegistrationForm?.doValidateField(
            'confirmPassword',
            $event.target.value
          )
        "
          :value="props.formData.confirmPassword"
          :isDirty="
          validatorRegistrationForm?.errorsFormData?.confirmPassword?.isDirty
        "
          :isInvalid="
          validatorRegistrationForm?.errorsFormData?.confirmPassword?.errors
            ?.length > 0
        "
      />

    </UiFormControl>

    <div class="registration-form__checkbox">
      <UiInput
          class="input"
          type="checkbox"
          :checked="isAgreeTerms"
          @input="(e) => isAgreeTerms = e.target.checked"
      />
      <UiTextH6>
        I agree with the terms of the
        <nuxt-link to="/quoting-contract" target="_blank">offer</nuxt-link>
        and the
        <nuxt-link to="/quoting-regulations" target="_blank">quotation rules</nuxt-link>
      </UiTextH6>
    </div>

    <div class="registration-form__checkbox">
      <UiInput
          class="input"
          type="checkbox"
          :checked="isAgreePrivacy"
          @input="(e) => isAgreePrivacy = e.target.checked"
      />
      <UiTextH6>
        I agree to the
        <nuxt-link to="/data-protection-guidelines" target="_blank">processing of my personal data</nuxt-link>
        and warned about the
        <nuxt-link to="/risks-statement" target="_blank">risks</nuxt-link>
      </UiTextH6>
    </div>

    <UiButtonPrimary
        class="registration-form__btn"
        type="submit"
        @click="validateRegistrationForm(doSendForm)"
        :isLoading="isLoading"
        :disabled="!isFormAgreementValid || !isRecaptchaValid"
    >
      REGISTRATION
    </UiButtonPrimary>

    <div class="registration-form__links">
      <br/>
      <nuxt-link to="/auth/login">Login</nuxt-link>
    </div>

    <div class="registration-form__social-links">
      <GoogleLogin/>
      <FacebookLogin/>
      <LinkedInLogin/>
      <GoogleLogin />
      <FacebookLogin />

      <div class="registration-form__social-link">
        <UiIconGoogle @click="loginWithGoogle" />
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import {ref, onUnmounted, computed, onMounted} from "vue";
import {useRouter} from "vue-router";
import {
  validateRegistrationForm,
  validatorRegistrationForm,
  resetValidationRegistrationForm,
} from "../composables/validation";
import {useToast} from "vue-toastification";
import {navigateTo} from "nuxt/app";
import {validatorLoginForm} from "~/pages/auth/login/composables/validation";

import {useAppCore} from "~/composables/useAppCore";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiButtonPrimary from "~/components/ui/UiButtonPrimary.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiIconGoogle from "~/components/ui/UiIconGoogleOauth.vue";

import GoogleLogin from "./GoogleLogin.vue";
import FacebookLogin from "./FacebookLogin.vue";
import LinkedInLogin from "./LinkedInLogin.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";

// import { serverSideErrorsHandler } from "@/utils/validation/server-side-errors-handler.helper";

const props = defineProps({formData: {type: Object, required: true}});

const {$recaptcha} = useNuxtApp()
const isRecaptchaValid = ref(false)
const isLoading = ref(false);
const isAgreeTerms = ref(false);
const isAgreePrivacy = ref(false);
const appCore = useAppCore();
const toast = useToast();

const isFormAgreementValid = computed(() => {
  return isAgreeTerms.value && isAgreePrivacy.value;
});


const doSendForm = async (): Promise<void> => {
  isLoading.value = true;

  try {
    await appCore.auth.doRegistration({
      email: props.formData.email,
      password: props.formData.password,
      password_confirmation: props.formData.confirmPassword,
    });
    toast.success("Successfully registration!");
    navigateTo("/auth/login")
  } catch (e: any) {
    const serverValidationErrors = e?.response?.data?.description;
    console.log("CATCH: ", serverValidationErrors);
  } finally {
    resetValidationRegistrationForm();
    isLoading.value = false;
  }
};


onMounted(async () => {
  isRecaptchaValid.value = await $recaptcha('registration')
})
onUnmounted(() => resetValidationRegistrationForm());
</script>

<style lang="scss" scoped>
.registration-form {
  color: #c4c4c4;
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

    a {
      color: var(--ui-text-main);

      &:hover {
        color: var(--ui-text-secondary);
      }
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

  &__checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    .input {
      width: 15px;
    }

    h6 {
      color: var(--ui-text-main);

      a {
        color: var(--color-ui-accent);
      }
    }
  }

  &__btn {
    margin-top: 20px;
    margin-bottom: 10px;
  }
}
</style>
