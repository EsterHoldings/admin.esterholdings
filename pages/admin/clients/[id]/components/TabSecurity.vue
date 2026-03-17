<template>
  <div class="client-security">
    <div class="client-security__column client-security__column--main">
      <PanelDefault class="client-security__panel">
        <div class="client-security__two-factor-header">
          <div class="client-security__panel-header client-security__panel-header--compact">
            <UiTextH5>{{ resolveText("admin.clients.security.twoFactor.title", "Two-factor authentication") }}</UiTextH5>
            <UiTextSmall class="client-security__muted">
              {{
                twoFactorEnabled
                  ? resolveText("admin.clients.security.twoFactor.enabledDescription", "Two-factor authentication is enabled for this client.")
                  : resolveText("admin.clients.security.twoFactor.disabledDescription", "Two-factor authentication is currently disabled for this client.")
              }}
            </UiTextSmall>
          </div>

          <span
            class="client-security__status-pill"
            :class="{
              'client-security__status-pill--enabled': twoFactorEnabled,
              'client-security__status-pill--disabled': !twoFactorEnabled,
            }"
          >
            {{
              twoFactorEnabled
                ? resolveText("admin.clients.security.twoFactor.statusEnabled", "Enabled")
                : resolveText("admin.clients.security.twoFactor.statusDisabled", "Disabled")
            }}
          </span>
        </div>

        <div
          v-if="twoFactorEnabled"
          class="client-security__two-factor-actions"
        >
          <UiButtonDefault
            state="danger--outline"
            :disabled="isTwoFactorDisabling"
            :isLoading="isTwoFactorDisabling"
            @click="handleDisableTwoFactor"
          >
            {{ resolveText("admin.clients.security.twoFactor.disable", "Disable 2FA") }}
          </UiButtonDefault>
        </div>
      </PanelDefault>

      <PanelDefault class="client-security__panel">
        <div class="client-security__panel-header">
          <UiTextH5>{{ resolveText("admin.clients.security.password.title", "Change password") }}</UiTextH5>
          <UiTextSmall class="client-security__muted">
            {{ resolveText("admin.clients.security.password.description", "Set a new password for this client account.") }}
          </UiTextSmall>
        </div>

        <div class="client-security__form">
          <UiFormControl
            class="client-security__field"
            :label="resolveText('admin.clients.security.password.labels.newPassword', 'New password')"
            :errors="passwordErrors"
          >
            <UiInput
              type="password"
              :placeholder="resolveText('admin.clients.security.password.placeholders.newPassword', '*********')"
              :value="form.password"
              :isDirty="isPasswordDirty"
              :isInvalid="passwordErrors.length > 0"
              @input="handlePasswordInput"
              @blur="handlePasswordBlur" />
          </UiFormControl>

          <UiFormControl
            class="client-security__field"
            :label="resolveText('admin.clients.security.password.labels.confirmation', 'Confirm password')"
            :errors="confirmationErrors"
          >
            <UiInput
              type="password"
              :placeholder="resolveText('admin.clients.security.password.placeholders.confirmation', '*********')"
              :value="form.password_confirmation"
              :isDirty="isConfirmationDirty"
              :isInvalid="confirmationErrors.length > 0"
              @input="handleConfirmationInput"
              @blur="handleConfirmationBlur" />
          </UiFormControl>

          <div class="client-security__email-toggle">
            <div class="client-security__email-toggle-copy">
              <UiTextSmall class="client-security__email-toggle-label">
                {{ resolveText("admin.clients.security.password.sendEmail", "Send new password to client email") }}
              </UiTextSmall>
              <UiTextSmall class="client-security__muted">
                {{ userEmailDisplay }}
              </UiTextSmall>
            </div>

            <UiSwitchToggle
              :modelValue="form.send_email"
              :disabled="!hasEmail"
              @change="form.send_email = $event" />
          </div>

          <div class="client-security__actions">
            <UiButtonDefault
              state="info--outline"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <UiIconSpinnerDefault v-if="isSubmitting" />
              <span v-else>{{ resolveText("admin.clients.security.password.submit", "Save password") }}</span>
            </UiButtonDefault>
          </div>
        </div>
      </PanelDefault>
    </div>

    <div class="client-security__column client-security__column--aside">
      <PanelDefault class="client-security__panel">
        <div class="client-security__panel-header">
          <UiTextH5>{{ resolveText("admin.clients.security.help.title", "Password delivery") }}</UiTextH5>
        </div>

        <UiTextSmall class="client-security__muted">
          {{ resolveText("admin.clients.security.help.description", "If email sending is enabled, the password will be sent to the client after the password is updated successfully. If sending fails, the password change will be rolled back.") }}
        </UiTextSmall>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import useAppCore from "~/composables/useAppCore";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  interface UserData {
    email?: string | null;
    two_factor_enabled?: boolean | null;
  }

  const props = defineProps<{
    clientId: string;
    userData: UserData;
  }>();

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();

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
    { immediate: true }
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
    if (isTwoFactorDisabling.value || !twoFactorEnabled.value) {
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
    if (isSubmitting.value) {
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
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
    gap: 20px;

    &__column {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    &__panel {
      padding: 20px;
    }

    &__panel-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;

      &--compact {
        margin-bottom: 0;
      }
    }

    &__muted {
      color: var(--ui-text-secondary);
      line-height: 1.5;
    }

    &__form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    &__field {
      margin: 0;
    }

    &__two-factor-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    &__status-pill {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid transparent;
      font-size: 0.875rem;
      font-weight: 700;

      &--enabled {
        color: var(--color-success);
        border-color: color-mix(in srgb, var(--color-success) 45%, transparent);
        background: color-mix(in srgb, var(--color-success) 14%, transparent);
      }

      &--disabled {
        color: var(--ui-text-secondary);
        border-color: color-mix(in srgb, var(--ui-text-secondary) 25%, transparent);
        background: color-mix(in srgb, var(--ui-text-secondary) 10%, transparent);
      }
    }

    &__two-factor-actions {
      margin-top: 20px;
      display: flex;
      justify-content: flex-start;
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

    &__email-toggle-label {
      color: var(--ui-text-main);
      font-size: 0.9375rem;
    }

    &__actions {
      display: flex;
      justify-content: flex-start;
    }
  }

  @media (max-width: 992px) {
    .client-security {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .client-security {
      &__panel {
        padding: 16px;
      }

      &__two-factor-header {
        align-items: flex-start;
        flex-direction: column;
      }

      &__email-toggle {
        align-items: flex-start;
        flex-direction: column;
      }

      &__actions :deep(button) {
        width: 100%;
      }

      &__two-factor-actions :deep(button) {
        width: 100%;
      }
    }
  }
</style>
