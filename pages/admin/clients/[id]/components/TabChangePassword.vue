<template>
  <div class="change-password">
    <div class="change-password__left">
      <PanelDefault class="change-password__left__panel">
        <div class="change-password__left__form">
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
        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "vue-toastification";
import {formData} from "~/pages/admin/clients/[id]/composables/TheChangePassword";
import {resetValidationUserDataForm,} from "~/pages/admin/clients/[id]/composables/validation";
import {
  validateChangePasswordDataForm,
  validatorChangePasswordDataForm,
} from "~/pages/admin/clients/[id]/composables/TheChangePassword/validation";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiHorizontalLine from "~/components/ui/UiHorizontalLine.vue";

import useAppCore from "~/composables/useAppCore";

const {t} = useI18n();
const toast = useToast();
const appCore = useAppCore();
const isLoading = ref(false);

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    // await appCore.adminModules.users.patch(formData);
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
</script>

<style lang="scss" scoped>
@media (max-width: 992px) {
  .change-password {
    flex-direction: column;

    &__left {
      width: 100% !important;
    }
    &__right {
      width: 100% !important;
    }
  }
}

@media (max-width: 768px) {
  .change-password__left__panel,
  .change-password__right__panel {
    padding: 16px;
  }

  .change-password__left__form__field__save_btn :deep(button) {
    width: 100%;
  }

  .change-password__right__panel .recovery-card__button {
    width: 100%;
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
          width: 50%;

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
