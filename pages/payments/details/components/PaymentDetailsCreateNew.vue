<template>
  <div class="accounts__edit">
    <div
      v-if="props.title"
      class="accounts__edit__top">
      <UiTextH4>{{ props.title }}</UiTextH4>
    </div>

    <div
      class="accounts__edit__content"
      :class="{ 'without-top': !props.title }">
      <div class="accounts__edit__content__fields">
        <UiFormControl
          :label="t('cabinet.payments.details.createNew.name')"
          :errors="validatorPaymentDetailForm?.errorsFormData?.name?.errors">
          <UiInput
            :placeholder="t('cabinet.payments.details.createNew.namePlaceholder')"
            :value="formData.name"
            :isDirty="validatorPaymentDetailForm?.errorsFormData?.name?.isDirty"
            :isInvalid="validatorPaymentDetailForm?.errorsFormData?.name?.errors?.length > 0"
            @blur="validatorPaymentDetailForm?.doValidateField('name', $event.target.value)"
            @input="validatorPaymentDetailForm?.doValidateField('name', $event.target.value)" />
        </UiFormControl>

        <UiFormControl
          :label="t('cabinet.accounts.accounts-form.fields.accountType')"
          :errors="validatorPaymentDetailForm?.errorsFormData?.paymentSystemId?.errors">
          <UiSelect
            :without-no-select="true"
            :data="paymentTypes"
            :value="formData.paymentSystemId"
            :isDirty="validatorPaymentDetailForm?.errorsFormData?.paymentSystemId?.isDirty"
            :isInvalid="validatorPaymentDetailForm?.errorsFormData?.paymentSystemId?.errors?.length > 0"
            @change="handleChangeSelectPaymentType"
            @blur="validatorPaymentDetailForm?.doValidateField('paymentSystemId', $event)" />
        </UiFormControl>

        <div v-if="hasSelectedPaymentSystem">
          <UiFormControl
            v-for="field in selectedPaymentFields"
            :key="field.id"
            :label="'Recipient Wallet ID'"
            :errors="[]">
            <UiInput
              :placeholder="field.placeholder"
              :value="field.value" />
          </UiFormControl>
        </div>
        <div v-else>
          {{ t("cabinet.payments.details.createNew.recipientAddress") }}
        </div>

        <div class="accounts__edit__actions">
          <UiButtonDefault
            class="accounts__edit__save-btn"
            state="info"
            @click="handleSubmitForm">
            <span v-if="!isLoading">{{ t("cabinet.accounts.accounts-form.actions.submit") }}</span>
            <UiIconSpinnerDefault v-if="isLoading" />
          </UiButtonDefault>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { formData } from "~/pages/payments/details/composables";
  import {
    validatePaymentDetailForm,
    validatorPaymentDetailForm,
  } from "~/pages/payments/details/composables/validation";

  type PaymentTypeOption = {
    id: string;
    value: string;
    text: string;
  };

  type PaymentSystem = {
    id: string;
    name: string;
    pdfc?: Array<{ id: string | number; placeholder?: string; value?: string }>;
  };

  const isLoading = ref(false);
  const { t } = useI18n({ useScope: "global" });
  const props = defineProps({
    title: {
      type: String,
      default: "",
    },
  });

  const app = useAppCore();
  const toast = useToast();
  const { closeModal } = inject("modalControl") as { closeModal: Function };

  const paymentTypes = reactive<PaymentTypeOption[]>([]);
  const paymentSystems = reactive<PaymentSystem[]>([]);
  const selectedPaymentSystem = ref<PaymentSystem | null>(null);

  const selectedPaymentFields = computed(() => selectedPaymentSystem.value?.pdfc ?? []);
  const hasSelectedPaymentSystem = computed(() => selectedPaymentFields.value.length > 0);

  const handleChangeSelectPaymentType = (val: string) => {
    validatorPaymentDetailForm.doValidateField("paymentSystemId", val);
    formData.paymentSystemId = val;
    selectedPaymentSystem.value = paymentSystems.find(x => x.id === String(val)) ?? null;
  };

  const getPaymentTypes = async () => {
    const response = await app.paymentSystems.get();
    paymentTypes.splice(
      0,
      paymentTypes.length,
      ...response.data.map(({ id, name }) => ({
        id: String(id),
        value: String(id),
        text: String(name),
      }))
    );

    paymentSystems.splice(
      0,
      paymentSystems.length,
      ...response.data.map(({ id, name, pdfc }) => ({
        id: String(id),
        name: String(name),
        pdfc,
      }))
    );
  };

  const handleSubmitForm = async () => {
    validatePaymentDetailForm(async () => {
      try {
        isLoading.value = true;
        const response = await app.paymentDetails.post(formData);
        closeModal();
        useEventBus.emit("loadDataForPaymentDetails");
        toast.success(response.data.message);
      } catch (errorResponse) {
        console.log("handleSubmitForm -> errorResponse", errorResponse);
      } finally {
        isLoading.value = false;
      }
    });
  };

  onMounted(async () => {
    await getPaymentTypes();
  });
</script>

<style lang="scss" scoped>
  .accounts__edit {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;

    &__top {
      min-height: 50px;
      padding-left: 40px;
      padding-right: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      border-bottom: 1px solid var(--color-stroke-ui-dark);
    }

    &__content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;

      &.without-top {
        border-top: none;
      }

      &__fields {
        padding: 40px;

        .ui-form-control {
          margin-bottom: 20px;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }

    &__actions {
      margin-top: 24px;
      padding-bottom: max(8px, calc(env(safe-area-inset-bottom, 0px) + 6px));
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    &__save-btn {
      min-height: 40px;
    }
  }

  @media (max-width: 768px) {
    .accounts__edit {
      &__top {
        padding-left: 20px;
        padding-right: 20px;
      }

      &__content {
        &__fields {
          padding: 20px;
        }
      }

      &__actions {
        margin-top: 20px;
      }

      &__save-btn {
        width: 100%;
      }
    }
  }
</style>
