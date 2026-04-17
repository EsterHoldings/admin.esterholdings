<template>
  <div class="client-tab-space client-security">
    <div class="client-security__grid">
      <div class="client-security__column client-security__column--main">
        <PrimeCard class="client-tab-card">
          <template #content>
            <div class="client-card-body">
              <div class="client-card-header">
                <div>
                  <h3 class="client-card-title">
                    {{ resolveText("admin.clients.security.twoFactor.title", "Two-factor authentication") }}
                  </h3>
                  <p class="client-card-subtitle">
                    {{
                      twoFactorEnabled
                        ? resolveText("admin.clients.security.twoFactor.enabledDescription", "Two-factor authentication is enabled for this client.")
                        : resolveText("admin.clients.security.twoFactor.disabledDescription", "Two-factor authentication is currently disabled for this client.")
                    }}
                  </p>
                </div>

                <span
                  class="client-inline-status"
                  :class="twoFactorEnabled ? 'client-inline-status--success' : 'client-inline-status--warning'">
                  {{
                    twoFactorEnabled
                      ? resolveText("admin.clients.security.twoFactor.statusEnabled", "Enabled")
                      : resolveText("admin.clients.security.twoFactor.statusDisabled", "Disabled")
                  }}
                </span>
              </div>

              <PrimeButton
                v-if="twoFactorEnabled"
                :label="resolveText('admin.clients.security.twoFactor.disable', 'Disable 2FA')"
                icon="pi pi-lock-open"
                severity="danger"
                outlined
                :disabled="!canManageClientSecurity || isTwoFactorDisabling"
                :loading="isTwoFactorDisabling"
                @click="handleDisableTwoFactor" />
            </div>
          </template>
        </PrimeCard>

        <PrimeCard class="client-tab-card">
          <template #content>
            <div class="client-card-body">
              <div class="client-card-header">
                <div>
                  <h3 class="client-card-title">{{ resolveText("admin.clients.security.password.title", "Change password") }}</h3>
                  <p class="client-card-subtitle">
                    {{ resolveText("admin.clients.security.password.description", "Set a new password for this client account.") }}
                  </p>
                </div>
              </div>

              <div class="client-security__form">
                <label class="client-security__field">
                  <span>{{ resolveText("admin.clients.security.password.labels.newPassword", "New password") }}</span>
                  <PrimeInputText
                    type="password"
                    :disabled="!canManageClientSecurity"
                    :placeholder="resolveText('admin.clients.security.password.placeholders.newPassword', '*********')"
                    :model-value="form.password"
                    :invalid="passwordErrors.length > 0"
                    @update:model-value="handlePasswordInput"
                    @blur="handlePasswordBlur" />
                  <small
                    v-for="error in passwordErrors"
                    :key="error"
                    class="client-security__error">
                    {{ error }}
                  </small>
                </label>

                <label class="client-security__field">
                  <span>{{ resolveText("admin.clients.security.password.labels.confirmation", "Confirm password") }}</span>
                  <PrimeInputText
                    type="password"
                    :disabled="!canManageClientSecurity"
                    :placeholder="resolveText('admin.clients.security.password.placeholders.confirmation', '*********')"
                    :model-value="form.password_confirmation"
                    :invalid="confirmationErrors.length > 0"
                    @update:model-value="handleConfirmationInput"
                    @blur="handleConfirmationBlur" />
                  <small
                    v-for="error in confirmationErrors"
                    :key="error"
                    class="client-security__error">
                    {{ error }}
                  </small>
                </label>

                <div class="client-security__email-toggle">
                  <div class="client-security__email-toggle-copy">
                    <strong>{{ resolveText("admin.clients.security.password.sendEmail", "Send new password to client email") }}</strong>
                    <span class="client-card-subtitle">{{ userEmailDisplay }}</span>
                  </div>

                  <PrimeToggleSwitch
                    :model-value="form.send_email"
                    :disabled="!hasEmail || !canManageClientSecurity"
                    @update:model-value="form.send_email = Boolean($event)" />
                </div>

                <PrimeButton
                  class="client-security__submit"
                  :label="resolveText('admin.clients.security.password.submit', 'Save password')"
                  icon="pi pi-save"
                  :loading="isSubmitting"
                  :disabled="!canManageClientSecurity || isSubmitting"
                  @click="handleSubmit" />
              </div>
            </div>
          </template>
        </PrimeCard>
      </div>

      <PrimeCard class="client-tab-card client-security__help-card">
        <template #content>
          <div class="client-card-body">
            <div class="client-card-header">
              <div>
                <h3 class="client-card-title">{{ resolveText("admin.clients.security.help.title", "Password delivery") }}</h3>
                <p class="client-card-subtitle">
                  {{
                    resolveText("admin.clients.security.help.description", "If email sending is enabled, the password will be sent to the client after the password is updated successfully. If sending fails, the password change will be rolled back.")
                  }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
import {useAdminAuthStore} from "~/stores/adminAuthStore";

interface UserData {
  email?: string | null;
  two_factor_enabled?: boolean | null;
}

const props = defineProps<{
  clientId: string;
  userData: UserData;
}>();

const {t} = useI18n({useScope: "global"});
const toast = useToast();
const appCore = useAppCore();
const adminAuthStore = useAdminAuthStore();

const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const isSubmitting = ref(false);
const isTwoFactorDisabling = ref(false);
const isPasswordDirty = ref(false);
const isConfirmationDirty = ref(false);

const form = reactive({
  password: "",
  password_confirmation: "",
  send_email: true,
});

const hasEmail = computed(() => String(props.userData?.email ?? "").trim() !== "");
const twoFactorEnabled = computed(() => Boolean(props.userData?.two_factor_enabled));
const canManageClientSecurity = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-clients")
);
const userEmailDisplay = computed(() => {
  if (!hasEmail.value) {
    return resolveText("admin.clients.security.password.emailMissing", "Client email is missing.");
  }

  return `${resolveText("admin.clients.security.password.recipient", "Recipient")}: ${String(props.userData?.email ?? "").trim()}`;
});

