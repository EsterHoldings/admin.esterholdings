<template>
  <div class="change-password">
    <div class="change-password__left">
      <PanelDefault class="change-password__left__panel">
        <div class="change-password__left__form">
          <UiFormControl
              class="change-password__left__form__field"
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

          <UiFormControl
              class="change-password__left__form__field"
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
              class="change-password__left__form__field"
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

          <div class="change-password__left__form__field__save_btn">
            <UiButtonDefault
                state="info--outline"
                @click="validateChangePasswordDataForm(handleSubmit)"
            >
              <UiIconSpinnerDefault v-if="isLoading"/>
              <span v-if="!isLoading">{{ t("cabinet.profile.components.tab-change-password.button") }}</span>
            </UiButtonDefault>
          </div>
        </div>
      </PanelDefault>
    </div>

    <div class="change-password__right">
      <PanelDefault class="change-password__right__panel">
        <UiTextH5># Восстановление пароля</UiTextH5>

        <div class="change-password__card recovery-card">
          <UiTextSmall class="recovery-card__text">Если старый пароль утерян - вы можете отправить письмо на почту и
            перейдя по ссылке вы попадете на страницу восстановления пароля без указания старого пароля.
          </UiTextSmall>
          <UiButtonDefault
              state="primary"
              class="recovery-card__button"
          >
            Отправить ссылку на почту
          </UiButtonDefault>
        </div>

        <UiHorizontalLine/>

        <div class="change-password__card twofa-card">
          <UiTextH5 class="twofa-card__title"># Двофакторна аутентифікація (2Fa)</UiTextH5>

          <div class="qr--is-loading" v-if="qrIsLoading && !twoFaEnabled">
            <UiIconSpinnerDefault/>
          </div>

          <div class="qr--2fa-enabled" v-if="!qrIsLoading && twoFaEnabled">
            <UiIconSuccess/>
            <div v-html="qrSvg"></div>
            <div>
              <UiButtonDefault state="danger--outline" @click="handleClickTwoFaDisable">
                <span v-if="!loadingDisable">Disable 2Fa</span>
                <UiIconSpinnerDefault v-if="loadingDisable"/>
              </UiButtonDefault>
            </div>
          </div>

          <div class="qr--is-loaded" v-if="!qrIsLoading && !twoFaEnabled">
            <div v-html="qrSvg"></div>
            <div class="twofa-card__code">
              <UiFormControl label="2Fa code">
                <UiInput placeholder="Enter code here" :value="otp" @input="handleInputOtp"/>
              </UiFormControl>

              <UiButtonDefault class="enable2fa-btn" state="info--outline" @click="onEnable">
                <span v-if="!loading">Enable 2Fa {{ otp }}</span>
                <UiIconSpinnerDefault v-if="loading"/>
              </UiButtonDefault>
            </div>
          </div>

        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "vue-toastification";
import {formData} from "~/pages/profile/composables/TheChangePassword";
import {resetValidationUserDataForm,} from "~/pages/profile/composables/validation";
import {
  validateChangePasswordDataForm,
  validatorChangePasswordDataForm,
} from "~/pages/profile/composables/TheChangePassword/validation";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiHorizontalLine from "~/components/ui/UiHorizontalLine.vue";

import useAppCore from "~/composables/useAppCore";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";

const {t} = useI18n();
const toast = useToast();
const appCore = useAppCore();
const isLoading = ref(false);

const otp = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const twoFaEnabled = ref(false)

const loadingDisable = ref(false);
const errorDisable = ref<string | null>(null)

const qrIsLoading = ref(false);
const qrSvg = ref('');

const handleInputOtp = (value: string) => {
  otp.value = value;
}

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    await appCore.users.patch(formData);
    resetValidationUserDataForm();
    toast.success("Password was successfully updated!");
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  }
};

const onEnable = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {
    await appCore.auth2fa.doEnable2fa({otp: otp.value});
    success.value = true;
    toast.success("2Fa was enabled!");
  } catch (e) {
    error.value = e.message || 'Невірний код або помилка зв’язку'
    toast.error(error.value);
  } finally {
    loading.value = false
    await loadTwoFaQr();
  }
}

const handleClickTwoFaDisable = async () => {
  errorDisable.value = null
  loadingDisable.value = true

  try {
    await appCore.auth2fa.doDisable2fa({})
    toast.success('2FA вимкнено')

    qrSvg.value = ''
    otp.value = ''
    success.value = false
  } catch (e) {
    errorDisable.value = e.message || 'Помилка при вимкненні 2FA'
    toast.error(errorDisable.value)
  } finally {
    loadingDisable.value = false
    await loadTwoFaQr();
  }
}

const loadTwoFaQr = async () => {
  qrIsLoading.value = true;
  const response = await appCore.auth2fa.doGenerate2fa({})
  if (response.data?.message?.length > 0) {
    twoFaEnabled.value = true;
    qrSvg.value = response.data?.message;
  } else {
    qrSvg.value = response.data.qr;
  }
  qrIsLoading.value = false;
}

onMounted(async () => {
  await loadTwoFaQr();
})
</script>

<style lang="scss" scoped>
@media (max-width: 900px) {
  .change-password {
    flex-direction: column;
  }

  .change-password__left,
  .change-password__right {
    width: 100% !important;
  }
}

.change-password {
  display: flex;
  justify-content: space-between;
  gap: 20px;

  &__left {
    width: 50%;

    &__panel {
      padding: 20px;
    }

    &__form {

      &__field {
        margin-top: 20px;
        margin-bottom: 10px;

        &__save_btn {
          margin-top: 20px;
        }
      }
    }
  }

  &__right {
    width: 50%;

    &__panel {
      padding: 20px;

      .change-password {
        &__right {
          //width: 50%;

          &__panel {
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding: 20px;
            background: var(--ui-background);
          }
        }

        &__card {
          display: flex;
          flex-direction: column;
          gap: 16px;

          .qr--2fa-enabled {
            padding: 20px;
            background-color: var(--ui-background);
            height: 200px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 20px;
            border-radius: 10px;

            svg {
              height: 50px;
              width: 50px;
            }
          }

          .qr--is-loading {
            padding: 20px;
            background-color: var(--ui-background);
            height: 200px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
          }

          .qr--is-loaded {
            height: 200px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            flex-wrap: wrap;

            & > div:first-child {
              height: 200px;
              width: 50%;
              display: flex;
              justify-content: flex-start;
            }

            & > div:last-child {
              width: 50%;
              height: 200px;
            }

            .enable2fa-btn {
              margin-top: 20px;
              margin-bottom: 20px;
            }
          }
        }
      }

      .recovery-card {

        &__text {
          color: var(--ui-text-main);
          font-size: 14px;
          margin-top: 10px;
        }

        &__button {
          align-self: flex-start;
        }
      }

      .twofa-card {
        margin-top: 20px;

        &__title {
          color: var(--ui-text-main);
          font-size: 14px;
        }
      }
    }
  }
}
</style>
