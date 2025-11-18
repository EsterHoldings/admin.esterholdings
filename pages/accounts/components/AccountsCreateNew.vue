<template>
  <div class="accounts__edit">
    <div class="accounts__edit__top" v-if="props.title">
      <UiTextH4>{{ props.title }}</UiTextH4>
    </div>

    <div
        class="accounts__edit__content"
        :class="{ 'without-top': !props.title }"
    >
      <div class="accounts__edit__content__fields">
        <UiFormControl
            :label="t('cabinet.accounts.accounts-form.fields.accountType')"
            :errors="validatorAccountForm?.errorsFormData?.accountType?.errors"
        >
          <UiSelect
              :without-no-select="true"
              :data="accountTypes"
              :value="formData.accountType"
              @change="handleChangeSelectAccountType"
              :isDirty="validatorAccountForm?.errorsFormData?.accountType?.isDirty"
              :isInvalid="validatorAccountForm?.errorsFormData?.accountType?.errors?.length > 0"
              @blur="validatorAccountForm?.doValidateField('accountType',$event)"
          />
        </UiFormControl>

        <UiFormControl
            :label="t('cabinet.accounts.accounts-form.fields.phonePassword')"
            :errors="validatorAccountForm?.errorsFormData?.phonePassword?.errors"
        >
          <UiInput
              type="password"
              :placeholder="t('cabinet.accounts.accounts-form.fields.phonePasswordPlaceholder')"
              :value="formData.phonePassword"
              :isDirty="validatorAccountForm?.errorsFormData?.phonePassword?.isDirty"
              :isInvalid="validatorAccountForm?.errorsFormData?.phonePassword?.errors?.length > 0"
              @blur="validatorAccountForm?.doValidateField('phonePassword',$event.target.value)"
              @input="validatorAccountForm?.doValidateField('phonePassword',$event.target.value)"
          />
        </UiFormControl>
      </div>
    </div>
  </div>

  <div class="accounts__edit__bottom">
    <UiButtonDefault
        class="accounts__edit__bottom__save-btn"
        state="secondary"
        @click="handleSubmitForm"
    >
      <span v-if="!isLoading">{{ t("cabinet.accounts.accounts-form.actions.submit") }}</span>
      <UiIconSpinnerDefault v-if="isLoading" />
    </UiButtonDefault
    >
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {reactive, inject, onMounted, ref} from "vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import {
  validateAccountForm,
  validatorAccountForm,
} from "~/pages/accounts/composables/validation";
import {formData} from "~/pages/accounts/composables";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import {useToast} from "vue-toastification";

const isLoading = ref(false);
const {t} = useI18n({useScope: "global"});
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

const toast = useToast();
let rolesData = reactive([]);
let accountTypes = reactive([]);

const app = useAppCore();

const {closeModal} = inject("modalControl") as { closeModal: Function };

const handleChangeSelectAccountType = (val) => {
  console.log("handleChangeSelectAccountType", val);
  validatorAccountForm.doValidateField("accountType", val);
  formData.accountType = val;
};

const getAccountTypes = async () => {
  const response = await app.accountTypes.get({perPage: 20});
  accountTypes.splice(0, accountTypes.length,
      ...response.data.data.data.map(({ id, name }) => ({
        id: String(id),
        value: String(id),
        text: String(name),
      }))
  );
};

const handleSubmitForm = async () => {
  validateAccountForm(async () => {
    try {
      isLoading.value = true;
      const response = await app.accounts.post(formData);
      closeModal();
      useEventBus.emit("loadDataForAccounts");
      toast.success(response.data.message);
    } catch (errorResponse) {
      console.log("handleSubmitForm -> errorResponse", errorResponse);
    } finally {
      // isLoading.value = false;
    }
  });
};

onMounted(async () => {
  await getAccountTypes();
});
</script>

<style lang="scss" scoped>
.accounts__edit {
  &__top {
    height: 50px;

    padding-left: 40px;
    padding-right: 20px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-bottom: 1px solid var(--color-stroke-ui-dark);
  }

  &__content {
    height: calc(100vh - 120px);

    &.without-top {
      height: calc(100vh - 50px);
    }

    &__fields {
      padding: 40px;

      .ui-form-control {
        margin-bottom: 20px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  &__bottom {
    height: 70px;

    padding-left: 40px;
    padding-right: 40px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-top: 1px solid var(--color-stroke-ui-dark);

    .btn {
      height: 40px;
    }
  }
}
</style>
