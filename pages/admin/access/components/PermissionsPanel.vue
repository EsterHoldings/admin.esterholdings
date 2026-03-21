<template>
  <PanelDefault class="permissions-panel" :title="t('admin.access.components.permissions-panel.title')">
    <TableDefault
      :columns="permissionsColumns"
      :data="permissionsData"
      :isLoading="isLoading"
      :rowsPerPage="4"
    />
    <PaginationDefault
      :isLoading="isLoading"
      :perPage="perPage"
      :page="page"
      :totalRows="totalRows"
      @perPageChange="handleChangePerPage"
      @pageChange="handleChangePage"
    />
  </PanelDefault>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
import TableDefault from "~/components/block/tables/TableDefault.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";

import useAppCore from "~/composables/useAppCore";
import { onMounted, reactive, ref } from "vue";
import useEventBus from "~/composables/useEventBus";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();
const adminAuthStore = useAdminAuthStore();

const isLoading = ref(false);
const isLoadingSearch = ref(false);
const perPage = ref(3);
const page = ref(1);
const totalRows = ref(0);
const searchFields = ref(["name"]);
const searchFilter = ref("");

// const permissionsColumns = reactive([
//   { title: "Id", key: "id" },
//   { title: "Name", key: "name" },
//   { title: "", key: "options" },
// ]);

const permissionsColumns = computed(() => [
  // {
  //   title: t("admin.access.components.permissions-panel.columns.id"),
  //   key: "id",
  // },
  {
    title: t("admin.access.components.permissions-panel.columns.name"),
    key: "name",
  },
  { title: "", key: "options" },
]);

let permissionsData = reactive([]);
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

    const responsePermissionsData = Array.isArray(payload?.data)
      ? payload.data
      : [];

    responsePermissionsData.forEach((permission: any) => {
      permission.options = [
        {
          is: UiSwitchToggle,
          props: {
            modelValue: permission.is_active,
            disabled: !canUpdatePermissions.value,
          },
          events: { click: () => handleSwitchPermission(permission) },
        },
      ];
    });

    permissionsData.splice(0, permissionsData.length, ...responsePermissionsData);
  } catch {
    totalRows.value = 0;
    permissionsData.splice(0, permissionsData.length);
  } finally {
    isLoading.value = false;
  }
};

const handleSwitchPermission = async (permission: any) => {
  if (!canUpdatePermissions.value) {
    return;
  }

  await appCore.permissions.patch(permission.id, {
    is_active: !permission.is_active,
  });
  useEventBus.emit("loadDataForPermissions");
};

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

<style lang="scss" scoped>
.permissions-panel {
  padding: 10px;
}

.panel-search {
  border: none;
  border-radius: 0;
  margin-bottom: 0;

  &__input {
    border: none;
  }
}
</style>
