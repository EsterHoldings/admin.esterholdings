<template>
  <div class="flex flex-col gap-6 text-[var(--ui-text-main)]">
    <!-- TOP ROW: Change password + Forgot password card -->
    <div class="grid gap-6 lg:grid-cols-[1fr,360px]">
      <!-- LEFT: Change Password -->
      <div>
        <div class="space-y-5">
          <!-- Old password -->
          <UiFormControl
              :label="t('cabinet.profile.components.tab-change-password.labels.old_password')"
              :errors="validatorChangePasswordDataForm.errorsFormData.oldPassword.errors"
          >
            <UiInput
                type="password"
                :placeholder="t('cabinet.profile.components.tab-change-password.placeholders.old_password')"
                :value="formData.oldPassword"
                :isDirty="validatorChangePasswordDataForm.errorsFormData.oldPassword.isDirty"
                :isInvalid="validatorChangePasswordDataForm.errorsFormData.oldPassword.errors.length > 0"
                @input="validatorChangePasswordDataForm.doValidateField('oldPassword',$event.target.value)"
                @blur="validatorChangePasswordDataForm.doValidateField('oldPassword',$event.target.value)"
            />
          </UiFormControl>

          <!-- New password + rules hint -->
          <UiFormControl
              :label="t('cabinet.profile.components.tab-change-password.labels.new_password')"
              :errors="validatorChangePasswordDataForm.errorsFormData.newPassword.errors"
          >
            <UiInput
                type="password"
                :placeholder="t('cabinet.profile.components.tab-change-password.placeholders.new_password')"
                :value="formData.newPassword"
                :isDirty="validatorChangePasswordDataForm.errorsFormData.newPassword.isDirty"
                :isInvalid="validatorChangePasswordDataForm.errorsFormData.newPassword.errors.length > 0"
                @input="validatorChangePasswordDataForm.doValidateField('newPassword',$event.target.value)"
                @blur="validatorChangePasswordDataForm.doValidateField('newPassword',$event.target.value)"
            />
          </UiFormControl>

          <UiFormControl
              :label="t('cabinet.profile.components.tab-change-password.labels.new_password_confirmation')"
              :errors="validatorChangePasswordDataForm.errorsFormData.newPasswordConfirmation.errors"
          >
            <UiInput
                type="password"
                :placeholder="t('cabinet.profile.components.tab-change-password.placeholders.new_password_confirmation')"
                :value="formData.newPasswordConfirmation"
                :isDirty="validatorChangePasswordDataForm.errorsFormData.newPasswordConfirmation.isDirty"
                :isInvalid="validatorChangePasswordDataForm.errorsFormData.newPasswordConfirmation.errors.length > 0"
                @input="validatorChangePasswordDataForm.doValidateField('newPasswordConfirmation',$event.target.value)"
                @blur="validatorChangePasswordDataForm.doValidateField('newPasswordConfirmation',$event.target.value)"
            />
          </UiFormControl>

          <div>
            <UiButtonDefault
                class="min-w-[180px]"
                state="info--outline"
                @click="validateChangePasswordDataForm(handleSubmit)"
            >
              <UiIconSpinnerDefault v-if="isLoading"/>
              <span v-else>{{ t('cabinet.profile.components.tab-change-password.button') }}</span>
            </UiButtonDefault>
          </div>
        </div>
      </div>

      <div>
        <PanelDefault class="p-5 rounded-2xl border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background)]">
          <div class="space-y-3">
            <div class="text-sm font-semibold underline">Forgot Password?</div>
            <div class="text-xs opacity-80">
              Натисніть кнопку, щоб отримати лист і скинути пароль.
            </div>
            <UiButtonDefault state="primary" class="mt-1" @click="handleClickSendResetPasswordEmail">
              Send Link by Email
            </UiButtonDefault>
          </div>
        </PanelDefault>
      </div>
    </div>

    <div>
      <div class="mb-4 flex items-center justify-between">
        <div>
          <div class="text-base font-semibold">Two-Step Verification</div>
          <div class="text-xs opacity-70">
            Відскануйте QR-код або введіть секретний ключ вручну
          </div>
        </div>
        <UiSwitchToggle :model-value="twoFaSwitchOn" @update:modelValue="handleToggleTwoFa" />
      </div>

      <div v-if="twoFaSwitchOn" class="relative rounded-xl border border-[var(--color-stroke-ui-dark)] p-4 md:p-5">
        <div v-if="qrIsLoading && !twoFaEnabled" class="flex h-48 items-center justify-center">
          <UiIconSpinnerDefault />
        </div>

        <div v-else-if="!qrIsLoading && twoFaEnabled" class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-2 rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background)] px-3 py-2">
            <UiIconSuccess />
            <UiTextSmall class="!text-[var(--ui-text-main)]">{{ twoFaEnabledLabel }}</UiTextSmall>
          </div>
          <div class="flex items-center justify-center">
            <UiButtonDefault state="danger--outline" @click="handleClickTwoFaDisable">
              <span v-if="!loadingDisable">Disable 2Fa</span>
              <UiIconSpinnerDefault v-else />
            </UiButtonDefault>
          </div>
        </div>

        <div v-else class="grid gap-5 md:grid-cols-2">

          <div class="flex items-center justify-center">
            <div class="w-full max-w-[260px]" v-html="qrSvg"></div>
          </div>

          <div class="flex flex-col justify-center">
            <UiFormControl label="2Fa code">
              <UiInput placeholder="Enter code here" :value="otp" @input="handleInputOtp" />
            </UiFormControl>

            <UiButtonDefault class="mt-4 w-[140px]" state="info--outline" @click="onEnable">
              <span v-if="!loading">Confirm</span>
              <UiIconSpinnerDefault v-else />
            </UiButtonDefault>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

