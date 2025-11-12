<template>
  <div class="tab-deposit__wrapper">
    <UiTextH5 class="tab-deposit__title">USDT ERC-20</UiTextH5>
    <div class="tab-deposit__form">
      <UiFormControl
          class="tab-deposit__form_field"
          label="Сумма"
          :errors="validatorUsdtErcDataForm?.errorsFormData?.amount?.errors"
      >
        <UiInput
            type="text"
            placeholder="Сумма USD"
            @input="validatorUsdtErcDataForm?.doValidateField('amount', $event.target.value)"
            @blur="validatorUsdtErcDataForm?.doValidateField('amount', $event.target.value)"
            :value="formData.amount"
            :isDirty="validatorUsdtErcDataForm?.errorsFormData?.amount?.isDirty"
            :isInvalid="validatorUsdtErcDataForm?.errorsFormData?.amount?.errors?.length > 0"
        />
      </UiFormControl>

      <UiFormControl
          class="tab-deposit__form_field"
          label="Комментарий"
          :errors="validatorUsdtErcDataForm?.errorsFormData?.comment?.errors"
      >
        <UiTextarea
            type="text"
            placeholder="Ваш коментарий"
            @input="validatorUsdtErcDataForm?.doValidateField('comment', $event.target.value)"
            @blur="validatorUsdtErcDataForm?.doValidateField('comment', $event.target.value)"
            :value="formData.comment"
            :isDirty="validatorUsdtErcDataForm?.errorsFormData?.comment?.isDirty"
            :isInvalid="validatorUsdtErcDataForm?.errorsFormData?.comment?.errors?.length > 0"
        />
      </UiFormControl>

      <UiButtonDefault state="info--outline" @click="validateUsdtErcDataForm(handleSubmit)">Создать депозит
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {formData} from "~/pages/payments/create/composables/TabDepositFormUsdtErc20";
import {
  resetFormData,
  resetValidationUsdtErcDataForm,
  validateUsdtErcDataForm,
  validatorUsdtErcDataForm
} from "~/pages/payments/create/composables/TabDepositFormUsdtErc20/validation";

import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import {onMounted} from "vue";

const handleSubmit = () => {
  console.log('USDT ERC-20');
}

onMounted(() => {
  resetFormData();
  resetValidationUsdtErcDataForm();
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