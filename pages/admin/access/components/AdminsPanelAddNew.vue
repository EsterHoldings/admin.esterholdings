<template>
  <div class="admins-panel__edit">
    <div class="admins-panel__edit__top" v-if="props.title">
      <UiTextH4>{{ props.title }}</UiTextH4>
    </div>

    <div
      class="admins-panel__edit__content"
      :class="{ 'without-top': !props.title }"
    >
      <div class="admins-panel__edit__content__fields">
        <UiFormControl
          :label="
            t('admin.access.components.admins-panel-add-new.fields.nickname')
          "
          :errors="validatorAdminForm?.errorsFormData?.nickname?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.access.components.admins-panel-add-new.placeholders.nickname'
              )
            "
            :value="formData.name"
            :isDirty="validatorAdminForm?.errorsFormData?.nickname?.isDirty"
            :isInvalid="
              validatorAdminForm?.errorsFormData?.nickname?.errors?.length > 0
            "
            @blur="
              validatorAdminForm?.doValidateField(
                'nickname',
                $event.target.value
              )
            "
            @input="
              validatorAdminForm?.doValidateField(
                'nickname',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t('admin.access.components.admins-panel-add-new.fields.email')
          "
          :errors="validatorAdminForm?.errorsFormData?.email?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.access.components.admins-panel-add-new.placeholders.email'
              )
            "
            :value="formData.email"
            :isDirty="validatorAdminForm?.errorsFormData?.email?.isDirty"
            :isInvalid="
              validatorAdminForm?.errorsFormData?.email?.errors?.length > 0
            "
            @blur="
              validatorAdminForm?.doValidateField('email', $event.target.value)
            "
            @input="
              validatorAdminForm?.doValidateField('email', $event.target.value)
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t('admin.access.components.admins-panel-add-new.fields.password')
          "
          :errors="validatorAdminForm?.errorsFormData?.password?.errors"
        >
          <UiInput
            type="password"
            placeholder="********"
            :value="formData.password"
            :isDirty="validatorAdminForm?.errorsFormData?.password?.isDirty"
            :isInvalid="
              validatorAdminForm?.errorsFormData?.password?.errors?.length > 0
            "
            @blur="
              validatorAdminForm?.doValidateField(
                'password',
                $event.target.value
              )
            "
            @input="
              validatorAdminForm?.doValidateField(
                'password',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t('admin.access.components.admins-panel-add-new.fields.roles')
          "
          :errors="validatorAdminForm?.errorsFormData?.roles?.errors"
        >
          <UiMultiSelect
            :placeholder="
              t(
                'admin.access.components.admins-panel-add-new.placeholders.roles'
              )
            "
            :data="rolesData"
            :selected="formData.roles"
            :isDirty="validatorAdminForm?.errorsFormData?.roles?.isDirty"
            :isInvalid="
              validatorAdminForm?.errorsFormData?.roles?.errors?.length > 0
            "
            @update="handleUpdateMultiSelectRoles"
            @remove="handleRemoveMultiSelectRoles"
            @open="handleOpenMultiSelectRoles"
            @close="handleCloseMultiSelectRoles"
          />
        </UiFormControl>
      </div>
    </div>
  </div>

  <div class="admins-panel__edit__bottom">
    <UiButtonDefault
      class="admins-panel__edit__bottom__save-btn"
      state="secondary"
      :disabled="!canCreateAdmins"
      @click="handleSubmitForm"
      >{{
        t("admin.access.components.admins-panel-add-new.actions.submit")
      }}</UiButtonDefault
    >
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { computed, reactive, inject, onMounted } from "vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiMultiSelect from "~/components/ui/UiMultiSelect.vue";
import UiTextH2 from "~/components/ui/UiTextH2.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import {
  validateAdminForm,
  validatorAdminForm,
} from "~/pages/admin/access/composables/AdminsPanelAddNew/validation";
import { formData } from "~/pages/admin/access/composables/AdminsPanelAddNew";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

const { t } = useI18n({ useScope: "global" });
const adminAuthStore = useAdminAuthStore();
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

let rolesData = reactive([]);

const app = useAppCore();
const canCreateAdmins = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-admins"));

const { closeModal } = inject("modalControl") as { closeModal: Function };

const getRoles = async () => {
  const response = await app.roles.get({ perPage: 20 });
  rolesData = response.data.data.data;
};

const validateThisField = () => {
  validatorAdminForm?.doValidateField("roles", formData.roles);
};

const handleUpdateMultiSelectRoles = (selectedId: string) => {
  const index = formData.roles.indexOf(selectedId);
  if (index !== -1) {
    formData.roles.splice(index, 1);
  } else {
    formData.roles.push(selectedId);
  }
  validateThisField();
};

const handleRemoveMultiSelectRoles = (id: string) => {
  const index = formData.roles.indexOf(id);
  if (index !== -1) formData.roles.splice(index, 1);
  validateThisField();
};

const handleOpenMultiSelectRoles = () => {
  if (validatorAdminForm?.errorsFormData?.roles)
    validatorAdminForm.errorsFormData.roles.isDirty = true;
};
const handleCloseMultiSelectRoles = () => validateThisField();

const handleSubmitForm = async () => {
  if (!canCreateAdmins.value) return;

  validateAdminForm(async () => {
    try {
      await app.admins.post(formData);
      closeModal();
      useEventBus.emit("loadDataForAdmins");
    } catch (errorResponse) {
      console.log("handleSubmitForm -> errorResponse", errorResponse);
    }
  });
};

onMounted(async () => {
  await getRoles();
});
</script>

<style lang="scss" scoped>
.admins-panel__edit {
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
