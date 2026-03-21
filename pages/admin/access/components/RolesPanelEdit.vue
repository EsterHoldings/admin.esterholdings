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
import { computed, inject, onMounted, ref } from "vue";
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

type PermissionItem = {
  id: string;
  name: string;
};

const permissionsData = ref<PermissionItem[]>([]);
const selectedPermissionsData = ref<PermissionItem[]>([]);

const app = useAppCore();
const adminAuthStore = useAdminAuthStore();
const canUpdateRoles = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-roles"));

const { closeModal } = inject("modalControl") as { closeModal: Function };

const getRole = async () => {
  try {
    const response = await app.roles.getById(props.id);
    const role = response?.data?.data ?? {};
    const selectedPermissions = Array.isArray(role?.permissions)
      ? role.permissions
      : [];

    selectedPermissionsData.value = selectedPermissions
      .map((permission: any) => ({
        id: String(permission?.id ?? ""),
        name: String(permission?.name ?? ""),
      }))
      .filter((permission: PermissionItem) => permission.id && permission.name);

    formData.name = String(role?.name ?? "");
    formData.permissions = selectedPermissionsData.value
      .map((permission: any) => String(permission?.id ?? ""))
      .filter(Boolean);
    syncPermissionsData();
  } catch {
    selectedPermissionsData.value = [];
    formData.name = "";
    formData.permissions = [];
  }
};

const getPermissions = async () => {
  try {
    const response = await app.permissions.get({ perPage: 1000 });
    const permissions = response?.data?.data?.data;
    permissionsData.value = Array.isArray(permissions) ? permissions : [];
    syncPermissionsData();
  } catch {
    permissionsData.value = [];
  }
};

const syncPermissionsData = () => {
  const permissionsMap = new Map<string, PermissionItem>();

  for (const permission of permissionsData.value) {
    if (permission?.id) {
      permissionsMap.set(String(permission.id), {
        id: String(permission.id),
        name: String(permission.name ?? ""),
      });
    }
  }

  for (const permission of selectedPermissionsData.value) {
    if (permission?.id && !permissionsMap.has(permission.id)) {
      permissionsMap.set(permission.id, permission);
    }
  }

  permissionsData.value = Array.from(permissionsMap.values());
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
