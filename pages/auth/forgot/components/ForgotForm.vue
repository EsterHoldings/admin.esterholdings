<template>
  <div class="forgot-form">
    <UiTextH3 class="forgot-form__title">Forgot password</UiTextH3>

    <UiFormControl
      class="forgot-form__field"
      label="Email"
      :errors="validatorForgotForm?.errorsFormData?.email?.errors"
    >
      <UiInput
        type="text"
        label="Email"
        placeholder="example@test.com"
        @input="validatorForgotForm?.doValidateField('email', $event.target.value)"
        @blur="validatorForgotForm?.doValidateField('email', $event.target.value)"
        :value="props.formData.email"
        :isDirty="validatorForgotForm?.errorsFormData?.email?.isDirty"
        :isInvalid="validatorForgotForm?.errorsFormData?.email?.errors?.length > 0"
      />
    </UiFormControl>

    <UiButtonPrimary
      class="forgot-form__btn"
      type="submit"
      @click="validateForgotForm(doSendForm)"
      :isLoading="isLoading"
      >Send reset link
    </UiButtonPrimary>

    <div class="forgot-form__links">
      <div class="forgot-form__link">
        <NuxtLink to="/auth/login">Sign In</NuxtLink>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import UiButtonPrimary from "~/components/ui/UiButtonPrimary.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

import {ref} from "vue";

import {
  validatorForgotForm,
  validateForgotForm,
  resetValidationForgotForm,
} from "../composables/validation";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const isLoading = ref(false);

const doSendForm = () => {
  try {
    isLoading.value = true;
  } catch (e: any) {
    console.log("ForgotForm -> doSendForm -> catch");
  } finally {
    setTimeout(() => {
      resetValidationForgotForm();
      isLoading.value = false;
    }, 1000);
  }
};

// @ts-ignore
onUnmounted(() => resetValidationForgotForm());
</script>

<style lang="scss" scoped>
.forgot-form {
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