watch(
    hasEmail,
    value => {
      if (!value) {
        form.send_email = false;
        return;
      }

      if (form.password === "" && form.password_confirmation === "") {
        form.send_email = true;
      }
    },
    {immediate: true}
);

const passwordErrors = computed(() => {
  if (!isPasswordDirty.value && !isSubmitting.value) {
    return [];
  }

  const errors: string[] = [];
  if (form.password.trim() === "") {
    errors.push(resolveText("admin.clients.security.password.validation.required", "Password is required."));
  } else if (form.password.length < 8) {
    errors.push(resolveText("admin.clients.security.password.validation.min", "Password must contain at least 8 characters."));
  }

  return errors;
});

const confirmationErrors = computed(() => {
  if (!isConfirmationDirty.value && !isSubmitting.value) {
    return [];
  }

  const errors: string[] = [];
  if (form.password_confirmation.trim() === "") {
    errors.push(resolveText("admin.clients.security.password.validation.confirmationRequired", "Password confirmation is required."));
  } else if (form.password_confirmation !== form.password) {
    errors.push(resolveText("admin.clients.security.password.validation.confirmed", "Passwords do not match."));
  }

  return errors;
});

const resetForm = () => {
  form.password = "";
  form.password_confirmation = "";
  form.send_email = hasEmail.value;
  isPasswordDirty.value = false;
  isConfirmationDirty.value = false;
};

const handlePasswordInput = (value: unknown) => {
  form.password = String(value ?? "");
  isPasswordDirty.value = true;
};

const handlePasswordBlur = () => {
  isPasswordDirty.value = true;
};

const handleConfirmationInput = (value: unknown) => {
  form.password_confirmation = String(value ?? "");
  isConfirmationDirty.value = true;
};

const handleConfirmationBlur = () => {
  isConfirmationDirty.value = true;
};

const handleDisableTwoFactor = async () => {
  if (!canManageClientSecurity.value || isTwoFactorDisabling.value || !twoFactorEnabled.value) {
    return;
  }

  try {
    isTwoFactorDisabling.value = true;
    await appCore.adminModules.clients.disableTwoFactor(props.clientId);
    props.userData.two_factor_enabled = false;
    toast.success(resolveText("admin.clients.security.twoFactor.disableSuccess", "2FA disabled successfully."));
  } catch (error: any) {
    const message =
        error?.response?.data?.message ||
        resolveText("admin.clients.security.twoFactor.disableError", "Failed to disable 2FA.");
    toast.error(message);
    console.error("Failed to disable client 2FA", error);
  } finally {
    isTwoFactorDisabling.value = false;
  }
};

const handleSubmit = async () => {
  if (!canManageClientSecurity.value || isSubmitting.value) {
    return;
  }

  isPasswordDirty.value = true;
  isConfirmationDirty.value = true;

  if (passwordErrors.value.length || confirmationErrors.value.length) {
    return;
  }

  if (form.send_email && !hasEmail.value) {
    toast.error(resolveText("admin.clients.security.password.emailMissing", "Client email is missing."));
    return;
  }

  try {
    isSubmitting.value = true;

    await appCore.adminModules.clients.updatePassword(props.clientId, {
      password: form.password,
      password_confirmation: form.password_confirmation,
      send_email: form.send_email,
    });

    toast.success(
        form.send_email
            ? resolveText("admin.clients.security.password.successWithEmail", "Password updated and email sent.")
            : resolveText("admin.clients.security.password.success", "Password updated successfully.")
    );

    resetForm();
  } catch (error: any) {
    const message =
        error?.response?.data?.message ||
        resolveText("admin.clients.security.password.error", "Failed to update password.");
    toast.error(message);
    console.error("Failed to update client password", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.client-security {
  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
    gap: 14px;
  }

  &__column {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__field {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 760;
  }

  &__field :deep(.p-inputtext) {
    width: 100%;
  }

  &__error {
    color: var(--color-danger);
    font-size: 12px;
  }

  &__email-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    border: 1px solid var(--ui-primary-main);
    border-radius: 16px;
    background: color-mix(in srgb, var(--ui-background-panel) 94%, transparent);
  }

  &__email-toggle-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__email-toggle-copy strong {
    color: var(--ui-text-main);
    font-size: 0.9375rem;
  }

  &__submit {
    align-self: flex-start;
  }
}

@media (max-width: 992px) {
  .client-security__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .client-security {
    &__email-toggle {
      align-items: flex-start;
      flex-direction: column;
    }

    &__submit {
      width: 100%;
    }
  }
}
</style>
