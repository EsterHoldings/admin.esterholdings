<!--<template>-->
<!--  <div class="tab-deposit__wrapper">-->
<!--    <UiTextH5 class="tab-deposit__title">USDT TRC-20</UiTextH5>-->

<!--    <div class="tab-deposit__form">-->
<!--      <UiFormControl-->
<!--          class="tab-deposit__form_field"-->
<!--          label="Номер счета (аккаунт)"-->
<!--          :errors="validatorUsdtTrcDataForm?.errorsFormData?.accountId?.errors"-->
<!--      >-->
<!--        <UiSelect-->
<!--            :data="accounts"-->
<!--            :isDirty="validatorUsdtTrcDataForm.errorsFormData?.accountId?.isDirty"-->
<!--            :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.accountId?.errors?.length > 0"-->
<!--            @change="handleChangeAccount"-->
<!--            @loadMore="handleLoadMoreAccounts"-->
<!--        />-->
<!--      </UiFormControl>-->

<!--      <pre>{{accounts}}</pre>-->

<!--      <UiFormControl-->
<!--          class="tab-deposit__form_field"-->
<!--          label="Сумма"-->
<!--          :errors="validatorUsdtTrcDataForm?.errorsFormData?.amount?.errors"-->
<!--      >-->
<!--        <UiInput-->
<!--            type="number"-->
<!--            placeholder="Сумма USD"-->
<!--            @input="validatorUsdtTrcDataForm.doValidateField('amount', $event.target.value)"-->
<!--            @blur="validatorUsdtTrcDataForm.doValidateField('amount', $event.target.value)"-->
<!--            :value="formData.amount"-->
<!--            :isDirty="validatorUsdtTrcDataForm.errorsFormData?.amount?.isDirty"-->
<!--            :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.amount?.errors?.length > 0"-->
<!--        />-->
<!--      </UiFormControl>-->

<!--      <UiFormControl-->
<!--          class="tab-deposit__form_field"-->
<!--          label="Комментарий"-->
<!--          :errors="validatorUsdtTrcDataForm.errorsFormData?.comment?.errors"-->
<!--      >-->
<!--        <UiTextarea-->
<!--            type="text"-->
<!--            placeholder="Ваш коментарий"-->
<!--            @input="validatorUsdtTrcDataForm.doValidateField('comment', $event.target.value)"-->
<!--            @blur="validatorUsdtTrcDataForm.doValidateField('comment', $event.target.value)"-->
<!--            :value="formData.comment"-->
<!--            :isDirty="validatorUsdtTrcDataForm.errorsFormData?.comment?.isDirty"-->
<!--            :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.comment?.errors?.length > 0"-->
<!--        />-->
<!--      </UiFormControl>-->

<!--      <UiButtonDefault-->
<!--          state="info&#45;&#45;outline"-->
<!--          @click="validateUsdtTrcDataForm(handleSubmit)"-->
<!--      >-->
<!--        Создать депозит-->
<!--      </UiButtonDefault>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import useAppCore from "~/composables/useAppCore";-->
<!--import {formData} from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20";-->
<!--import {onMounted, ref} from "vue";-->
<!--import {resetFormData, resetValidationUsdtTrcDataForm, validateUsdtTrcDataForm, validatorUsdtTrcDataForm} from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20/validation";-->

<!--import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";-->
<!--import UiFormControl from "~/components/ui/UiFormControl.vue";-->
<!--import UiInput from "~/components/ui/UiInput.vue";-->
<!--import UiSelect from "~/components/ui/UiSelect.vue";-->
<!--import UiTextH5 from "~/components/ui/UiTextH5.vue";-->
<!--import UiTextarea from "~/components/ui/UiTextarea.vue";-->
<!--import {useToast} from "vue-toastification";-->
<!--import {navigateTo} from "nuxt/app";-->

<!--interface ResponseDTO {-->
<!--  success: Boolean;-->
<!--  data: any;-->
<!--  errors: any;-->
<!--}-->

<!--const props = defineProps({-->
<!--  paymentSystem: {-->
<!--    type: Object,-->
<!--    required: true-->
<!--  }-->
<!--})-->

<!--const toast = useToast();-->
<!--const appCore = useAppCore()-->
<!--const accounts = [];-->

<!--const handleSubmit = async () => {-->
<!--  try {-->
<!--    formData.paymentSystemId = props.paymentSystem.id;-->
<!--    const response:any = await appCore.deposit.post(formData);-->
<!--    const redirectUrl = response.data.data.redirectUrl;-->
<!--    window.open(redirectUrl, '_blank', 'noopener');-->
<!--    navigateTo("/payments");-->
<!--  } catch (e) {-->
<!--    toast.error('Oops =( We have some problems.')-->
<!--  }-->
<!--}-->

<!--const handleChangeAccount = (value: any) => {-->
<!--  formData.accountId = value;-->

<!--  validatorUsdtTrcDataForm.errorsFormData.accountId.isDirty = true;-->
<!--  validatorUsdtTrcDataForm.doValidateField('accountId', value)-->
<!--}-->

<!--const handleLoadMoreAccounts = async () => {-->
<!--  console.log("Load More Accounts");-->
<!--  loadAccountsPage.value = loadAccountsPage.value + 1;-->
<!--  await loadAccounts();-->
<!--}-->

