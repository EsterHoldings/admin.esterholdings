<template>
  <div class="client-settings">
    <div class="client-settings__column client-settings__column--main">
      <PanelDefault class="client-settings__panel">
        <div class="client-settings__panel-header">
          <UiTextH5>{{ resolveText("clients.settings.supportMode.title", "Support mode") }}</UiTextH5>
          <UiTextSmall class="client-settings__muted">
            {{ resolveText("clients.settings.supportMode.description", "Choose how the client can contact support.") }}
          </UiTextSmall>
        </div>

        <div class="client-settings__switch-row">
          <UiTextSmall class="client-settings__mode-label">
            {{ resolveText("clients.settings.supportMode.simple", "Simple form") }}
          </UiTextSmall>
          <UiSwitchToggle
            :modelValue="fullSupportEnabled"
            @change="handleSupportModeToggle" />
          <UiTextSmall class="client-settings__mode-label">
            {{ resolveText("clients.settings.supportMode.full", "Full chat support") }}
          </UiTextSmall>
          <UiIconSpinnerDefault
            v-if="supportModeUpdating"
            class="client-settings__spinner" />
        </div>
      </PanelDefault>

      <PanelDefault class="client-settings__panel">
        <div class="client-settings__panel-header">
          <UiTextH5>{{ resolveText("clients.settings.password.title", "Change password") }}</UiTextH5>
          <UiTextSmall class="client-settings__muted">
            {{ resolveText("clients.settings.password.description", "Set a new password for this client account.") }}
          </UiTextSmall>
        </div>

        <div class="client-settings__form">
          <UiFormControl
            class="client-settings__field"
            :label="resolveText('cabinet.profile.components.tab-change-password.labels.new_password', 'New password')"
            :errors="passwordErrors"
          >
            <UiInput
              type="password"
              :placeholder="resolveText('cabinet.profile.components.tab-change-password.placeholders.new_password', '*********')"
              :value="form.password"
              :isDirty="isPasswordDirty"
              :isInvalid="passwordErrors.length > 0"
              @input="form.password = $event.target.value"
              @blur="isPasswordDirty = true" />
          </UiFormControl>

          <UiFormControl
            class="client-settings__field"
            :label="resolveText('cabinet.profile.components.tab-change-password.labels.new_password_confirmation', 'Confirm password')"
            :errors="confirmationErrors"
          >
            <UiInput
              type="password"
              :placeholder="resolveText('cabinet.profile.components.tab-change-password.placeholders.new_password_confirmation', '*********')"
              :value="form.password_confirmation"
              :isDirty="isConfirmationDirty"
              :isInvalid="confirmationErrors.length > 0"
              @input="form.password_confirmation = $event.target.value"
              @blur="isConfirmationDirty = true" />
          </UiFormControl>

          <div class="client-settings__email-toggle">
            <div class="client-settings__email-toggle-copy">
              <UiTextSmall class="client-settings__email-toggle-label">
                {{ resolveText("clients.settings.password.sendEmail", "Send new password to client email") }}
              </UiTextSmall>
              <UiTextSmall class="client-settings__muted">
                {{ userEmailDisplay }}
              </UiTextSmall>
            </div>

            <UiSwitchToggle
              :modelValue="form.send_email"
              :disabled="!hasEmail"
              @change="form.send_email = $event" />
          </div>

          <div class="client-settings__actions">
            <UiButtonDefault
              state="info--outline"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <UiIconSpinnerDefault v-if="isSubmitting" />
              <span v-else>{{ resolveText("clients.settings.password.submit", "Save password") }}</span>
            </UiButtonDefault>
          </div>
        </div>
      </PanelDefault>
    </div>

    <div class="client-settings__column client-settings__column--aside">
      <PanelDefault class="client-settings__panel">
        <div class="client-settings__panel-header">
          <UiTextH5>{{ resolveText("clients.settings.help.title", "Password delivery") }}</UiTextH5>
        </div>

        <UiTextSmall class="client-settings__muted">
          {{ resolveText("clients.settings.help.description", "If email sending is enabled, the password will be sent to the client after the password is updated successfully. If sending fails, the password change will be rolled back.") }}
        </UiTextSmall>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from "vue";
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
    support_mode?: string | null;
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

  const supportModeUpdating = ref(false);
  const isSubmitting = ref(false);
  const isPasswordDirty = ref(false);
  const isConfirmationDirty = ref(false);

  const form = reactive({
    password: "",
    password_confirmation: "",
    send_email: true,
  });

  const hasEmail = computed(() => String(props.userData?.email ?? "").trim() !== "");
  const userEmailDisplay = computed(() => {
    if (!hasEmail.value) {
      return resolveText("clients.settings.password.emailMissing", "Client email is missing.");
    }

    return `${resolveText("clients.settings.password.recipient", "Recipient")}: ${String(props.userData?.email ?? "").trim()}`;
  });

  const fullSupportEnabled = computed(() => String(props.userData?.support_mode ?? "simple") === "full");

  const passwordErrors = computed(() => {
    if (!isPasswordDirty.value && !isSubmitting.value) {
      return [];
    }

    const errors: string[] = [];
    if (form.password.trim() === "") {
      errors.push(resolveText("clients.settings.password.validation.required", "Password is required."));
    } else if (form.password.length < 8) {
      errors.push(resolveText("clients.settings.password.validation.min", "Password must contain at least 8 characters."));
    }

    return errors;
  });

  const confirmationErrors = computed(() => {
    if (!isConfirmationDirty.value && !isSubmitting.value) {
      return [];
    }

    const errors: string[] = [];
    if (form.password_confirmation.trim() === "") {
      errors.push(resolveText("clients.settings.password.validation.confirmationRequired", "Password confirmation is required."));
    } else if (form.password_confirmation !== form.password) {
      errors.push(resolveText("clients.settings.password.validation.confirmed", "Passwords do not match."));
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

  const handleSupportModeToggle = async (enabled: boolean) => {
    if (supportModeUpdating.value) return;

    const nextMode = enabled ? "full" : "simple";
    const currentMode = String(props.userData?.support_mode ?? "simple");
    if (nextMode === currentMode) return;

    supportModeUpdating.value = true;
    const previousMode = currentMode;
    props.userData.support_mode = nextMode;

    try {
      await appCore.adminModules.clients.patchSupportMode(props.clientId, {
        support_mode: nextMode,
      });
      toast.success(resolveText("clients.supportMode.updated", "Support mode updated."));
    } catch (error) {
      props.userData.support_mode = previousMode;
      toast.error(resolveText("clients.supportMode.updateFailed", "Failed to update support mode."));
      console.error("Failed to update support mode", error);
    } finally {
      supportModeUpdating.value = false;
    }
  };

  const handleSubmit = async () => {
    isPasswordDirty.value = true;
    isConfirmationDirty.value = true;

    if (passwordErrors.value.length || confirmationErrors.value.length) {
      return;
    }

    if (form.send_email && !hasEmail.value) {
      toast.error(resolveText("clients.settings.password.emailMissing", "Client email is missing."));
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
          ? resolveText("clients.settings.password.successWithEmail", "Password updated and email sent.")
          : resolveText("clients.settings.password.success", "Password updated successfully.")
      );

      resetForm();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        resolveText("clients.settings.password.error", "Failed to update password.");
      toast.error(message);
      console.error("Failed to update client password", error);
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<style lang="scss" scoped>
  .client-settings {
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
    }

    &__muted {
      color: var(--ui-text-secondary);
      line-height: 1.5;
    }

    &__switch-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    &__mode-label {
      color: var(--ui-text-main);
      font-size: 0.9375rem;
    }

    &__spinner {
      width: 16px;
      height: 16px;
      color: var(--ui-text-main);
    }

    &__form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    &__field {
      margin: 0;
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
    .client-settings {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .client-settings {
      &__panel {
        padding: 16px;
      }

      &__switch-row,
      &__email-toggle {
        align-items: flex-start;
        flex-direction: column;
      }

      &__actions :deep(button) {
        width: 100%;
      }
    }
  }
</style>
