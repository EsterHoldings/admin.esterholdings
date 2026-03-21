<template>
  <div class="roles-panel__add-new">
    <div class="roles-panel__add-new__top" v-if="props.title">
      <UiTextH2>{{ props.title }}</UiTextH2>
    </div>

    <div
      class="roles-panel__add-new__content"
      :class="{ 'without-top': !props.title }"
    >
      <div class="roles-panel__add-new__content__fields">
        <UiFormControl
          :label="t('admin.access.components.roles-panel-add-new.labels.name')"
          :errors="validatorRoleForm?.errorsFormData?.name?.errors"
        >
          <UiInput
            :placeholder="
              t('admin.access.components.roles-panel-add-new.placeholders.name')
            "
            :value="formData.name"
            :isDirty="validatorRoleForm?.errorsFormData?.name?.isDirty"
            :isInvalid="
              validatorRoleForm?.errorsFormData?.name?.errors?.length > 0
            "
            @blur="
              validatorRoleForm?.doValidateField('name', $event.target.value)
            "
            @input="
              validatorRoleForm?.doValidateField('name', $event.target.value)
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t('admin.access.components.roles-panel-add-new.labels.permissions')
          "
          :errors="validatorRoleForm?.errorsFormData?.permissions?.errors"
        >
          <UiMultiSelect
            :placeholder="
              t(
                'admin.access.components.roles-panel-add-new.placeholders.permissions'
              )
            "
            :data="permissionsData"
            :selected="formData.permissions"
            :isDirty="validatorRoleForm?.errorsFormData?.permissions?.isDirty"
            :isInvalid="
              validatorRoleForm?.errorsFormData?.permissions?.errors?.length > 0
            "
            @update="handleUpdateMultiSelectPermissions"
            @remove="handleRemoveMultiSelectPermission"
            @open="handleOpenMultiSelectPermissions"
            @close="handleCloseMultiSelectPermissions"
          />
        </UiFormControl>
      </div>
    </div>
  </div>

  <div class="roles-panel__add-new__bottom">
    <UiButtonDefault
      class="roles-panel__add-new__bottom__save-btn"
      state="secondary"
      :disabled="!canCreateRoles"
      @click="handleSubmitForm"
      >{{
        t("admin.access.components.roles-panel-add-new.actions.createAndSave")
      }}</UiButtonDefault
    >
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { computed, inject, ref } from "vue";
import { onMounted } from "vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiMultiSelect from "~/components/ui/UiMultiSelect.vue";
import UiTextH2 from "~/components/ui/UiTextH2.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import { validatorRoleForm } from "~/pages/admin/access/composables/RolesPabelAddNew/validation";
import { formData } from "~/pages/admin/access/composables/RolesPabelAddNew";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

const { t } = useI18n({ useScope: "global" });
const adminAuthStore = useAdminAuthStore();

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

type PermissionItem = {
  id: string;
  name: string;
};

const permissionsData = ref<PermissionItem[]>([]);

const app = useAppCore();
const canCreateRoles = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-roles"));

const { closeModal } = inject("modalControl") as { closeModal: Function };

const getPermissions = async () => {
  try {
    const response = await app.permissions.get();
    const permissions = response?.data?.data?.data;
    permissionsData.value = Array.isArray(permissions) ? permissions : [];
  } catch {
    permissionsData.value = [];
  }
};

const validateThisField = () => {
  validatorRoleForm?.doValidateField("permissions", formData.permissions);
};

const handleUpdateMultiSelectPermissions = (selectedId: string) => {
  const index = formData.permissions.indexOf(selectedId);
  if (index !== -1) {
    formData.permissions.splice(index, 1);
  } else {
    formData.permissions.push(selectedId);
  }
  validateThisField();
};

const handleRemoveMultiSelectPermission = (id: string) => {
  const index = formData.permissions.indexOf(id);
  if (index !== -1) formData.permissions.splice(index, 1);
  validateThisField();
};

const handleOpenMultiSelectPermissions = () => {
  if (validatorRoleForm?.errorsFormData?.permissions)
    validatorRoleForm.errorsFormData.permissions.isDirty = true;
};
const handleCloseMultiSelectPermissions = () =>
  validatorRoleForm?.doValidateField("permissions", formData.permissions);

const handleSubmitForm = async () => {
  if (!canCreateRoles.value) return;

  try {
    await app.roles.post(formData);
    closeModal();
    useEventBus.emit("loadDataForRoles");
  } catch (errorResponse) {
    console.log("----------");
    console.log(errorResponse);
    console.log("----------");
    // if (errorResponse.status === 422) {
    //   const transformedErrors = Object.keys(errorResponse.response.data.errors).reduce((acc, key) => {
    //     acc[key] = {
    //       isDirty: false,
    //       errors: errorResponse.response.data.errors[key],
    //     };
    //     return acc;
    //   }, {});
    //   console.log('+++++++++++++++');
    //   console.log(transformedErrors);
    //   console.log('+++++++++++++++');
    //   errorsFormDataObject = {...errorsFormDataObject, ...transformedErrors}
    // }
  }
};

onMounted(async () => {
  await getPermissions();
});
</script>

<style lang="scss" scoped>
.roles-panel__add-new {
  display: flex;
  flex-direction: column;
  min-height: 100%;

  &__top {
    min-height: 56px;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-bottom: 1px solid var(--color-stroke-ui-dark);
  }

  &__content {
    flex: 1;
    min-height: 0;

    &.without-top {
      min-height: 100%;
    }

    &__fields {
      padding: 24px;
      display: grid;
      gap: 18px;

      .ui-form-control {
        margin-bottom: 0;
      }
    }
  }

  &__bottom {
    padding: 18px 24px 24px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-top: 1px solid var(--color-stroke-ui-dark);

    &__save-btn {
      width: 100%;
    }
  }
}
</style>
