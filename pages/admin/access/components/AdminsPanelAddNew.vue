<template>
  <div class="admins-create-modal flex min-h-full flex-col">
    <header class="flex min-h-8 items-start pr-10">
      <h3 class="admins-create-modal__title">
        {{
          props.title ||
          t("admin.access.components.admins-panel-add-new.title")
        }}
      </h3>
    </header>

    <div class="mt-4 flex flex-1 flex-col gap-3">
      <PrimeMessage
        v-if="submitError"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ submitError }}
      </PrimeMessage>

      <div class="grid gap-3">
        <div class="grid gap-1.5">
          <label class="text-sm font-semibold text-[var(--ui-text-main)]">
            {{ t("admin.access.components.admins-panel-add-new.fields.nickname") }}
          </label>

          <PrimeInputText
            v-model="formData.nickname"
            class="w-full"
            :invalid="hasFieldErrors('nickname')"
            :placeholder="
              t('admin.access.components.admins-panel-add-new.placeholders.nickname')
            "
            autocomplete="nickname"
            @update:modelValue="handleFieldInput('nickname')"
            @blur="validateField('nickname')"
          />

          <small
            v-if="firstFieldError('nickname')"
            class="text-xs text-[var(--color-negative)]"
          >
            {{ firstFieldError("nickname") }}
          </small>
        </div>

        <div class="grid gap-1.5">
          <label class="text-sm font-semibold text-[var(--ui-text-main)]">
            {{ t("admin.access.components.admins-panel-add-new.fields.email") }}
          </label>

          <PrimeInputText
            v-model="formData.email"
            class="w-full"
            :invalid="hasFieldErrors('email')"
            :placeholder="
              t('admin.access.components.admins-panel-add-new.placeholders.email')
            "
            autocomplete="email"
            @update:modelValue="handleFieldInput('email')"
            @blur="validateField('email')"
          />

          <small
            v-if="firstFieldError('email')"
            class="text-xs text-[var(--color-negative)]"
          >
            {{ firstFieldError("email") }}
          </small>
        </div>

        <div class="grid gap-1.5">
          <label class="text-sm font-semibold text-[var(--ui-text-main)]">
            {{ t("admin.access.components.admins-panel-add-new.fields.password") }}
          </label>

          <div
            class="admins-create-modal__password"
            :class="{ 'is-invalid': hasFieldErrors('password') }"
          >
            <PrimePassword
              v-model="formData.password"
              class="w-full"
              input-class="w-full"
              fluid
              :feedback="false"
              toggle-mask
              input-id="admin-create-password"
              autocomplete="new-password"
              @update:modelValue="handleFieldInput('password')"
              @blur="validateField('password')"
            />
          </div>

          <small
            v-if="firstFieldError('password')"
            class="text-xs text-[var(--color-negative)]"
          >
            {{ firstFieldError("password") }}
          </small>
        </div>

        <div class="grid gap-1.5">
          <label class="text-sm font-semibold text-[var(--ui-text-main)]">
            {{ t("admin.access.components.admins-panel-add-new.fields.roles") }}
          </label>

          <PrimeMultiSelect
            v-model="formData.roles"
            class="w-full"
            display="chip"
            filter
            :options="rolesData"
            option-label="name"
            option-value="id"
            :invalid="hasFieldErrors('roles')"
            :placeholder="
              t('admin.access.components.admins-panel-add-new.placeholders.roles')
            "
            @update:modelValue="handleRolesInput"
            @hide="validateField('roles')"
          />

          <small
            v-if="firstFieldError('roles')"
            class="text-xs text-[var(--color-negative)]"
          >
            {{ firstFieldError("roles") }}
          </small>
        </div>
      </div>
    </div>

    <footer class="admins-create-modal__footer">
      <PrimeButton
        class="w-full"
        :label="t('admin.access.components.admins-panel-add-new.actions.submit')"
        :loading="isSubmitting"
        :disabled="!canCreateAdmins || isSubmitting"
        @click="handleSubmitForm"
      />
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import {
  formData,
} from "~/pages/admin/access/composables/AdminsPanelAddNew";
import {
  resetFormData,
  resetValidationAdminForm,
  validateAdminForm,
  validatorAdminForm,
} from "~/pages/admin/access/composables/AdminsPanelAddNew/validation";

type RoleItem = {
  id: string;
  name: string;
};