import { formData } from '~/pages/profile/composables/TheChangePassword'
import { resetValidationUserDataForm } from '~/pages/profile/composables/validation'
import {
  resetFormData,
  resetValidationChangePasswordDataForm,
  validateChangePasswordDataForm,
  validatorChangePasswordDataForm,
} from '~/pages/profile/composables/TheChangePassword/validation'

import PanelDefault from '~/components/block/panels/PanelDefault.vue'
import UiButtonDefault from '~/components/ui/UiButtonDefault.vue'
import UiFormControl from '~/components/ui/UiFormControl.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'
import UiIconSuccess from '~/components/ui/UiIconSuccess.vue'
import UiTextSmall from '~/components/ui/UiTextSmall.vue'

import useAppCore from '~/composables/useAppCore'
import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";

const { t } = useI18n()
const toast = useToast()
const appCore = useAppCore()

const isLoading = ref(false)

const otp = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const twoFaEnabled = ref(false)
const twoFaUiEnabled = ref(false)
const loadingDisable = ref(false)
const errorDisable = ref<string | null>(null)
const qrIsLoading = ref(false)
const qrSvg = ref('')
const twoFaEnabledLabel = computed(() => {
  const raw = String(qrSvg.value ?? '')
  const plain = raw.replace(/<[^>]*>/g, '').trim()
  return plain.length > 0 ? plain : '2FA enabled'
})

const handleInputOtp = (value: string) => { otp.value = value }

const handleSubmit = async () => {
  try {
    isLoading.value = true
    await appCore.password.updatePassword(formData)
    resetValidationUserDataForm()
    toast.success('Password was successfully updated!')
  } catch (e: any) {
    console.error(e)
    if (e.status === 422) {
      if (e.response.data.errors.newPassword) {
        validatorChangePasswordDataForm.errorsFormData.newPassword.errors = [e.response.data.errors.newPassword]
      }
      if (e.response.data.errors.newPasswordConfirmation) {
        validatorChangePasswordDataForm.errorsFormData.newPasswordConfirmation.errors = [e.response.data.errors.newPasswordConfirmation]
      }
      if (e.response.data.errors.oldPassword) {
        validatorChangePasswordDataForm.errorsFormData.oldPassword.errors = [e.response.data.errors.oldPassword]
      }
    }
  } finally {
    isLoading.value = false
    resetFormData()
    resetValidationChangePasswordDataForm()
  }
}

const onEnable = async () => {
  error.value = ''
  success.value = false
  loading.value = true
  try {
    await appCore.auth2fa.doEnable2fa({ otp: otp.value })
    success.value = true
    toast.success('2Fa was enabled!')
  } catch (e: any) {
    error.value = e.message || 'Невірний код або помилка зв’язку'
    toast.error(error.value)
  } finally {
    loading.value = false
    await loadTwoFaQr()
  }
}

const handleClickTwoFaDisable = async () => {
  errorDisable.value = null
  loadingDisable.value = true
  error.value = ''
  success.value = false
  loading.value = true
  try {
    await appCore.auth2fa.doDisable2fa({})
    toast.success('2FA вимкнено')
    qrSvg.value = ''
    otp.value = ''
    success.value = false
  } catch (e: any) {
    errorDisable.value = e.message || 'Помилка при вимкненні 2FA'
    toast.error(errorDisable.value)
  } finally {
    await loadTwoFaQr()
    loadingDisable.value = false
    twoFaEnabled.value = false
    twoFaUiEnabled.value = false
    loading.value = false
  }
}

const handleClickSendResetPasswordEmail = async () => {
  await appCore.password.resetPassword()
  toast.success('Reset password email was sent to your email.')
}

const loadTwoFaQr = async () => {
  qrIsLoading.value = true
  const response = await appCore.auth2fa.doGenerate2fa({})
  if (response.data?.message?.length > 0) {
    twoFaEnabled.value = true
    qrSvg.value = response.data?.message
  } else {
    qrSvg.value = response.data.qr
    twoFaEnabled.value = false
  }
  qrIsLoading.value = false
}

const handleToggleTwoFa = async (value: boolean) => {
  if (!value) {
    if (twoFaEnabled.value) {
      await handleClickTwoFaDisable()
      return
    }
    twoFaUiEnabled.value = false
    return
  }

  twoFaUiEnabled.value = true
  if (!qrSvg.value && !qrIsLoading.value) {
    await loadTwoFaQr()
  }
}

const twoFaSwitchOn = computed(() => twoFaEnabled.value || twoFaUiEnabled.value)

onMounted(async () => {
  await loadTwoFaQr()
  twoFaUiEnabled.value = twoFaEnabled.value
})

/* === Password rules highlighting (лише UI, логіку не змінює) === */
const pwd = computed(() => (formData.newPassword ?? '') as string)
const reqs = computed(() => ({
  min12: pwd.value.length >= 12,
  upper: /[A-Z]/.test(pwd.value),
  lower: /[a-z]/.test(pwd.value),
  num: /[0-9]/.test(pwd.value),
}))
const allReqsOk = computed(() => reqs.value.min12 && reqs.value.upper && reqs.value.lower && reqs.value.num)
const reqClass = (ok: boolean) => ok
    ? 'text-[var(--color-success)]'
    : 'text-[var(--color-danger)]'
</script>
