<template>
  <div class="tab-deposit__wrapper">
    <UiTextH5 class="tab-deposit__title">BTC</UiTextH5>
    <div class="tab-deposit__form">
      <UiFormControl
          class="tab-deposit__form_field"
          label="Сумма"
          :errors="validatorBTCDataForm?.errorsFormData?.amount?.errors"
      >
        <UiInput
            type="text"
            placeholder="Сумма USD"
            @input="validatorBTCDataForm?.doValidateField('amount', $event.target.value)"
            @blur="validatorBTCDataForm?.doValidateField('amount', $event.target.value)"
            :value="formData.amount"
            :isDirty="validatorBTCDataForm?.errorsFormData?.amount?.isDirty"
            :isInvalid="validatorBTCDataForm?.errorsFormData?.amount?.errors?.length > 0"
        />
      </UiFormControl>

      <UiFormControl
          class="tab-deposit__form_field"
          label="Комментарий"
          :errors="validatorBTCDataForm?.errorsFormData?.comment?.errors"
      >
        <UiTextarea
            type="text"
            placeholder="Ваш коментарий"
            @input="validatorBTCDataForm?.doValidateField('comment', $event.target.value)"
            @blur="validatorBTCDataForm?.doValidateField('comment', $event.target.value)"
            :value="formData.comment"
            :isDirty="validatorBTCDataForm?.errorsFormData?.comment?.isDirty"
            :isInvalid="validatorBTCDataForm?.errorsFormData?.comment?.errors?.length > 0"
        />
      </UiFormControl>

      <UiButtonDefault
          state="info--outline"
          @click="validateBTCDataForm(handleSubmit)"
      >
        Создать депозит
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted} from "vue";
import {formData} from "~/pages/payments/create/composables/TabDepositFormBTC";
import {
  resetFormData,
  resetValidationBTCDataForm,
  validateBTCDataForm,
  validatorBTCDataForm
} from "~/pages/payments/create/composables/TabDepositFormBTC/validation";

import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

const handleSubmit = () => {
  console.log('BTC');
}

onMounted(() => {
  resetFormData();
  resetValidationBTCDataForm();
})
</script>

<style lang="scss" scoped>
.tab-deposit {
  &__wrapper {

  }

  &__title {
    margin-bottom: 20px;
  }

  &__form {
    &_field {
      margin-bottom: 10px;
    }
  }
}
</style>