const { t } = useI18n({ useScope: "global" });
const app = useAppCore();
const adminAuthStore = useAdminAuthStore();

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

const { closeModal } = inject("modalControl") as { closeModal: () => void };

const rolesData = ref<RoleItem[]>([]);
const isSubmitting = ref(false);
const submitError = ref("");

const canCreateAdmins = computed(
  () =>
    adminAuthStore.hasRole("super-admin") ||
    adminAuthStore.hasPermission("create-admins")
);

const getRoles = async () => {
  try {
    const response = await app.roles.get({ perPage: 100 });
    const roles = response?.data?.data?.data;
    rolesData.value = Array.isArray(roles) ? roles : [];
  } catch {
    rolesData.value = [];
  }
};

const validateField = (fieldName: "nickname" | "email" | "password" | "roles") => {
  validatorAdminForm?.doValidateField(fieldName);
};

const handleFieldInput = (fieldName: "nickname" | "email" | "password") => {
  submitError.value = "";
  validatorAdminForm?.doValidateField(fieldName);
};

const handleRolesInput = () => {
  submitError.value = "";
  validatorAdminForm?.doValidateField("roles");
};

const hasFieldErrors = (fieldName: "nickname" | "email" | "password" | "roles") =>
  (validatorAdminForm?.errorsFormData?.[fieldName]?.errors?.length ?? 0) > 0;

const firstFieldError = (fieldName: "nickname" | "email" | "password" | "roles") =>
  validatorAdminForm?.errorsFormData?.[fieldName]?.errors?.[0] ?? "";

const resolveRequestError = (error: any): string => {
  const responseData = error?.response?.data;
  if (typeof responseData?.message === "string" && responseData.message.trim() !== "") {
    return responseData.message;
  }

  const errors = responseData?.errors;
  if (errors && typeof errors === "object") {
    const firstError = Object.values(errors).flat().find(Boolean);
    if (typeof firstError === "string" && firstError.trim() !== "") {
      return firstError;
    }
  }

  return "Failed to create administrator.";
};

const handleSubmitForm = async () => {
  if (!canCreateAdmins.value || isSubmitting.value) {
    return;
  }

  submitError.value = "";

  validateAdminForm(async () => {
    isSubmitting.value = true;

    try {
      await app.admins.post({
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
        roles: formData.roles,
      });

      closeModal();
      useEventBus.emit("loadDataForAdmins");
    } catch (error) {
      submitError.value = resolveRequestError(error);
    } finally {
      isSubmitting.value = false;
    }
  });
};

onMounted(async () => {
  resetFormData();
  resetValidationAdminForm();
  submitError.value = "";
  await getRoles();
});

onBeforeUnmount(() => {
  resetFormData();
  resetValidationAdminForm();
  submitError.value = "";
});
</script>

<style scoped lang="scss">
.admins-create-modal {
  padding: 0 16px 16px;
}

.admins-create-modal__title {
  max-width: 100%;
  color: var(--ui-text-main);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.15;
}

.admins-create-modal__footer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  margin: 16px -16px 0;
  padding: 14px 16px 6px;
  border-top: 1px solid var(--color-stroke-ui-light);
  background: color-mix(in srgb, var(--ui-background) 96%, transparent);
  backdrop-filter: blur(10px);
}

.admins-create-modal__password {
  :deep(.p-password) {
    width: 100%;
  }

  :deep(.p-password-input) {
    width: 100%;
  }

  &.is-invalid {
    :deep(.p-password-input) {
      border-color: var(--color-negative);
    }
  }
}

:deep(.p-multiselect),
:deep(.p-password-input) {
  min-height: 44px;
  border-color: var(--color-stroke-ui-light);
  color: var(--ui-text-main);
  background: color-mix(in srgb, var(--ui-background-card) 94%, transparent);
}

:deep(.p-multiselect:hover),
:deep(.p-password-input:hover) {
  border-color: color-mix(in srgb, var(--ui-primary-main) 34%, var(--color-stroke-ui-light));
}

:deep(.p-multiselect.p-focus),
:deep(.p-password-input:enabled:focus) {
  border-color: var(--ui-primary-main);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
}

:deep(.p-multiselect-label),
:deep(.p-password-input::placeholder) {
  color: var(--ui-text-secondary);
}

:deep(.p-multiselect-chip) {
  border-radius: 999px;
}

:deep(.p-message) {
  margin: 0;
}
</style>
