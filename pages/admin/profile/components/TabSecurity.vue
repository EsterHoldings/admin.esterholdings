<template>
  <div class="admin-profile-security">
    <div class="admin-profile-security__top-grid">
      <PanelDefault class="admin-profile-security__panel admin-profile-security__panel--password">
        <div class="admin-profile-security__panel-header">
          <div>
            <UiTextH5 class="admin-profile-security__panel-title">
              {{ resolveText("admin.profile.security.sections.password", "Password") }}
            </UiTextH5>
            <UiTextSmall class="admin-profile-security__panel-subtitle">
              {{
                resolveText(
                  "admin.profile.security.descriptions.password",
                  "Change the current password for this administrator account."
                )
              }}
            </UiTextSmall>
          </div>
        </div>

        <div class="admin-profile-security__form-grid">
          <div class="admin-profile-security__field-card">
            <UiFormControl
              :label="resolveText('admin.profile.security.fields.currentPassword', 'Current password')"
              :errors="passwordErrors.oldPassword">
              <UiInput
                type="password"
                :value="passwordForm.oldPassword"
                :placeholder="resolveText('admin.profile.security.fields.currentPassword', 'Current password')"
                @input="value => updatePasswordField('oldPassword', value)" />
            </UiFormControl>
          </div>

          <div class="admin-profile-security__field-card">
            <UiFormControl
              :label="resolveText('admin.profile.security.fields.newPassword', 'New password')"
              :errors="passwordErrors.newPassword">
              <UiInput
                type="password"
                :value="passwordForm.newPassword"
                :placeholder="resolveText('admin.profile.security.fields.newPassword', 'New password')"
                @input="value => updatePasswordField('newPassword', value)" />
            </UiFormControl>
          </div>

          <div class="admin-profile-security__field-card">
            <UiFormControl
              :label="resolveText('admin.profile.security.fields.confirmPassword', 'Confirm password')"
              :errors="passwordErrors.newPasswordConfirmation">
              <UiInput
                type="password"
                :value="passwordForm.newPasswordConfirmation"
                :placeholder="resolveText('admin.profile.security.fields.confirmPassword', 'Confirm password')"
                @input="value => updatePasswordField('newPasswordConfirmation', value)" />
            </UiFormControl>
          </div>
        </div>

        <div class="admin-profile-security__actions">
          <UiButtonDefault
            state="primary"
            :isLoading="isUpdatingPassword"
            @click="updatePassword">
            {{ resolveText("admin.profile.actions.updatePassword", "Update password") }}
          </UiButtonDefault>
        </div>
      </PanelDefault>

      <PanelDefault class="admin-profile-security__panel admin-profile-security__panel--recovery">
        <div class="admin-profile-security__panel-header">
          <div>
            <UiTextH5 class="admin-profile-security__panel-title">
              {{ resolveText("admin.profile.security.sections.recovery", "Password recovery") }}
            </UiTextH5>
            <UiTextSmall class="admin-profile-security__panel-subtitle">
              {{
                resolveText(
                  "admin.profile.security.descriptions.recovery",
                  "Generate a new password automatically and send it to the administrator email."
                )
              }}
            </UiTextSmall>
          </div>
        </div>

        <div class="admin-profile-security__recovery-card">
          <div class="admin-profile-security__recovery-meta">
            <div class="admin-profile-security__recovery-email">
              {{ props.profileData?.email || "—" }}
            </div>
            <UiTextSmall class="admin-profile-security__panel-subtitle">
              {{
                resolveText(
                  "admin.profile.security.descriptions.recoveryNote",
                  "The current password will be replaced immediately after the email is sent."
                )
              }}
            </UiTextSmall>
          </div>

          <UiButtonDefault
            state="warning"
            :isLoading="isSendingGeneratedPassword"
            @click="sendGeneratedPassword">
            {{ resolveText("admin.profile.actions.sendGeneratedPassword", "Generate and send password") }}
          </UiButtonDefault>
        </div>
      </PanelDefault>
    </div>

    <PanelDefault class="admin-profile-security__panel">
      <div class="admin-profile-security__panel-header">
        <div>
          <UiTextH5 class="admin-profile-security__panel-title">
            {{ resolveText("admin.profile.security.sections.twoFactor", "Two-factor authentication") }}
          </UiTextH5>
          <UiTextSmall class="admin-profile-security__panel-subtitle">
            {{
              resolveText(
                "admin.profile.security.descriptions.twoFactor",
                "Protect the admin login with a one-time code from an authenticator app."
              )
            }}
          </UiTextSmall>
        </div>

        <UiBadge
          :state="localTwoFactorEnabled ? 'success' : 'warning'"
          outline
          class="!px-3">
          {{
            localTwoFactorEnabled
              ? resolveText("admin.profile.security.twoFactor.enabled", "Enabled")
              : resolveText("admin.profile.security.twoFactor.disabled", "Disabled")
          }}
        </UiBadge>
      </div>

      <div class="admin-profile-security__two-factor">
        <div class="admin-profile-security__two-factor-qr">
          <div
            v-if="isLoadingQr"
            class="admin-profile-security__qr-loading">
            <UiTextSmall class="admin-profile-security__panel-subtitle">
              {{ resolveText("admin.profile.security.loading.qr", "Loading QR code...") }}
            </UiTextSmall>
          </div>

          <div
            v-else-if="!localTwoFactorEnabled && qrSvg"
            class="admin-profile-security__qr-card"
            v-html="qrSvg" />

          <div
            v-else
            class="admin-profile-security__qr-placeholder">
            {{
              resolveText(
                "admin.profile.security.placeholders.enabled",
                "Two-factor authentication is already enabled for this account."
              )
            }}
          </div>
        </div>

        <div class="admin-profile-security__two-factor-form">
          <UiFormControl
            v-if="!localTwoFactorEnabled"
            :label="resolveText('admin.profile.security.fields.code', 'Authenticator code')"
            :errors="otpErrors">
            <UiInput
              type="text"
              :value="otp"
              :placeholder="resolveText('admin.profile.security.fields.code', 'Authenticator code')"
              @input="updateOtp" />
          </UiFormControl>

          <div class="admin-profile-security__two-factor-actions">
            <UiButtonDefault
              v-if="!localTwoFactorEnabled"
              state="primary"
              :isLoading="isEnablingTwoFactor"
              @click="enableTwoFactor">
              {{ resolveText("admin.profile.actions.enableTwoFactor", "Enable 2FA") }}
            </UiButtonDefault>

            <UiButtonDefault
              v-else
              state="danger--outline"
              :isLoading="isDisablingTwoFactor"
              @click="disableTwoFactor">
              {{ resolveText("admin.profile.actions.disableTwoFactor", "Disable 2FA") }}
            </UiButtonDefault>
          </div>
        </div>
      </div>
    </PanelDefault>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiBadge from "~/components/ui/UiBadge.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";

  const props = withDefaults(
    defineProps<{
      profileData?: Record<string, any> | null;
      isLoading?: boolean;
    }>(),
    {
      profileData: null,
      isLoading: false,
    }
  );

  const emit = defineEmits<{
    (event: "profile-refresh"): void;
  }>();

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();

  const passwordForm = reactive({
    oldPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
  });

  const createPasswordErrors = () => ({
    oldPassword: [] as string[],
    newPassword: [] as string[],
    newPasswordConfirmation: [] as string[],
  });

  const passwordErrors = reactive(createPasswordErrors());
  const otpErrors = ref<string[]>([]);
  const otp = ref("");
  const qrSvg = ref("");
  const localTwoFactorEnabled = ref(Boolean(props.profileData?.two_factor_enabled));
  const isUpdatingPassword = ref(false);
  const isSendingGeneratedPassword = ref(false);
  const isLoadingQr = ref(false);
  const isEnablingTwoFactor = ref(false);
  const isDisablingTwoFactor = ref(false);

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const resetPasswordErrors = () => {
    passwordErrors.oldPassword = [];
    passwordErrors.newPassword = [];
    passwordErrors.newPasswordConfirmation = [];
  };

  const resetPasswordForm = () => {
    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
    passwordForm.newPasswordConfirmation = "";
  };

  const updateOtp = (value: string) => {
    otp.value = value;
    otpErrors.value = [];
  };

  const updatePasswordField = (field: keyof typeof passwordForm, value: string) => {
    passwordForm[field] = value;

    if (field === "oldPassword") passwordErrors.oldPassword = [];
    if (field === "newPassword") passwordErrors.newPassword = [];
    if (field === "newPasswordConfirmation") passwordErrors.newPasswordConfirmation = [];
  };

  const loadTwoFactorQr = async () => {
    if (localTwoFactorEnabled.value) {
      qrSvg.value = "";
      return;
    }

    isLoadingQr.value = true;

    try {
      const response = await appCore.adminModules.auth2fa.doGenerate2fa({});
      const payload = response?.data ?? {};

      if (typeof payload?.message === "string" && payload.message.length > 0) {
        localTwoFactorEnabled.value = true;
        qrSvg.value = "";
        emit("profile-refresh");
        return;
      }

      qrSvg.value = String(payload?.qr ?? "");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? resolveText("admin.profile.security.errors.qr", "Failed to generate QR code.")
      );
    } finally {
      isLoadingQr.value = false;
    }
  };

  const updatePassword = async () => {
    isUpdatingPassword.value = true;
    resetPasswordErrors();

    try {
      const response = await appCore.adminModules.profile.updatePassword({ ...passwordForm });
      toast.success(
        response?.data?.message ??
          resolveText("admin.profile.security.messages.passwordUpdated", "Password updated successfully.")
      );
      resetPasswordForm();
    } catch (error: any) {
      const responseErrors = error?.response?.data?.errors ?? {};
      passwordErrors.oldPassword = Array.isArray(responseErrors?.oldPassword) ? responseErrors.oldPassword : [];
      passwordErrors.newPassword = Array.isArray(responseErrors?.newPassword) ? responseErrors.newPassword : [];
      passwordErrors.newPasswordConfirmation = Array.isArray(responseErrors?.newPasswordConfirmation)
        ? responseErrors.newPasswordConfirmation
        : [];

      toast.error(
        error?.response?.data?.message ??
          resolveText("admin.profile.security.errors.password", "Failed to update password.")
      );
    } finally {
      isUpdatingPassword.value = false;
    }
  };

  const sendGeneratedPassword = async () => {
    isSendingGeneratedPassword.value = true;

    try {
      const response = await appCore.adminModules.profile.regeneratePassword();
      toast.success(
        response?.data?.message ??
          resolveText(
            "admin.profile.security.messages.generatedPasswordSent",
            "A new password was generated and sent by email."
          )
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          resolveText("admin.profile.security.errors.generatedPassword", "Failed to generate and send a new password.")
      );
    } finally {
      isSendingGeneratedPassword.value = false;
    }
  };

  const enableTwoFactor = async () => {
    otpErrors.value = [];
    isEnablingTwoFactor.value = true;

    try {
      const response = await appCore.adminModules.auth2fa.doEnable2fa({ otp: otp.value });
      localTwoFactorEnabled.value = true;
      otp.value = "";
      qrSvg.value = "";
      toast.success(
        response?.data?.message ??
          resolveText("admin.profile.security.messages.twoFactorEnabled", "Two-factor authentication enabled.")
      );
      emit("profile-refresh");
    } catch (error: any) {
      otpErrors.value = Array.isArray(error?.response?.data?.errors?.otp)
        ? error.response.data.errors.otp
        : [
            error?.response?.data?.message ??
              resolveText("admin.profile.security.errors.twoFactorEnable", "Failed to enable 2FA."),
          ].filter(Boolean);

      toast.error(
        error?.response?.data?.message ??
          resolveText("admin.profile.security.errors.twoFactorEnable", "Failed to enable 2FA.")
      );
    } finally {
      isEnablingTwoFactor.value = false;
    }
  };

  const disableTwoFactor = async () => {
    isDisablingTwoFactor.value = true;

    try {
      const response = await appCore.adminModules.auth2fa.doDisable2fa({});
      localTwoFactorEnabled.value = false;
      toast.success(
        response?.data?.message ??
          resolveText("admin.profile.security.messages.twoFactorDisabled", "Two-factor authentication disabled.")
      );
      emit("profile-refresh");
      await loadTwoFactorQr();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          resolveText("admin.profile.security.errors.twoFactorDisable", "Failed to disable 2FA.")
      );
    } finally {
      isDisablingTwoFactor.value = false;
    }
  };

  watch(
    () => Boolean(props.profileData?.two_factor_enabled),
    async value => {
      localTwoFactorEnabled.value = value;
      otpErrors.value = [];

      if (!value) {
        await loadTwoFactorQr();
        return;
      }

      qrSvg.value = "";
    },
    { immediate: true }
  );
