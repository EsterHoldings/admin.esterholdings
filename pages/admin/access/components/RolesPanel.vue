<template>
  <PanelDefault class="roles-panel" :title="t('admin.access.components.roles-panel.title')">
    <template #title-extra>
      <UiButtonDefault
          class="add-btn"
          @click="handleClickAddRole"
      >+
      </UiButtonDefault>
    </template>
    <RolesPanelSearch
        @input="handleInputSearch"
        :isLoading="isLoadingSearch"
        :value="searchFilter"
    />
    <TableDefault
        :columns="rolesColumns"
        :data="rolesData"
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
import {ref, inject, onMounted, onUnmounted, computed} from "vue";
import {useI18n} from "vue-i18n";
import TableDefault from "~/components/block/tables/TableDefault.vue";
import UiIconEdit from "~/components/ui/UiIconEdit.vue";
import UiIconDelete from "~/components/ui/UiIconDelete.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import RolesPanelAddNew from "~/pages/admin/access/components/RolesPanelAddNew.vue";
import RolesPanelEdit from "~/pages/admin/access/components/RolesPanelEdit.vue";
import RolesPanelSearch from "~/pages/admin/access/components/RolesPanelSearch.vue";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import {debounce} from "~/utils/helper/debounce";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

interface IPermissionItem {
  name: string;
}

const {t} = useI18n({useScope: "global"});
const appCore = useAppCore();

const isLoading = ref(true);
const isLoadingSearch = ref(false);
const perPage = ref(3);
const page = ref(1);
const totalRows = ref(0);
const searchFields = ref(["name"]);
const searchFilter = ref("");

const {openModal} = inject("modalControl") as { openModal: Function };

// const rolesColumns = ref([
//   { title: "Name", key: "name" },
//   { title: "Permissions", key: "permissions" },
//   { title: "", key: "options" },
// ]);

const rolesColumns = computed(() => [
  {title: t("admin.access.components.roles-panel.columns.name"), key: "name"},
  {
    title: t("admin.access.components.roles-panel.columns.permissions"),
    key: "permissions",
  },
  {title: "", key: "options"},
]);

const rolesData = ref([]);

const handleClickEditIcon = (id: string) =>
    openModal(RolesPanelEdit, {
      title: t("admin.access.components.roles-panel.editTitle"),
      id,
    });

const handleClickDeleteIcon = async (id: string) => {
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

  const response = await appCore.roles.get(params);

  totalRows.value = response.data.data.total;
  rolesData.value = response.data.data.data;

  rolesData.value.forEach((role) => {
    role.permissions = [
      ...role.permissions.map((permission: IPermissionItem) => permission.name),
    ];
    role.options = [
      {
        isIcon: true,
        is: UiIconEdit,
        props: {},
        events: {click: () => handleClickEditIcon(role.id)},
      },
      {
        isIcon: true,
        is: UiIconDelete,
        props: {},
        events: {click: () => handleClickDeleteIcon(role.id)},
      },
    ];
  });

  isLoading.value = false;
};

const handleClickAddRole = () =>
    openModal(RolesPanelAddNew, {
      title: t("admin.access.components.roles-panel.addTitle"),
    });

const handleInputSearch = debounce(async (value: any) => {
  try {
    isLoadingSearch.value = true;
    searchFilter.value = value;
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

onUnmounted(async () => {
});
</script>

<style lang="scss" scoped>
.roles-panel {
  padding: 10px;
}

.add-btn {
  background-color: var(--color-stroke-ui-dark);
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.1s;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.5;
  }
}
</style>
