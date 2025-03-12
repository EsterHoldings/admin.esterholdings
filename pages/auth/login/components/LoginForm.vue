<template>
  <div class="login-form">
    <UiTextH3 class="login-form__title">Login</UiTextH3>

    <UiFormControl
        class="login-form__field"
        label="Email"
        :errors="validatorLoginForm?.errorsFormData?.email?.errors"
    >
      <UiInput
          type="text"
          placeholder="example@test.com"
          @input="
          validatorLoginForm?.doValidateField('email', $event.target.value)
        "
          @blur="
          validatorLoginForm?.doValidateField('email', $event.target.value)
        "
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
        class="login-form__btn"
        type="submit"
        @click="validateLoginForm(doSendForm)"
        :isLoading="isLoading"
        state="primary"
    >LOGIN
    </UiButtonDefault>

    <div class="login-form__oauth-buttons">
      <UiButtonDefault
          state="info"
          class="oauth-button oauth-button_google"
          data-tooltip="Sign in with Google"
      >
        <UiIconGoogle/>
      </UiButtonDefault>

      <UiButtonDefault
          state="dark"
          class="oauth-button oauth-button_apple"
          data-tooltip="Sign in with Apple"
      >
        <UiIconApple/>
      </UiButtonDefault>

      <UiButtonDefault
          state="secondary"
          class="oauth-button oauth-button_developer"
          data-tooltip=" Sign in as a developer"
      >
        <UiIconDeveloper/>
      </UiButtonDefault>
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
import UiIconGoogle from "~/components/ui/UiIconGoogle.vue";
import UiIconApple from "~/components/ui/UiIconApple.vue";
import UiIconDeveloper from "~/components/ui/UiIconDeveloper.vue";

import {useAppCore} from "~/composables/useAppCore";
import {
  validatorLoginForm,
  validateLoginForm,
  resetValidationLoginForm,
} from "@/pages/auth/login/composables/validation";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

const props = defineProps({formData: {type: Object, required: true}});

const isLoading = ref(false);
const appCore = useAppCore();

const doSendForm = async () => {
  try {
    isLoading.value = true;
    const response = await appCore.auth.doLogin(props.formData);
    console.log('ADMIN LOGIN RESPONSE: ', response);
    await useRouter().push({path: "/"});
  } catch (e: any) {
    console.log("LoginForm -> doSendForm -> catch", e.message);
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
  display: flex;
  justify-content: center;
  flex-direction: column;
  //height: calc(100vh - 295px);
  color: #c4c4c4;
  background-color: red;

  &__title {
    text-align: center;
    //margin-top: 100px;
  }

  &__field {
    margin-bottom: 20px;
  }

  &__btn {
    margin-top: 30px;
    margin-bottom: 40px;
  }

  &__submit {
    margin: auto;
  }

  &__oauth-buttons {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  &__forgot-link {
    margin-top: 10px;
    text-align: center;
  }
}

.oauth-button {
  padding: 0 18px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    top: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s;
  }

  &:hover::after {
    opacity: 1;
    visibility: visible;
  }

  &_apple {
    background: black !important;

    svg {
      filter: invert(1);
    }
  }

  &_google {
    background: rgb(66, 133, 244);
  }
}
</style>
