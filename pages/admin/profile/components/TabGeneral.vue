<template>
  <div class="profile__tab--general">
    <div class="profile__tab--general__profile-data">
      <PanelDefault>
        <div class="profile__tab--general__profile-data__form">
          <UiTextH5 class="title"># Основные данные пользователя</UiTextH5>
<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.email')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.email.errors"-->
<!--          >-->
<!--            <UiInput-->
<!--                type="text"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.email')"-->
<!--                :value="formData.email"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.email.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.email.errors.length > 0"-->
<!--                @input="validatorUserDataForm.doValidateField('email',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('email',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.first_name')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.first_name.errors"-->
<!--          >-->
<!--            <UiInput-->
<!--                type="text"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.first_name')"-->
<!--                :value="formData.first_name"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.first_name.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.first_name.errors.length >0"-->
<!--                @input="validatorUserDataForm.doValidateField('first_name',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('first_name',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.last_name')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.last_name.errors"-->
<!--          >-->
<!--            <UiInput-->
<!--                type="text"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.last_name')"-->
<!--                :value="formData.last_name"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.last_name.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.last_name.errors.length > 0"-->
<!--                @input="validatorUserDataForm.doValidateField('last_name',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('last_name',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.mid_name')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.mid_name.errors"-->
<!--          >-->
<!--            <UiInput-->
<!--                type="text"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.mid_name')"-->
<!--                :value="formData.mid_name"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.mid_name.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.mid_name.errors.length > 0"-->
<!--                @input="validatorUserDataForm.doValidateField('mid_name',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('mid_name',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.birthdate')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.birthdate.errors"-->
<!--          >-->
<!--            <UiInputDate-->
<!--                type="date"-->
<!--                placeholder=""-->
<!--                inputFormat="yyyy-MM-dd"-->
<!--                displayFormat="yyyy.MM.dd"-->
<!--                :value="formData.birthdate"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.birthdate.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.birthdate.errors.length > 0"-->
<!--                @input="handleInputBirthday"-->
<!--                @blur="handleInputBirthday"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.phone')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.phone.errors"-->
<!--          >-->
<!--            <UiInputPhone-->
<!--                type="number"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.phone')"-->
<!--                v-model="formData.phone"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.phone.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.phone.errors.length > 0"-->
<!--                @input="validatorUserDataForm.doValidateField('phone',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('phone',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->
        </div>
      </PanelDefault>
    </div>

    <div class="profile__tab--general__profile-data--additional">
      <PanelDefault>
        <div class="profile__tab--general__profile-data--additional__form">
          <UiTextH5 class="title"># Дополнительные данные пользователя</UiTextH5>
<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data&#45;&#45;additional__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.country')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.country.errors"-->
<!--          >-->
<!--            <UiInput-->
<!--                type="text"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.country')"-->
<!--                :value="formData.country"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.country.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.country.errors.length > 0"-->
<!--                @input="validatorUserDataForm.doValidateField('country',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('country',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data&#45;&#45;additional__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.state')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.state.errors"-->
<!--          >-->
<!--            <UiInput-->
<!--                type="text"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.state')"-->
<!--                :value="formData.state"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.state.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.state.errors.length > 0"-->
<!--                @input="validatorUserDataForm.doValidateField('state',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('state',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data&#45;&#45;additional__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.city')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.city.errors"-->
<!--          >-->
<!--            <UiInput-->
<!--                type="text"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.city')"-->
<!--                :value="formData.city"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.city.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.city.errors.length > 0"-->
<!--                @input="validatorUserDataForm.doValidateField('city',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('city',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data&#45;&#45;additional__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.address')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.address.errors"-->
<!--          >-->
<!--            <UiInput-->
<!--                type="text"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.address')"-->
<!--                :value="formData.address"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.address.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.address.errors.length > 0"-->
<!--                @input="validatorUserDataForm.doValidateField('address',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('address',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <UiFormControl-->
<!--              class="profile__tab&#45;&#45;general__profile-data&#45;&#45;additional__form__field"-->
<!--              :label="t('cabinet.profile.components.tab-general.labels.postal_code')"-->
<!--              :errors="validatorUserDataForm.errorsFormData.postal_code.errors"-->
<!--          >-->
<!--            <UiInput-->
<!--                type="text"-->
<!--                :placeholder="t('cabinet.profile.components.tab-general.placeholders.postal_code')"-->
<!--                :value="formData.postal_code"-->
<!--                :isDirty="validatorUserDataForm.errorsFormData.postal_code.isDirty"-->
<!--                :isInvalid="validatorUserDataForm.errorsFormData.postal_code.errors.length >0"-->
<!--                @input="validatorUserDataForm.doValidateField('postal_code',$event.target.value)"-->
<!--                @blur="validatorUserDataForm.doValidateField('postal_code',$event.target.value)"-->
<!--            />-->
<!--          </UiFormControl>-->

