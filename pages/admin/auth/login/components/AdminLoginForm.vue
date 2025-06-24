<template>
  <div class="admin-login-form">
    <UiTextH3 class="admin-login-form__title">Login</UiTextH3>

    <UiFormControl
      class="admin-login-form__field"
      label="Email"
      :errors="validatorAdminLoginForm?.errorsFormData?.email?.errors"
    >
      <UiInput
        type="text"
        placeholder="example@test.com"
        @input="
          validatorAdminLoginForm?.doValidateField('email', $event.target.value)
        "
        @blur="
          validatorAdminLoginForm?.doValidateField('email', $event.target.value)
        "
        :value="props.formData?.email"
        :isDirty="validatorAdminLoginForm?.errorsFormData?.email?.isDirty"
        :isInvalid="
          validatorAdminLoginForm?.errorsFormData?.email?.errors?.length > 0
        "
      />
    </UiFormControl>

    <UiFormControl
      class="admin-login-form__field"
      label="Password"
      :errors="validatorAdminLoginForm?.errorsFormData?.password?.errors"
    >
      <UiInput
        type="password"
        placeholder="********"
        @input="
          validatorAdminLoginForm?.doValidateField(
            'password',
            $event.target.value
          )
        "
        @blur="
          validatorAdminLoginForm?.doValidateField(
            'password',
            $event.target.value
          )
        "
        :value="props.formData?.password"
        :isDirty="validatorAdminLoginForm?.errorsFormData?.password?.isDirty"
        :isInvalid="
          validatorAdminLoginForm?.errorsFormData?.password?.errors?.length > 0
        "
      />
    </UiFormControl>

    <UiButtonDefault
      type="submit"
      @click="validateLoginForm(doSendForm)"
      :isLoading="isLoading"
      state="primary"
      >Do login
    </UiButtonDefault>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useAppCore } from "~/composables/useAppCore";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { useRouter } from "vue-router";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";

import {
  validatorAdminLoginForm,
  validateLoginForm,
  resetValidationLoginForm,
} from "@/pages/admin/auth/login/composables/validation";
import { navigateTo } from "nuxt/app";

const props = defineProps({ formData: { type: Object, required: true } });

const isLoading = ref(false);
const appCore = useAppCore();

const doSendForm = async () => {
  try {
    isLoading.value = true;

    const adminAuthStore = useAdminAuthStore();

    const response = await appCore.adminAuth.doLogin(props.formData);

    const accessToken = response.data.data.access_token;

    localStorage.setItem("access_token", accessToken);

    adminAuthStore.setAccessToken(accessToken);

    await appCore.adminAuth.getAvailablePermissions();

    adminAuthStore.setRoles(response.data.data.roles);
    adminAuthStore.setPermissions(response.data.data.permissions);

    navigateTo("/admin/access");
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
.admin-login-form {
  color: var(--ui-text-main);
  display: flex;
  justify-content: center;
  flex-direction: column;

  width: 100%;
  max-width: 600px;

  &__title {
    text-align: center;
    margin-bottom: 30px;
  }

  &__field {
    margin-bottom: 20px;
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
}
</style>
