<template>
  <PanelDefault :title="t('admin.accounts.components.accounts-panel.title')">
    <template #title-extra>
      <div class="add-btn" @click="handleClickAddRole">+</div>
    </template>

    <AccountsPanelSearch
      @input="handleInputSearch"
      :isLoading="isLoadingSearch"
      :value="searchFilter"
    />

    <TableDefault
      :columns="accoutsColumns"
      :data="data"
      :isLoading="isLoading"
      :rowsPerPage="15"
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
import { useI18n } from "vue-i18n";
import { computed, inject, onMounted, reactive } from "vue";
import useAppCore from "~/composables/useAppCore";

import AccountsPanelSearch from "~/pages/admin/accounts/components/AccountsPanelSearch.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import TableDefault from "~/components/block/tables/TableDefault.vue";

import {
  page,
  perPage,
  totalRows,
  isLoading,
  isLoadingSearch,
  searchFilter,
  accoutsColumns,
  accountsData,
} from "~/pages/admin/accounts/composables";

// import {
//   handleInputSearch,
//   handleChangePage,
//   handleChangePerPage,
//   loadData,
//   handleClickDeleteIcon,
// } from "~/pages/admin/accounts/composables/setup";

import { useAccountsMethods } from "~/pages/admin/accounts/composables/setup";

const {
  loadData,
  handleClickDeleteIcon,
  handleChangePage,
  handleChangePerPage,
  handleInputSearch,
} = useAccountsMethods();
import AccountsPanelEdit from "~/pages/admin/accounts/components/AccountsPanelEdit.vue";
import AccountsPanelAddNew from "~/pages/admin/accounts/components/AccountsPanelAddNew.vue";
import UiIconEdit from "~/components/ui/UiIconEdit.vue";
import UiIconDelete from "~/components/ui/UiIconDelete.vue";

const { t } = useI18n({ useScope: "global" });
const { openModal } = inject("modalControl") as { openModal: Function };

const appCore = useAppCore();

const handleClickAddRole = () =>
  openModal(AccountsPanelAddNew, {
    title: t("admin.accounts.components.accounts-panel.addTitle"),
  });

const handleClickEditIcon = (id: string) =>
  openModal(AccountsPanelEdit, {
    title: t("admin.accounts.components.accounts-panel.editTitle"),
    id,
  });

const extendClientData = () => {
  accountsData.forEach((client) => {
    client.options = [
      {
        isIcon: true,
        is: UiIconEdit,
        props: {},
        events: { click: () => handleClickEditIcon(client.id) },
      },
      {
        isIcon: true,
        is: UiIconDelete,
        props: {},
        events: { click: () => handleClickDeleteIcon(client.id) },
      },
    ];
  });
};

const data = computed(() => {
  extendClientData();
  Object.assign(accountsData, accountsData);

  return accountsData;
});

const accoutsColumns = reactive([
  {
    title: t("admin.accounts.components.accounts-panel.columns.id"),
    key: "id",
  },
  {
    title: t("admin.accounts.components.accounts-panel.columns.name"),
    key: "name",
  },
  {
    title: t("admin.accounts.components.accounts-panel.columns.email"),
    key: "email",
  },
  {
    title: t("admin.accounts.components.accounts-panel.columns.phone"),
    key: "phone",
  },
  {
    title: t("admin.accounts.components.accounts-panel.columns.created_at"),
    key: "created_at",
  },
  {
    title: t("admin.accounts.components.accounts-panel.columns.options"),
    key: "options",
  },
]);

onMounted(async () => {
  await loadData();
});
</script>

<style lang="scss" scoped>
.add-btn {
  background-color: var(--color-secondary);
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
