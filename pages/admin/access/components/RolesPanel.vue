<template>
  <div class="access-entity-panel">
    <div class="access-entity-panel__toolbar">
      <div class="access-entity-panel__toolbar-left">
        <UiInput
          class="w-full"
          :placeholder="t('admin.access.components.roles-panel-search.placeholder')"
          :isLoading="isLoadingSearch"
          :value="searchFilter"
          @input="handleInputSearch"
        >
          <template #icon-left>
            <UiIconSearch />
          </template>
        </UiInput>
      </div>

      <div class="access-entity-panel__toolbar-right">
        <UiButtonDefault state="info--small" class="!w-[44px]" @click="handleClickRefresh">
          <UiIconUpdate :spinning="isLoading || isLoadingSearch" />
        </UiButtonDefault>

        <UiButtonDefault
          v-if="canCreateRoles"
          state="secondary"
          class="shrink-0 whitespace-nowrap"
          @click="handleClickAddRole"
        >
          {{ resolveText("admin.access.components.roles-panel.actions.create", "New role") }}
        </UiButtonDefault>
      </div>
    </div>

    <div v-if="isLoading && rolesData.length === 0" class="access-entity-panel__loading">
      <UiIconSpinnerDefault />
    </div>

    <div v-else-if="rolesData.length === 0" class="access-entity-panel__empty">
      {{ resolveText("admin.access.components.roles-panel.empty", "No roles found.") }}
    </div>

    <div v-else class="access-entity-list">
      <article
        v-for="role in rolesData"
        :key="role.id"
        class="access-entity-card"
      >
        <div class="access-entity-card__top">
          <div>
            <div class="access-entity-card__title">{{ role.name || "-" }}</div>
            <div class="access-entity-card__subtitle">
              {{ role.permissions.length }} {{ resolveText("admin.access.components.roles-panel.permissionsCount", "permissions") }}
            </div>
          </div>

          <div class="access-entity-card__actions">
            <button
              v-if="canUpdateRoles"
              type="button"
              class="access-entity-action"
              :title="resolveText('admin.access.components.roles-panel.editTitle', 'Edit role')"
              @click="handleClickEditIcon(role.id)"
            >
              <UiIconEdit />
            </button>

            <button
              v-if="canDeleteRoles"
              type="button"
              class="access-entity-action"
              :title="resolveText('admin.access.components.roles-panel.actions.delete', 'Delete role')"
              @click="handleClickDeleteIcon(role.id)"
            >
              <UiIconDelete />
            </button>
          </div>
        </div>

        <div class="access-entity-card__grid">
          <div class="md:col-span-2">
            <div class="access-entity-card__label">{{ t("admin.access.components.roles-panel.columns.permissions") }}</div>
            <div v-if="role.permissions.length" class="access-entity-card__chips">
              <span
                v-for="permissionName in role.permissions"
                :key="permissionName"
                class="access-entity-chip"
              >
                {{ permissionName }}
              </span>
            </div>
            <div v-else class="access-entity-card__value">
              {{ emptyValueText }}
            </div>
          </div>
        </div>
      </article>
    </div>

    <PaginationDefault
      :isLoading="isLoading"
      :perPage="perPage"
      :page="page"
      :totalRows="totalRows"
      @perPageChange="handleChangePerPage"
      @pageChange="handleChangePage"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { debounce } from "~/utils/helper/debounce";

import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconDelete from "~/components/ui/UiIconDelete.vue";
import UiIconEdit from "~/components/ui/UiIconEdit.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from "~/components/ui/UiInput.vue";
import RolesPanelAddNew from "~/pages/admin/access/components/RolesPanelAddNew.vue";
import RolesPanelEdit from "~/pages/admin/access/components/RolesPanelEdit.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

interface IPermissionItem {
  name: string;
}

type RoleItem = {
  id: string;
  name: string;
  permissions: string[];
};

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();
const adminAuthStore = useAdminAuthStore();

const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const emptyValueText = "—";
const isLoading = ref(true);
const isLoadingSearch = ref(false);
const perPage = ref(6);
const page = ref(1);
const totalRows = ref(0);
const searchFields = ref(["name"]);
const searchFilter = ref("");
const rolesData = ref<RoleItem[]>([]);

const { openModal } = inject("modalControl") as { openModal: (component: unknown, props?: Record<string, unknown>) => void };
const canCreateRoles = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-roles"));
const canUpdateRoles = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-roles"));
const canDeleteRoles = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("delete-roles"));

const handleClickEditIcon = (id: string) => {
  if (!canUpdateRoles.value) return;

  openModal(RolesPanelEdit, {
    title: resolveText("admin.access.components.roles-panel.editTitle", "Edit Role"),
    id,
  });
};

const handleClickDeleteIcon = async (id: string) => {
  if (!canDeleteRoles.value) {
    return;
  }

  const isConfirmed = window.confirm(
    resolveText("admin.access.components.roles-panel.actions.deleteConfirm", "Delete this role?")
  );
  if (!isConfirmed) return;

  await appCore.roles.delete(id);
  await loadData();
};

const loadData = async (isFilterQuery = false) => {
  const params = {
    page: isFilterQuery ? 1 : page.value,
    perPage: perPage.value,
    searchFilter: searchFilter.value,
    searchFields: searchFields.value,
  };

  if (!isFilterQuery) {
    isLoading.value = true;
  }

  try {
    const response = await appCore.roles.get(params);
    const payload = response?.data?.data ?? {};

    totalRows.value = Number(payload?.total ?? 0);
    rolesData.value = Array.isArray(payload?.data)
      ? payload.data.map((role: any) => ({
          id: String(role?.id ?? ""),
          name: String(role?.name ?? ""),
          permissions: Array.isArray(role?.permissions)
            ? role.permissions.map((permission: IPermissionItem) => permission?.name).filter(Boolean)
            : [],
        }))
      : [];

    if (isFilterQuery) {
      page.value = 1;
    }
  } catch {
    totalRows.value = 0;
    rolesData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleClickAddRole = () => {
  if (!canCreateRoles.value) return;

  openModal(RolesPanelAddNew, {
    title: resolveText("admin.access.components.roles-panel.addTitle", "Add new Role"),
  });
};

const handleClickRefresh = async () => {
  await loadData();
};

const handleInputSearch = debounce(async (value: unknown) => {
  try {
    isLoadingSearch.value = true;
    searchFilter.value = String(value ?? "");
    await loadData(true);
  } finally {
    isLoadingSearch.value = false;
  }
}, 300);

const handleChangePerPage = async (value: number) => {
  page.value = 1;
  perPage.value = value;
  await loadData();
};

const handleChangePage = async (value: number) => {
  page.value = value;
  await loadData();
};

onMounted(async () => {
  await loadData();
  useEventBus.on("loadDataForRoles", loadData);
});
</script>
