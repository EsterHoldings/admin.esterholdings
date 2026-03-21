<template>
  <div class="accounts-form-drawer">
    <div
      v-if="titleText"
      class="accounts-form-drawer__top"
    >
      <h2 class="accounts-form-drawer__title">{{ titleText }}</h2>
    </div>

    <div
      class="accounts-form-drawer__content"
      :class="{ 'without-top': !titleText }"
    >
      <div class="accounts-form-drawer__fields">
        <UiFormControl
          :label="resolveText('admin.accounts.form.labels.user', 'Client')"
          :errors="fieldErrors.user_id"
        >
          <UiSelect
            searchable
            :value="form.user_id || null"
            :data="userOptions"
            :searchValue="userSearch"
            :searchPlaceholder="resolveText('admin.accounts.form.placeholders.userSearch', 'Search by email, phone or name')"
            :disabled="isMetaLoading || isRecordLoading"
            @change="value => updateField('user_id', value || '')"
            @search="handleSearchUsers"
          />
        </UiFormControl>

        <UiFormControl
          :label="resolveText('admin.accounts.form.labels.accountType', 'Account type')"
          :errors="fieldErrors.account_type_id"
        >
          <UiSelect
            :value="form.account_type_id || null"
            :data="accountTypeOptions"
            :disabled="isMetaLoading || isRecordLoading"
            @change="value => updateField('account_type_id', value || '')"
          />
        </UiFormControl>

        <UiFormControl
          :label="resolveText('admin.accounts.form.labels.leverage', 'Leverage')"
          :errors="fieldErrors.leverage_id"
        >
          <UiSelect
            :value="form.leverage_id || null"
            :data="leverageOptions"
            :disabled="isMetaLoading || isRecordLoading"
            @change="value => updateField('leverage_id', value || '')"
          />
        </UiFormControl>

        <UiFormControl
          v-if="features.currency"
          :label="resolveText('admin.accounts.form.labels.currency', 'Currency')"
          :errors="fieldErrors.currency"
        >
          <UiSelect
            :value="form.currency || null"
            :data="currencyOptions"
            :disabled="isMetaLoading || isRecordLoading"
            @change="value => updateField('currency', value || '')"
          />
        </UiFormControl>

        <UiFormControl
          v-if="features.payment_type"
          :label="resolveText('admin.accounts.form.labels.paymentType', 'Payment type')"
          :errors="fieldErrors.payment_type"
        >
          <UiSelect
            :value="form.payment_type || null"
            :data="paymentTypeOptions"
            :disabled="isMetaLoading || isRecordLoading"
            @change="value => updateField('payment_type', value || '')"
          />
        </UiFormControl>

        <div class="accounts-form-drawer__note">
          <div class="accounts-form-drawer__note-title">
            {{ resolveText('admin.accounts.form.notes.title', 'MT4 note') }}
          </div>
          <div class="accounts-form-drawer__note-text">
            {{
              isEditMode
                ? resolveText(
                    'admin.accounts.form.notes.edit',
                    'Editing changes local account settings. MT4 account number and password are not recreated here.'
                  )
                : resolveText(
                    'admin.accounts.form.notes.create',
                    'Creating an account opens a real MT4 account for the selected client using the client profile data.'
                  )
            }}
          </div>
        </div>
      </div>
    </div>

    <div class="accounts-form-drawer__bottom">
      <UiButtonDefault
        state="secondary"
        class="accounts-form-drawer__submit"
        :disabled="!canSubmitAccounts || isMetaLoading || isRecordLoading"
        :isLoading="isSubmitting"
        @click="handleSubmit"
      >
        {{
          isEditMode
            ? resolveText('admin.accounts.form.actions.save', 'Save changes')
            : resolveText('admin.accounts.form.actions.create', 'Create account')
        }}
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { debounce } from "~/utils/helper/debounce";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

  type Mode = "create" | "edit";
  type FieldKey = "user_id" | "account_type_id" | "leverage_id" | "currency" | "payment_type";

  interface SelectOption {
    id: string;
    value: string;
    text: string;
  }

  interface AccountPayload {
    user_id: string;
    account_type_id: string;
    leverage_id: string;
    currency: string;
    payment_type: string;
  }

  const props = defineProps({
    title: {
      type: String,
      default: "",
    },
    mode: {
      type: String as () => Mode,
      default: "create",
    },
    id: {
      type: String,
      default: "",
    },
  });

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();

  const { closeModal } = inject("modalControl") as { closeModal: () => void };

  const isEditMode = computed(() => props.mode === "edit" && props.id !== "");
  const canCreateAccounts = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-accounts"));
  const canUpdateAccounts = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-accounts"));
  const canSubmitAccounts = computed(() => (isEditMode.value ? canUpdateAccounts.value : canCreateAccounts.value));
  const titleText = computed(() => {
    if (props.title) return props.title;

    return isEditMode.value
      ? resolveText("admin.accounts.form.titles.edit", "Edit account")
      : resolveText("admin.accounts.form.titles.create", "Create account");
  });

  const isSubmitting = ref(false);
  const isMetaLoading = ref(false);
  const isRecordLoading = ref(false);
  const userSearch = ref("");

  const form = reactive<AccountPayload>({
    user_id: "",
    account_type_id: "",
    leverage_id: "",
    currency: "",
    payment_type: "",
  });

  const fieldErrors = reactive<Record<FieldKey, string[]>>({
    user_id: [],
    account_type_id: [],
    leverage_id: [],
    currency: [],
    payment_type: [],
  });

  const userOptions = ref<SelectOption[]>([]);
  const accountTypeOptions = ref<SelectOption[]>([]);
  const leverageOptions = ref<SelectOption[]>([]);
  const currencyOptions = ref<SelectOption[]>([]);
  const paymentTypeOptions = ref<SelectOption[]>([]);
  const defaults = reactive({
    currency: "USD",
    payment_type: "0",
    leverage_id: "100",
  });
  const features = reactive({
    currency: true,
    payment_type: true,
  });

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const resetErrors = () => {
    (Object.keys(fieldErrors) as FieldKey[]).forEach(key => {
      fieldErrors[key] = [];
    });
  };

  const updateField = (key: FieldKey, value: string) => {
    form[key] = value;
    fieldErrors[key] = [];
  };

  const applyDefaults = () => {
    if (!form.leverage_id) {
      form.leverage_id = defaults.leverage_id || leverageOptions.value[0]?.value || "";
    }

    if (!form.currency) {
      form.currency = defaults.currency || currencyOptions.value[0]?.value || "";
    }

    if (!form.payment_type) {
      form.payment_type = defaults.payment_type || "0";
    }

    if (!form.account_type_id) {
      form.account_type_id = accountTypeOptions.value[0]?.value || "";
    }
  };

  const handleValidationError = (error: any) => {
    resetErrors();

    const responseErrors = error?.response?.data?.errors ?? {};
    (Object.keys(fieldErrors) as FieldKey[]).forEach(key => {
      if (Array.isArray(responseErrors[key])) {
        fieldErrors[key] = responseErrors[key];
      }
    });
  };

  const loadMeta = async (params: { searchUser?: string; selectedUserId?: string } = {}) => {
    isMetaLoading.value = true;

    try {
      const response = await appCore.adminModules.accounts.getMeta({
        search_user: params.searchUser ?? userSearch.value,
        selected_user_id: params.selectedUserId ?? form.user_id,
      });
      const payload = response?.data?.data ?? {};

      userOptions.value = Array.isArray(payload?.users)
        ? payload.users.map((user: any) => ({
            id: String(user?.id ?? ""),
            value: String(user?.value ?? user?.id ?? ""),
            text: String(user?.text ?? user?.email ?? user?.id ?? "-"),
          }))
        : [];

      accountTypeOptions.value = Array.isArray(payload?.account_types)
        ? payload.account_types.map((item: any) => ({
            id: String(item?.id ?? item?.value ?? ""),
            value: String(item?.value ?? item?.id ?? ""),
            text: String(item?.text ?? item?.name ?? item?.id ?? "-"),
          }))
        : [];

      leverageOptions.value = Array.isArray(payload?.leverages)
        ? payload.leverages.map((item: any) => ({
            id: String(item?.id ?? item?.value ?? ""),
            value: String(item?.value ?? item?.id ?? ""),
            text: String(item?.text ?? item?.label ?? item?.value ?? "-"),
          }))
        : [];

      currencyOptions.value = Array.isArray(payload?.currencies)
        ? payload.currencies.map((item: any) => ({
            id: String(item?.id ?? item?.value ?? ""),
            value: String(item?.value ?? item?.id ?? ""),
            text: String(item?.text ?? item?.value ?? item?.id ?? "-"),
          }))
        : [];

      paymentTypeOptions.value = Array.isArray(payload?.payment_types)
        ? payload.payment_types.map((item: any) => ({
            id: String(item?.id ?? item?.value ?? ""),
            value: String(item?.value ?? item?.id ?? ""),
            text: String(item?.text ?? item?.value ?? item?.id ?? "-"),
          }))
        : [];

      defaults.currency = String(payload?.defaults?.currency ?? defaults.currency);
      defaults.payment_type = String(payload?.defaults?.payment_type ?? defaults.payment_type);
      defaults.leverage_id = String(payload?.defaults?.leverage_id ?? defaults.leverage_id);
      features.currency = Boolean(payload?.features?.currency ?? true);
      features.payment_type = Boolean(payload?.features?.payment_type ?? true);

      if (!paymentTypeOptions.value.length && defaults.payment_type) {
        paymentTypeOptions.value = [
          {
            id: defaults.payment_type,
            value: defaults.payment_type,
            text: defaults.payment_type,
          },
        ];
      }

      applyDefaults();
    } finally {
      isMetaLoading.value = false;
    }
  };

  const loadAccount = async () => {
    if (!isEditMode.value) return;

    isRecordLoading.value = true;

    try {
      const response = await appCore.adminModules.accounts.getById(props.id);
      const payload = response?.data?.data ?? {};

      form.user_id = String(payload?.user_id ?? "");
      form.account_type_id = String(payload?.type_id ?? "");
      form.leverage_id = String(payload?.leverage_id ?? "");
      form.currency = String(payload?.currency ?? "");
      form.payment_type = String(payload?.payment_type ?? "");
      userSearch.value = String(payload?.owner_email ?? payload?.owner_name ?? "");
    } finally {
      isRecordLoading.value = false;
    }
  };

  const validateLocal = () => {
    resetErrors();

    if (!form.user_id.trim()) {
      fieldErrors.user_id = [resolveText("admin.accounts.form.errors.userRequired", "Select a client.")];
    }

    if (!form.account_type_id.trim()) {
      fieldErrors.account_type_id = [resolveText("admin.accounts.form.errors.accountTypeRequired", "Select an account type.")];
    }

    return !(fieldErrors.user_id.length || fieldErrors.account_type_id.length);
  };

  const handleSubmit = async () => {
    if (!canSubmitAccounts.value || isSubmitting.value) {
      return;
    }

    if (!validateLocal()) {
      return;
    }

    isSubmitting.value = true;

    try {
      const payload = {
        user_id: form.user_id,
        account_type_id: form.account_type_id,
        leverage_id: form.leverage_id || null,
        currency: form.currency || null,
        payment_type: form.payment_type || null,
      };

      if (isEditMode.value) {
        await appCore.adminModules.accounts.patch(props.id, payload);
        toast.success(resolveText("admin.accounts.form.messages.updateSuccess", "Account updated."));
      } else {
        await appCore.adminModules.accounts.post(payload);
        toast.success(resolveText("admin.accounts.form.messages.createSuccess", "Account created."));
      }

      closeModal();
      useEventBus.emit("loadDataForAdminAccounts");
    } catch (error: any) {
      handleValidationError(error);
      toast.error(
        error?.response?.data?.message ||
          (isEditMode.value
            ? resolveText("admin.accounts.form.messages.updateError", "Failed to update account.")
            : resolveText("admin.accounts.form.messages.createError", "Failed to create account."))
      );
    } finally {
      isSubmitting.value = false;
    }
  };

  const doSearchUsers = debounce(async (value: string) => {
    userSearch.value = value;
    await loadMeta({ searchUser: value, selectedUserId: form.user_id });
  }, 300);

  const handleSearchUsers = (value: string) => {
    doSearchUsers(value);
  };

  onMounted(async () => {
    if (!canSubmitAccounts.value) {
      return;
    }

    if (isEditMode.value) {
      await loadAccount();
    }

    await loadMeta({ selectedUserId: form.user_id });
  });
</script>

<style scoped lang="scss">
  .accounts-form-drawer {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .accounts-form-drawer__top {
    min-height: 56px;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-stroke-ui-dark);
  }

  .accounts-form-drawer__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ui-text-main);
  }

  .accounts-form-drawer__content {
    flex: 1;
    min-height: 0;
  }

  .accounts-form-drawer__fields {
    padding: 24px;
    display: grid;
    gap: 18px;
  }

  .accounts-form-drawer__note {
    padding: 14px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    background: color-mix(in srgb, var(--ui-background-panel) 85%, transparent);
  }

  .accounts-form-drawer__note-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--ui-text-main);
  }

  .accounts-form-drawer__note-text {
    margin-top: 6px;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--ui-text-secondary);
  }

  .accounts-form-drawer__bottom {
    padding: 18px 24px 24px;
    border-top: 1px solid var(--color-stroke-ui-dark);
  }

  .accounts-form-drawer__submit {
    width: 100%;
  }
</style>
