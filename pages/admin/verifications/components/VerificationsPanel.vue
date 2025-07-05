<template>
  <PanelDefault class="clients-panel">
<!--    <ClientsPanelSearch-->
<!--        @input="handleInputSearch"-->
<!--        :isLoading="isLoadingSearch"-->
<!--        :value="searchFilter"-->
<!--    />-->

<!--    <ClientsContent :data="clientsData" @click="handleOpenClientPage"/>-->

<!--    <PaginationDefault-->
<!--        :isLoading="isLoading"-->
<!--        :perPage="perPage"-->
<!--        :page="page"-->
<!--        :totalRows="totalRows"-->
<!--        @perPageChange="handleChangePerPage"-->
<!--        @pageChange="handleChangePage"-->
<!--    />-->
  </PanelDefault>
</template>

<script lang="ts" setup>
import {onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {debounce} from "~/utils/helper/debounce";
import TableDefault from "~/components/block/tables/TableDefault.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import ClientsPanelSearch from "~/pages/admin/clients/components/ClientsPanelSearch.vue";
import {navigateTo} from "nuxt/app";
import UiIconUser from "~/components/ui/UiIconUser.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import ClientsContent from "~/pages/admin/clients/components/ClientsContent.vue";

const {t} = useI18n({useScope: "global"});
const appCore = useAppCore();

const isLoading = ref(false);
const isLoadingSearch = ref(false);
const perPage = ref(3);
const page = ref(1);
const totalRows = ref(0);
const searchFields = ref([
  'id',
  'email',
  'first_name',
  'last_name',
  'phone',
  'country',
  'city',
  'state',
  'address',
  'postal_code',
  'created_at'
]);
const searchFilter = ref("");

const clientsData = reactive([]);

const loadData = async (isFilterQuery = false) => {
  const params = {
    page: isFilterQuery ? 1 : page.value,
    perPage: perPage.value,
    searchFilter: searchFilter.value,
    searchFields: searchFields.value,
  };

  const response = await appCore.adminModules.clients.get(params);
  totalRows.value = response.data.data.total;

  let responseClientData = response.data.data.data;

  isLoading.value = false;
  clientsData.splice(0, clientsData.length, ...responseClientData);
};

const handleOpenClientPage = (id: string) => {
  navigateTo(`/admin/clients/${id}`);
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

.verifications-panel {
  padding: 20px;

  .panel-search {
    margin-bottom: 20px;
    width: 400px;

    &__input {
      border: none;

      &.input {
        padding: 0 !important;
      }
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
