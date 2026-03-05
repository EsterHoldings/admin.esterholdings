<template>
  <PanelDefault class="admins-panel" :title="t('admin.access.components.admins-panel.title')">
    <template #title-extra>
      <UiButtonDefault class="add-btn" @click="handleClickAddRole"
        >+</UiButtonDefault
      >
    </template>
    <PanelSearch
      @input="handleInputSearch"
      :isLoading="isLoadingSearch"
      :value="searchFilter"
    />
    <TableDefault
      :columns="adminsColumns"
      :data="adminsData"
      :isLoading="isLoading"
      :rowsPerPage="5"
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
import { inject, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { debounce } from "~/utils/helper/debounce";
import TableDefault from "~/components/block/tables/TableDefault.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import UiIconEdit from "~/components/ui/UiIconEdit.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import AdminsPanelEdit from "~/pages/admin/access/components/AdminsPanelEdit.vue";
import PanelSearch from "~/pages/admin/access/components/PanelSearch.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import AdminsPanelAddNew from "~/pages/admin/access/components/AdminsPanelAddNew.vue";

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();

const isLoading = ref(false);
const isLoadingSearch = ref(false);
const perPage = ref(5);
const page = ref(1);
const totalRows = ref(0);
const searchFields = ref(["id", "nickname", "email"]);
const searchFilter = ref("");

const { openModal } = inject("modalControl") as { openModal: Function };
const handleClickAddRole = () =>
  openModal(AdminsPanelAddNew, { title: "Add new Admin" });

const adminsColumns = reactive([
  { title: t("admin.access.components.admins-panel.columns.id"), key: "id" },
  {
    title: t("admin.access.components.admins-panel.columns.nickname"),
    key: "nickname",
  },
  {
    title: t("admin.access.components.admins-panel.columns.email"),
    key: "email",
  },
  {
    title: t("admin.access.components.admins-panel.columns.roles"),
    key: "roles",
  },
  {
    title: t("admin.access.components.admins-panel.columns.createdAt"),
    key: "created_at",
  },
  {
    title: t("admin.access.components.admins-panel.columns.options"),
    key: "options",
  },
]);

const adminsData = reactive([]);

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
    const response = await appCore.admins.get(params);
    const payload = response?.data?.data ?? {};

    totalRows.value = Number(payload?.total ?? 0);

    const responseAdminsData = Array.isArray(payload?.data) ? payload.data : [];
    responseAdminsData.forEach((user: any) => {
      const userId = String(user?.id ?? "");

      user.id = [
        {
          is: UiTextParagraph,
          props: {},
          events: { click: () => console.log(userId) },
          slot: userId,
        },
      ];

      user.roles = Array.isArray(user?.roles)
        ? user.roles.map((role: any) => role?.name).filter(Boolean)
        : [];

      user.options = [
        {
          isIcon: true,
          is: UiIconEdit,
          props: {},
          events: { click: () => handleOpenClientPage(userId) },
        },
      ];
    });

    adminsData.splice(0, adminsData.length, ...responseAdminsData);
  } catch {
    totalRows.value = 0;
    adminsData.splice(0, adminsData.length);
  } finally {
    isLoading.value = false;
  }
};

const handleOpenClientPage = (id: string) => {
  openModal(AdminsPanelAddNew, {
    title: t("admin.access.components.admins-panel.actions.addNewAdmin"),
  });
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

const handleInputSearch = debounce(async (value: any) => {
  try {
    isLoadingSearch.value = true;
    searchFilter.value = value;
    await loadData(true);
  } finally {
    isLoadingSearch.value = false;
  }
}, 300);

onMounted(async () => {
  isLoading.value = true;
  await loadData();
  useEventBus.on("loadDataForAdmins", loadData);
});
</script>

<style lang="scss" scoped>
.admins-panel {
  padding: 10px;
}

.panel-search {
  border: none;
  border-radius: 0;
  margin-bottom: 0;

  &__input {
    border: none;

    &.input {
      padding: 0 !important;
    }
  }
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
