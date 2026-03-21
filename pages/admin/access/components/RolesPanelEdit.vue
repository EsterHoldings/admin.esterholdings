<template>
  <div class="roles-panel__edit">
    <div class="roles-panel__edit__top" v-if="props.title">
      <UiTextH2>{{ props.title }}</UiTextH2>
    </div>

    <div
      class="roles-panel__edit__content"
      :class="{ 'without-top': !props.title }"
    >
      <div class="roles-panel__edit__content__fields">
        <UiFormControl
          :label="t('admin.access.components.roles-panel-edit.labels.name')"
          :errors="validatorRoleForm?.errorsFormData?.name?.errors"
        >
          <UiInput
            :placeholder="
              t('admin.access.components.roles-panel-edit.placeholders.name')
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
            t('admin.access.components.roles-panel-edit.labels.permissions')
          "
          :errors="validatorRoleForm?.errorsFormData?.permissions?.errors"
        >
          <UiMultiSelect
            :placeholder="
              t(
                'admin.access.components.roles-panel-edit.placeholders.permissions'
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

  <div class="roles-panel__edit__bottom">
    <UiButtonDefault
      class="roles-panel__edit__bottom__save-btn"
      state="secondary"
      :disabled="!canUpdateRoles"
      @click="handleSubmitForm"
    >
      {{
        t("admin.access.components.roles-panel-edit.actions.updateAndSave")
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
import { validatorRoleForm } from "~/pages/admin/access/composables/RolesPanelEdit/validation";
import { formData } from "~/pages/admin/access/composables/RolesPanelEdit";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

const { t } = useI18n({ useScope: "global" });
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    required: true,
  },
});

let permissionsData = reactive([]);

const app = useAppCore();
const adminAuthStore = useAdminAuthStore();
const canUpdateRoles = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-roles"));

const { closeModal } = inject("modalControl") as { closeModal: Function };

const getRole = async () => {
  const response = await app.roles.getById(props.id);
  const selectedPermissions = response.data.data.permissions;

  formData.name = response.data.data.name;
  formData.permissions = selectedPermissions.map((permission) => permission.id);
};

const getPermissions = async () => {
  const response = await app.permissions.get();
  permissionsData = response.data.data.data;
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
const handleCloseMultiSelectPermissions = () => validateThisField();

const handleSubmitForm = async () => {
  if (!canUpdateRoles.value) return;

  try {
    await app.roles.patch(props.id, formData);
    closeModal();
    useEventBus.emit("loadDataForRoles");
  } catch (errorResponse) {
    console.log("handleSubmitForm -> errorResponse", errorResponse);
  }
};

onMounted(async () => {
  await getPermissions();
  await getRole();
});
</script>

<style lang="scss" scoped>
.roles-panel__edit {
  &__top {
    height: 50px;

    padding-left: 40px;
    padding-right: 20px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-bottom: 1px solid gainsboro;
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

    border-top: 1px solid gainsboro;

    .btn {
      height: 40px;
    }
  }
}
</style>
