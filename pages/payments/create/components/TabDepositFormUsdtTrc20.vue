<template>
  <div class="tab-deposit__wrapper">
    <UiTextH5 class="tab-deposit__title">USDT TRC-20</UiTextH5>

    <div class="tab-deposit__form">
      <UiFormControl
          class="tab-deposit__form_field"
          label="Номер счета (аккаунт)"
          :errors="validatorUsdtTrcDataForm?.errorsFormData?.accountId?.errors"
      >
        <UiSelect
            :data="accounts"
            :isDirty="validatorUsdtTrcDataForm.errorsFormData?.accountId?.isDirty"
            :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.accountId?.errors?.length > 0"
            @change="handleChangeAccount"
        />
      </UiFormControl>

      <UiFormControl
          class="tab-deposit__form_field"
          label="Сумма"
          :errors="validatorUsdtTrcDataForm?.errorsFormData?.amount?.errors"
      >
        <UiInput
            type="number"
            placeholder="Сумма USD"
            @input="validatorUsdtTrcDataForm.doValidateField('amount', $event.target.value)"
            @blur="validatorUsdtTrcDataForm.doValidateField('amount', $event.target.value)"
            :value="formData.amount"
            :isDirty="validatorUsdtTrcDataForm.errorsFormData?.amount?.isDirty"
            :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.amount?.errors?.length > 0"
        />
      </UiFormControl>

      <UiFormControl
          class="tab-deposit__form_field"
          label="Комментарий"
          :errors="validatorUsdtTrcDataForm.errorsFormData?.comment?.errors"
      >
        <UiTextarea
            type="text"
            placeholder="Ваш коментарий"
            @input="validatorUsdtTrcDataForm.doValidateField('comment', $event.target.value)"
            @blur="validatorUsdtTrcDataForm.doValidateField('comment', $event.target.value)"
            :value="formData.comment"
            :isDirty="validatorUsdtTrcDataForm.errorsFormData?.comment?.isDirty"
            :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.comment?.errors?.length > 0"
        />
      </UiFormControl>

      <UiButtonDefault
          state="info--outline"
          @click="validateUsdtTrcDataForm(handleSubmit)"
      >
        Создать депозит
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useAppCore from "~/composables/useAppCore";
import {formData} from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20";
import {onMounted} from "vue";
import {resetFormData, resetValidationUsdtTrcDataForm, validateUsdtTrcDataForm, validatorUsdtTrcDataForm} from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20/validation";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import {useToast} from "vue-toastification";
import {navigateTo} from "nuxt/app";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

const props = defineProps({
  paymentSystem: {
    type: Object,
    required: true
  }
})

const toast = useToast();
const appCore = useAppCore()
const accounts = [
  {
    id: 'a8390ae2-cfa6-4356-80d1-26c2831046c1',
    value: 'a8390ae2-cfa6-4356-80d1-26c2831046c1',
    text: 'Demo (274174482)'
  },
  {
    id: 'a8390ae2-cfa6-4356-80d1-26c2831046c2',
    value: 'a8390ae2-cfa6-4356-80d1-26c2831046c2',
    text: 'ForexCrypto (274164738)'
  },
  {
    id: 'a8390ae2-cfa6-4356-80d1-26c2831046c3',
    value: 'a8390ae2-cfa6-4356-80d1-26c2831046c3',
    text: 'ForexCrypto (274192381)'
  },
];

const handleSubmit = async () => {
  try {
    formData.paymentSystemId = props.paymentSystem.id;
    const response:any = await appCore.deposit.get(formData);
    const redirectUrl = response.data.data.redirectUrl;
    window.open(redirectUrl, '_blank', 'noopener');
    navigateTo("/payments");
  } catch (e) {
    toast.error('Oops =( We have some problems.')
  }
}

const handleChangeAccount = (value: any) => {
  formData.accountId = value;

  validatorUsdtTrcDataForm.errorsFormData.accountId.isDirty = true;
  validatorUsdtTrcDataForm.doValidateField('accountId', value)
}

const loadAccounts = async () => {
  const response = await appCore.accounts.get();
  console.log('LOAD ACCOUNTS', response.data.data.data);

  const accountsList = response.data.data.data;

  accounts.splice(0, accounts.length, ...accountsList.map(account => ({
    id: account.id,
    value: account.id,
    text: `
        <div style="display:flex; justify-content: space-between; width: 100%;">
          <strong>${account.account_type.name}</strong>
          <span>${account.number}</span>
          <span>$ ${account.balance}</span>
        </div>
    `,
  })));
}

onMounted(() => {

  console.log('*** *** *** *** *** *** *** *** ***');
  console.log(props.paymentSystemsList);
  console.log('*** *** *** *** *** *** *** *** ***');

  resetFormData();
  resetValidationUsdtTrcDataForm();
  loadAccounts();
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