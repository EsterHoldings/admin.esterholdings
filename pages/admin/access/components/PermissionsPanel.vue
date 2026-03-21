<template>
  <div class="access-entity-panel">
    <div class="access-entity-panel__toolbar">
      <div class="access-entity-panel__toolbar-left">
        <UiInput
          class="w-full"
          :placeholder="resolveText('admin.access.components.permissions-panel.searchPlaceholder', 'Search')"
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
      </div>
    </div>

    <div v-if="isLoading && permissionsData.length === 0" class="access-entity-panel__loading">
      <UiIconSpinnerDefault />
    </div>

    <div v-else-if="permissionsData.length === 0" class="access-entity-panel__empty">
      {{ resolveText("admin.access.components.permissions-panel.empty", "No permissions found.") }}
    </div>

    <div v-else class="access-entity-list">
      <article
        v-for="permission in permissionsData"
        :key="permission.id"
        class="access-entity-card"
      >
        <div class="access-entity-card__top">
          <div>
            <div class="access-entity-card__title">{{ permission.name || "-" }}</div>
            <div
              class="access-permission-state"
              :class="permission.is_active ? 'is-active' : 'is-disabled'"
            >
              {{
                permission.is_active
                  ? resolveText("admin.access.components.permissions-panel.status.active", "Active")
                  : resolveText("admin.access.components.permissions-panel.status.disabled", "Disabled")
              }}
            </div>
          </div>

          <UiSwitchToggle
            :modelValue="permission.is_active"
            :disabled="!canUpdatePermissions"
            @change="handleSwitchPermission(permission)"
          />
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
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { debounce } from "~/utils/helper/debounce";

import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

type PermissionItem = {
  id: string;
  name: string;
  is_active: boolean;
};

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();
const adminAuthStore = useAdminAuthStore();

const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const isLoading = ref(false);
const isLoadingSearch = ref(false);
const perPage = ref(6);
const page = ref(1);
const totalRows = ref(0);
const searchFields = ref(["name"]);
const searchFilter = ref("");
const permissionsData = ref<PermissionItem[]>([]);

const canUpdatePermissions = computed(
  () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-permissions")
);

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
    const response = await appCore.permissions.get(params);
    const payload = response?.data?.data ?? {};

    totalRows.value = Number(payload?.total ?? 0);
    permissionsData.value = Array.isArray(payload?.data)
      ? payload.data.map((permission: any) => ({
          id: String(permission?.id ?? ""),
          name: String(permission?.name ?? ""),
          is_active: Boolean(permission?.is_active),
        }))
      : [];

    if (isFilterQuery) {
      page.value = 1;
    }
  } catch {
    totalRows.value = 0;
    permissionsData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleSwitchPermission = async (permission: PermissionItem) => {
  if (!canUpdatePermissions.value) {
    return;
  }

  await appCore.permissions.patch(permission.id, {
    is_active: !permission.is_active,
  });
  useEventBus.emit("loadDataForPermissions");
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
  isLoading.value = true;
  await loadData();
  useEventBus.on("loadDataForPermissions", loadData);
});
</script>
