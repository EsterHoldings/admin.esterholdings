<template>
  <div class="admins-panel__edit">
    <div class="admins-panel__edit__top" v-if="props.title">
      <UiTextH2>{{ props.title }}</UiTextH2>
    </div>

    <div
      class="admins-panel__edit__content"
      :class="{ 'without-top': !props.title }"
    >
      <div class="admins-panel__edit__content__fields">
        <UiFormControl
          :label="
            t('admin.access.components.admins-panel-edit.labels.nickname')
          "
        >
          <UiInput
            :disabled="true"
            :placeholder="
              t(
                'admin.access.components.admins-panel-edit.placeholders.nickname'
              )
            "
            :value="formData.nickname"
          />
        </UiFormControl>

        <UiFormControl
          :label="t('admin.access.components.admins-panel-edit.labels.email')"
        >
          <UiInput
            :disabled="true"
            :placeholder="
              t('admin.access.components.admins-panel-edit.placeholders.email')
            "
            :value="formData.email"
          />
        </UiFormControl>

        <UiFormControl
          :label="t('admin.access.components.admins-panel-edit.labels.roles')"
          :errors="validatorAdminForm?.errorsFormData?.roles?.errors"
        >
          <UiMultiSelect
            :placeholder="
              t('admin.access.components.admins-panel-edit.placeholders.roles')
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
      :disabled="!canUpdateAdmins"
      @click="handleSubmitForm"
      >{{
        t("admin.access.components.admins-panel-edit.actions.submit")
      }}</UiButtonDefault
    >
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, inject, onMounted } from "vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiMultiSelect from "~/components/ui/UiMultiSelect.vue";
import UiTextH2 from "~/components/ui/UiTextH2.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import { validatorAdminForm } from "~/pages/admin/access/composables/AdminsPanelEdit/validation";
import { formData } from "~/pages/admin/access/composables/AdminsPanelEdit";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

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

let rolesData = reactive([]);

const app = useAppCore();
const adminAuthStore = useAdminAuthStore();
const canUpdateAdmins = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-admins"));

const { closeModal } = inject("modalControl") as { closeModal: Function };

const getAdmin = async () => {
  const response = await app.admins.getById(props.id);
  const selectedRoles = response.data.data.roles;

  console.log("selectedRoles", selectedRoles);

  formData.id = response.data.data.id;
  formData.nickname = response.data.data.nickname;
  formData.email = response.data.data.email;
  formData.roles = selectedRoles.map((role) => role.id);
};

const getRoles = async () => {
  const response = await app.roles.get({ perPage: 100 });
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
  if (!canUpdateAdmins.value) return;

  try {
    await app.admins.patch(props.id, { roles: formData.roles });
    closeModal();
    useEventBus.emit("loadDataForAdmins");
  } catch (errorResponse) {
    console.log("handleSubmitForm -> errorResponse", errorResponse);
  }
};

onMounted(async () => {
  await getRoles();
  await getAdmin();
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
