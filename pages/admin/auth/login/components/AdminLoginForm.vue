<template>
  <div class="admin-login-form">
    <UiFormControl
        class="admin-login-form__field"
        label="Email"
        :errors="validatorAdminLoginForm?.errorsFormData?.email?.errors"
    >
      <UiInput
          type="text"
          placeholder="example@test.com"
          @input="validatorAdminLoginForm?.doValidateField('email', $event.target.value)"
          @blur="validatorAdminLoginForm?.doValidateField('email', $event.target.value)"
          :value="props.formData?.email"
          :isDirty="validatorAdminLoginForm?.errorsFormData?.email?.isDirty"
          :isInvalid="validatorAdminLoginForm?.errorsFormData?.email?.errors?.length > 0"
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
          @input="validatorAdminLoginForm?.doValidateField('password', $event.target.value)"
          @blur="validatorAdminLoginForm?.doValidateField('password', $event.target.value)"
          :value="props.formData?.password"
          :isDirty="validatorAdminLoginForm?.errorsFormData?.password?.isDirty"
          :isInvalid="validatorAdminLoginForm?.errorsFormData?.password?.errors?.length > 0"
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

    <div class="admin-login-form__submit-wrapper">
      <UiButtonDefault
          type="submit"
          @click="validateLoginForm(doSendForm)"
          :isLoading="isLoading"
          state="primary"
      >Do login
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {navigateTo} from "nuxt/app";
import {reactive, ref} from "vue";
import {useAdminAuthStore} from "~/stores/adminAuthStore";
import {useAppCore} from "~/composables/useAppCore";
import {useToast} from "vue-toastification";
import {
  resetValidationLoginForm,
  validateLoginForm,
  validatorAdminLoginForm,
} from "@/pages/admin/auth/login/composables/validation";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";

const props = defineProps({formData: {type: Object, required: true}});

const appCore = useAppCore();
const emit = defineEmits(['input2Fa'])
const isLoading = ref(false);
const toast = useToast();
const twoFaEnabled = ref(false);
const twoFaErrors = ref<string[]>([])

const handleTwoFaCodeInput = (value: string) => emit('input2Fa', value);

const doSendForm = async () => {
  try {
    isLoading.value = true;
    const adminAuthStore = useAdminAuthStore();

    const response = await appCore.adminModules.auth.doLogin(props.formData);

    const accessToken = response.data.access_token;
    adminAuthStore.setAccessToken(accessToken);

    // await appCore.adminModules.auth.getAvailablePermissions();
    // adminAuthStore.setRoles(response.data.roles);
    // adminAuthStore.setPermissions(response.data.permissions);

    navigateTo("/admin/access");
  } catch (e: any) {
    const responseData = e.response?.data;
    const twoFaRequired =
      responseData?.data?.two_fa_is_required ||
      responseData?.errors?.twoFaCode?.length > 0 ||
      String(responseData?.message ?? "").toLowerCase().includes("two fa");
    if (twoFaRequired) {
      if (!twoFaEnabled.value) {
        toast.info(responseData?.message ?? "")
        twoFaEnabled.value = true;
      }
      twoFaErrors.value = responseData?.errors?.twoFaCode ?? [responseData?.message ?? ""].filter(Boolean);
    } else if (e.status === 401) {
      toast.error("Invalid credentials");
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
.admin-login-form {
  color: var(--ui-text-main);
  display: flex;
  justify-content: center;
  flex-direction: column;

  width: 100%;
  max-width: 600px;

  &__submit-wrapper {
    margin-top: 40px;
    width: 100%;

    button {
      width: 100%;
    }
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
