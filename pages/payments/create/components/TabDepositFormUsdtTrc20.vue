<template>
  <div class="relative">
    <!-- Overlay while submitting -->
    <div
        v-if="isLoadingSubmitBtn"
        class="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-[2px]"
        aria-live="polite"
        aria-busy="true"
    >
      <div class="flex flex-col items-center gap-3 px-6 py-5 text-center">
        <UiIconSpinnerDefault />
        <div class="text-[15px] font-semibold text-white/90">
          Processing...
        </div>
      </div>
    </div>

    <UiTextH5 class="mb-5 text-[var(--ui-text-main)]">
      USDT TRC-20
    </UiTextH5>

    <div class="flex flex-col gap-3">
      <UiFormControl
          label="Номер счета (аккаунт)"
          :errors="validatorUsdtTrcDataForm?.errorsFormData?.accountId?.errors"
      >
        <UiSelect
            :without-no-select="true"
            :data="accounts"
            :isDirty="validatorUsdtTrcDataForm.errorsFormData?.accountId?.isDirty"
            :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.accountId?.errors?.length > 0"
            @change="handleChangeAccount"
            @loadMore="handleLoadMoreAccounts"
        />
      </UiFormControl>

      <UiFormControl
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
          class="mt-1 inline-flex items-center justify-center gap-2"
          :disabled="isLoadingSubmitBtn"
          @click="validateUsdtTrcDataForm(handleSubmit)"
      >
        <span>Создать депозит</span>
        <UiIconSpinnerDefault v-if="isLoadingSubmitBtn" />
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useAppCore from "~/composables/useAppCore";
import { formData } from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20";
import { inject, onMounted, ref } from "vue";
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
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

import { useToast } from "vue-toastification";
import { navigateTo } from "nuxt/app";
import useEventBus from "~/composables/useEventBus";

const props = defineProps({
  paymentSystem: { type: Object, required: true }
});

const modalControl = inject<any>("modalControl", null);
const closeModal = () => modalControl?.closeModal?.();

const toast = useToast();
const appCore = useAppCore();

const accounts = ref<any[]>([]);
const loadAccountsPage = ref(1);
const loadAccountsPerPage = ref(10);

const isLoadingSubmitBtn = ref(false);
const isLoadingAccounts = ref(false);
const hasMoreAccounts = ref(true);

const handleSubmit = async () => {
  try {
    isLoadingSubmitBtn.value = true;

    formData.paymentSystemId = props.paymentSystem.id;

    const response: any = await appCore.deposit.post(formData);
    const redirectUrl = response.data.data.redirectUrl;

    navigateTo("/payments");
    closeModal();
    useEventBus.emit("loadDataForPayments");
    window.open(redirectUrl, "_blank", "noopener");
  } catch (e) {
    toast.error("Oops =( We have some problems.");
    closeModal();
  } finally {
    isLoadingSubmitBtn.value = false;
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

    appendUnique(normalizeAccounts(list));
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