<!--          <div-->
<!--              class="profile__tab&#45;&#45;general__profile-data&#45;&#45;additional__form__field__save_btn"-->
<!--          >-->
<!--            <UiButtonDefault-->
<!--                state="info&#45;&#45;outline"-->
<!--                @click="validateUserDataForm(handleSubmit)"-->
<!--            >-->
<!--              <UiIconSpinnerDefault v-if="isLoading"/>-->
<!--              <span v-if="!isLoading">{{ t("cabinet.profile.components.tab-general.button") }}</span>-->
<!--            </UiButtonDefault>-->
<!--          </div>-->
        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {formData} from "~/pages/admin/profile/composables";
import {onMounted, reactive, ref} from "vue";
import {
  validateUserDataForm,
  validatorUserDataForm,
  resetValidationUserDataForm,
} from "~/pages/admin/profile/composables/validation";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiInputDate from "~/components/ui/UiInputDate.vue";
import UiInputPhone from "~/components/ui/UiInputPhone.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";

import {useToast} from "vue-toastification";
import useAppCore from "~/composables/useAppCore";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

const {t} = useI18n();
const toast = useToast();
const appCore = useAppCore();
const isLoading = ref(false);

// const handleInputBirthday = (value) => {
//   validatorUserDataForm.doValidateField(
//       'birthdate',
//       value
//   )
// }
//
// const handleSubmit = async () => {
//   try {
//     isLoading.value = true;
//     const authStore = useAuthStore();
//     await appCore.users.patch(formData);
//     resetValidationUserDataForm();
//     toast.success(t("cabinet.profile.components.tab-general.success"));
//   } catch (e) {
//     console.error(e);
//   } finally {
//     setTimeout(() => {
//       isLoading.value = false;
//     }, 1000);
//   }
// };
//
// onMounted(async () => {
//   const {data} = await appCore.auth.getAuthUser();
//   formData.email = data.email;
//   formData.first_name = data.first_name;
//   formData.mid_name = data.mid_name;
//   formData.last_name = data.last_name;
//   formData.birthdate = data.birthdate;
//   formData.phone = data.phone;
//   formData.country = data.country;
//   formData.state = data.state;
//   formData.city = data.city;
//   formData.address = data.address;
//   formData.postal_code = data.postal_code;
// });
</script>

<style lang="scss" scoped>
.title {
  margin-bottom: 20px;
}

.profile__tab--general {
  height: 80vh;
  width: 100%;
  border-radius: 10px;

  display: flex;
  gap: 20px;

  &__profile-data {
    width: 50%;
    height: 100%;

    &__title {
      padding: 0 20px;
      height: 40px;
      display: flex;
      align-items: center;
    }

    &__form {
      padding: 20px;

      &__field {
        margin-bottom: 10px;
      }
    }
  }

  &__profile-data--additional {
    width: 50%;
    height: 100%;

    &__title {
      padding: 0 20px;
      height: 40px;
      display: flex;
      align-items: center;
    }

    &__form {
      padding: 20px;

      &__field {
        margin-bottom: 10px;

        &__save_btn {
          margin-top: 35px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}
</style>
