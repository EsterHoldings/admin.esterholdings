<template>
  <div class="accounts-form">
    <header class="accounts-form__header">
      <h2>{{ titleText }}</h2>
      <p>
        {{
          isEditMode
            ? resolveText(
                "admin.accounts.form.notes.edit",
                "Editing changes local account settings. MT4 account number and password are not recreated here."
              )
            : resolveText(
                "admin.accounts.form.notes.create",
                "Creating an account opens a real MT4 account for the selected client using the client profile data."
              )
        }}
      </p>
    </header>

    <div class="accounts-form__body">
      <PrimeMessage
        v-if="!canSubmitAccounts"
        severity="warn"
        size="small">
        {{ resolveText("admin.accounts.form.messages.noPermission", "You do not have permission to manage accounts.") }}
      </PrimeMessage>

      <div class="accounts-form__grid">
        <label class="accounts-form__field">
          <span>{{ resolveText("admin.accounts.form.labels.user", "Client") }}</span>
          <PrimeSelect
            class="w-full"
            append-to="self"
            filter
            :model-value="form.user_id || null"
            :options="userOptions"
            option-label="text"
            option-value="value"
            :loading="isMetaLoading"
            :disabled="isMetaLoading || isRecordLoading || isEditMode"
            :invalid="hasFieldError('user_id')"
            :placeholder="resolveText('admin.accounts.form.placeholders.userSearch', 'Search by email, phone or name')"
            @update:model-value="value => updateField('user_id', String(value || ''))"
            @filter="event => handleSearchUsers(String(event?.value || ''))"
            @show="() => loadMeta({ searchUser: userSearch, selectedUserId: form.user_id })" />
          <small v-if="firstFieldError('user_id')">{{ firstFieldError("user_id") }}</small>
        </label>

        <label class="accounts-form__field">
          <span>{{ resolveText("admin.accounts.form.labels.accountType", "Account type") }}</span>
          <PrimeSelect
            class="w-full"
            append-to="self"
            :model-value="form.account_type_id || null"
            :options="accountTypeOptions"
            option-label="text"
            option-value="value"
            :disabled="isMetaLoading || isRecordLoading"
            :invalid="hasFieldError('account_type_id')"
            :placeholder="resolveText('admin.accounts.form.placeholders.accountType', 'Select account type')"
            @update:model-value="value => updateField('account_type_id', String(value || ''))" />
          <small v-if="firstFieldError('account_type_id')">{{ firstFieldError("account_type_id") }}</small>
        </label>

        <label class="accounts-form__field">
          <span>{{ resolveText("admin.accounts.form.labels.leverage", "Leverage") }}</span>
          <PrimeSelect
            class="w-full"
            append-to="self"
            :model-value="form.leverage_id || null"
            :options="leverageOptions"
            option-label="text"
            option-value="value"
            :disabled="isMetaLoading || isRecordLoading"
            :invalid="hasFieldError('leverage_id')"
            :placeholder="resolveText('admin.accounts.form.placeholders.leverage', 'Select leverage')"
            @update:model-value="value => updateField('leverage_id', String(value || ''))" />
          <small v-if="firstFieldError('leverage_id')">{{ firstFieldError("leverage_id") }}</small>
        </label>

        <label
          v-if="features.currency"
          class="accounts-form__field">
          <span>{{ resolveText("admin.accounts.form.labels.currency", "Currency") }}</span>
          <PrimeSelect
            class="w-full"
            append-to="self"
            :model-value="form.currency || null"
            :options="currencyOptions"
            option-label="text"
            option-value="value"
            :disabled="isMetaLoading || isRecordLoading"
            :invalid="hasFieldError('currency')"
            :placeholder="resolveText('admin.accounts.form.placeholders.currency', 'Select currency')"
            @update:model-value="value => updateField('currency', String(value || ''))" />
          <small v-if="firstFieldError('currency')">{{ firstFieldError("currency") }}</small>
        </label>

        <label
          v-if="features.payment_type"
          class="accounts-form__field">
          <span>{{ resolveText("admin.accounts.form.labels.paymentType", "Payment type") }}</span>
          <PrimeSelect
            class="w-full"
            append-to="self"
            :model-value="form.payment_type || null"
            :options="paymentTypeOptions"
            option-label="text"
            option-value="value"
            :disabled="isMetaLoading || isRecordLoading"
            :invalid="hasFieldError('payment_type')"
            :placeholder="resolveText('admin.accounts.form.placeholders.paymentType', 'Select payment type')"
            @update:model-value="value => updateField('payment_type', String(value || ''))" />
          <small v-if="firstFieldError('payment_type')">{{ firstFieldError("payment_type") }}</small>
        </label>
      </div>

      <PrimeCard class="accounts-form__note">
        <template #content>
          <strong>{{ resolveText("admin.accounts.form.notes.title", "MT4 note") }}</strong>
          <span>
            {{
              isEditMode
                ? resolveText(
                    "admin.accounts.form.notes.edit",
                    "Editing changes local account settings. MT4 account number and password are not recreated here."
                  )
                : resolveText(
                    "admin.accounts.form.notes.create",
                    "Creating an account opens a real MT4 account for the selected client using the client profile data."
                  )
            }}
          </span>
        </template>
      </PrimeCard>
    </div>

    <footer class="accounts-form__footer">
      <PrimeButton
        class="w-full"
        :label="
          isEditMode
            ? resolveText('admin.accounts.form.actions.save', 'Save changes')
            : resolveText('admin.accounts.form.actions.create', 'Create account')
        "
        :loading="isSubmitting"
        :disabled="!canSubmitAccounts || isMetaLoading || isRecordLoading || isSubmitting"
        @click="handleSubmit" />
    </footer>
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { debounce } from "~/utils/helper/debounce";
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
  const canCreateAccounts = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-accounts")
  );
  const canUpdateAccounts = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-accounts")
  );
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
    return value === key ? fallback : String(value);
  };

  const normalizeOptions = (items: any[] = [], textFallbackKey = "name"): SelectOption[] =>
    items.map((item: any) => ({
      id: String(item?.id ?? item?.value ?? ""),
      value: String(item?.value ?? item?.id ?? ""),
      text: String(item?.text ?? item?.[textFallbackKey] ?? item?.label ?? item?.value ?? item?.id ?? "-"),
    }));

  const resetErrors = () => {
    (Object.keys(fieldErrors) as FieldKey[]).forEach(key => {
      fieldErrors[key] = [];
    });
  };

  const hasFieldError = (key: FieldKey): boolean => fieldErrors[key].length > 0;
  const firstFieldError = (key: FieldKey): string => fieldErrors[key][0] ?? "";

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
      form.payment_type = defaults.payment_type || paymentTypeOptions.value[0]?.value || "0";
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

      userOptions.value = normalizeOptions(Array.isArray(payload?.users) ? payload.users : [], "email");
      accountTypeOptions.value = normalizeOptions(Array.isArray(payload?.account_types) ? payload.account_types : []);
      leverageOptions.value = normalizeOptions(Array.isArray(payload?.leverages) ? payload.leverages : [], "label");
      currencyOptions.value = normalizeOptions(Array.isArray(payload?.currencies) ? payload.currencies : [], "value");
      paymentTypeOptions.value = normalizeOptions(
        Array.isArray(payload?.payment_types) ? payload.payment_types : [],
        "value"
      );

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
      fieldErrors.account_type_id = [
        resolveText("admin.accounts.form.errors.accountTypeRequired", "Select an account type."),
      ];
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
  .accounts-form {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    color: var(--ui-text-main);
  }

  .accounts-form__header {
    padding: 8px 48px 18px 24px;
    border-bottom: 1px solid var(--color-stroke-ui-light);

    h2 {
      font-size: 1.25rem;
      font-weight: 800;
      line-height: 1.2;
    }

    p {
      margin-top: 6px;
      color: var(--ui-text-secondary);
      font-size: 0.875rem;
      line-height: 1.45;
    }
  }

  .accounts-form__body {
    flex: 1;
    min-height: 0;
    display: grid;
    gap: 16px;
    padding: 20px 24px;
  }

  .accounts-form__grid {
    display: grid;
    gap: 14px;
  }

  .accounts-form__field {
    display: grid;
    gap: 6px;

    > span {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--ui-text-main);
    }

    small {
      color: var(--color-negative);
      font-size: 0.75rem;
    }
  }

  .accounts-form__note {
    :deep(.p-card-content) {
      display: grid;
      gap: 6px;
      padding: 14px;
    }

    strong {
      font-size: 0.875rem;
    }

    span {
      color: var(--ui-text-secondary);
      font-size: 0.8125rem;
      line-height: 1.45;
    }
  }

  .accounts-form__footer {
    padding: 18px 24px 24px;
    border-top: 1px solid var(--color-stroke-ui-light);
  }
</style>