<!--const loadAccountsPage = ref(1);-->
<!--const loadAccountsPerPage = ref(10);-->
<!--const loadAccounts = async () => {-->
<!--  const response = await appCore.accounts.get({-->
<!--    perPage: loadAccountsPerPage.value,-->
<!--    page: loadAccountsPage.value,-->
<!--  })-->

<!--  const accountsList = response.data.data.data-->

<!--  accounts.push(-->
<!--      ...accountsList.map(account => ({-->
<!--        id: account.id,-->
<!--        value: account.id,-->
<!--        text: `-->
<!--        <div style="display:flex; justify-content: space-between; width: 100%;">-->
<!--          <strong class="w-[33%] flex justify-start">${account.account_type.name}</strong>-->
<!--          <span class="w-[33%] flex justify-center">${account.number}</span>-->
<!--          <span class="w-[33%] flex justify-end">$ ${account.balance}</span>-->
<!--        </div>-->
<!--      `,-->
<!--      }))-->
<!--  )-->
<!--}-->

<!--onMounted(() => {-->
<!--  resetFormData();-->
<!--  resetValidationUsdtTrcDataForm();-->
<!--  loadAccounts();-->
<!--})-->
<!--</script>-->

<!--<style lang="scss" scoped>-->
<!--.tab-deposit {-->
<!--  &__wrapper {-->

<!--  }-->

<!--  &__title {-->
<!--    margin-bottom: 20px;-->
<!--  }-->

<!--  &__form {-->
<!--    &_field {-->
<!--      margin-bottom: 10px;-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->


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
            @loadMore="handleLoadMoreAccounts"
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

      <UiButtonDefault state="info--outline" @click="validateUsdtTrcDataForm(handleSubmit)">
        Создать депозит
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useAppCore from "~/composables/useAppCore";
import { formData } from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20";
import { onMounted, ref } from "vue";
import {
  resetFormData,
  resetValidationUsdtTrcDataForm,
  validateUsdtTrcDataForm,
  validatorUsdtTrcDataForm
} from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20/validation";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import { useToast } from "vue-toastification";
import { navigateTo } from "nuxt/app";

const props = defineProps({
  paymentSystem: {
    type: Object,
    required: true
  }
});

const toast = useToast();
const appCore = useAppCore();

const accounts = ref<any[]>([]);
const loadAccountsPage = ref(1);
const loadAccountsPerPage = ref(10);
const isLoadingAccounts = ref(false);
const hasMoreAccounts = ref(true);

const handleSubmit = async () => {
  try {
    formData.paymentSystemId = props.paymentSystem.id;
    const response: any = await appCore.deposit.post(formData);
    const redirectUrl = response.data.data.redirectUrl;
    window.open(redirectUrl, "_blank", "noopener");
    navigateTo("/payments");
  } catch (e) {
    toast.error("Oops =( We have some problems.");
  }
};

const handleChangeAccount = (value: any) => {
  formData.accountId = value;
  validatorUsdtTrcDataForm.errorsFormData.accountId.isDirty = true;
  validatorUsdtTrcDataForm.doValidateField("accountId", value);
};

const normalizeAccounts = (list: any[]) =>
    list.map((account) => ({
      id: account.id,
      value: account.id,
      text: `
      <div style="display:flex; justify-content: space-between; width: 100%;">
        <strong class="w-[33%] flex items-center justify-start text-[15px]">${account.number}</strong>
        <span class="w-[33%] flex items-center justify-center">${account.account_type.name}</span>
        <span class="w-[33%] flex items-center justify-end">$ ${account.balance}</span>
      </div>
    `
    }));

const extractList = (response: any): any[] => {
  const root = response?.data;
  const d1 = root?.data;

  if (Array.isArray(d1?.data)) return d1.data;
  if (Array.isArray(d1?.data?.data)) return d1.data.data;
  if (Array.isArray(d1?.data?.data?.data)) return d1.data.data.data;

  if (Array.isArray(d1)) return d1;
  if (Array.isArray(root)) return root;

  return [];
};

const appendUnique = (items: any[]) => {
  const existing = new Set(accounts.value.map((x) => x.value));
  for (const item of items) {
    if (!existing.has(item.value)) accounts.value.push(item);
  }
};

const loadAccounts = async (page: number) => {
  if (isLoadingAccounts.value || !hasMoreAccounts.value) return;

  isLoadingAccounts.value = true;

  try {
    const response: any = await appCore.accounts.get({
      perPage: loadAccountsPerPage.value,
      page
    });

    const list = extractList(response);
    if (!list.length) {
      hasMoreAccounts.value = false;
      loadAccountsPage.value = Math.max(1, page - 1);
      return;
    }

    const next = normalizeAccounts(list);
    appendUnique(next);
    hasMoreAccounts.value = true;
  } catch (e) {
    loadAccountsPage.value = Math.max(1, page - 1);
  } finally {
    isLoadingAccounts.value = false;
  }
};

const handleLoadMoreAccounts = async () => {
  if (isLoadingAccounts.value || !hasMoreAccounts.value) return;
  const nextPage = loadAccountsPage.value + 1;
  loadAccountsPage.value = nextPage;
  await loadAccounts(nextPage);
};

onMounted(async () => {
  resetFormData();
  resetValidationUsdtTrcDataForm();
  accounts.value = [];
  loadAccountsPage.value = 1;
  hasMoreAccounts.value = true;
  await loadAccounts(1);
});
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