</script>

<style scoped lang="scss">
  .admin-profile-security {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .admin-profile-security__top-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
    gap: 20px;
  }

  .admin-profile-security__panel {
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.01)), rgba(7, 18, 53, 0.26);
  }

  .admin-profile-security__panel--recovery {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(255, 173, 66, 0.12), transparent 38%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.01));
  }

  .admin-profile-security__panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .admin-profile-security__panel-title {
    color: var(--ui-text-main);
  }

  .admin-profile-security__panel-subtitle {
    color: var(--ui-text-secondary);
    line-height: 1.5;
  }

  .admin-profile-security__form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .admin-profile-security__field-card {
    padding: 14px 14px 10px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .admin-profile-security__field-card:hover {
    border-color: rgba(113, 158, 223, 0.18);
    background: rgba(255, 255, 255, 0.045);
  }

  .admin-profile-security__field-card :deep(.ui-form-control__label) {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ui-text-secondary);
  }

  .admin-profile-security__actions {
    display: flex;
    justify-content: flex-end;
  }

  .admin-profile-security__recovery-card {
    flex: 1;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 16px;
    padding: 20px;
    border-radius: 22px;
    background: rgba(7, 18, 53, 0.38);
    border: 1px solid rgba(255, 173, 66, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .admin-profile-security__recovery-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .admin-profile-security__recovery-email {
    color: var(--ui-text-main);
    font-size: 18px;
    font-weight: 700;
  }

  .admin-profile-security__two-factor {
    display: grid;
    grid-template-columns: minmax(280px, 0.86fr) minmax(0, 1fr);
    gap: 22px;
    align-items: stretch;
  }

  .admin-profile-security__two-factor-qr,
  .admin-profile-security__two-factor-form {
    min-width: 0;
  }

  .admin-profile-security__qr-card,
  .admin-profile-security__qr-placeholder,
  .admin-profile-security__qr-loading {
    min-height: 280px;
    border-radius: 22px;
    border: 1px dashed rgba(113, 158, 223, 0.2);
    background:
      radial-gradient(circle at top left, rgba(113, 158, 223, 0.14), transparent 34%), rgba(255, 255, 255, 0.03);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    text-align: center;
  }

  .admin-profile-security__qr-card :deep(svg) {
    width: min(100%, 228px);
    height: auto;
  }

  .admin-profile-security__two-factor-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    justify-content: center;
    padding: 20px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .admin-profile-security__two-factor-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .admin-profile-security__actions :deep(button),
  .admin-profile-security__two-factor-actions :deep(button) {
    min-width: 220px;
  }

  @media (max-width: 1024px) {
    .admin-profile-security__top-grid,
    .admin-profile-security__form-grid {
      grid-template-columns: 1fr;
    }

    .admin-profile-security__two-factor {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .admin-profile-security__panel-header,
    .admin-profile-security__recovery-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .admin-profile-security__actions,
    .admin-profile-security__two-factor-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .admin-profile-security__actions :deep(button),
    .admin-profile-security__recovery-card :deep(button),
    .admin-profile-security__two-factor-actions :deep(button) {
      width: 100%;
      min-width: 0;
    }
  }
</style>
