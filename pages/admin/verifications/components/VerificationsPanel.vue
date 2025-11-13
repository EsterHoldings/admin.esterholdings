<template>
  <PanelDefault class="verifications-panel">

    <div class="verifications-panel__search-wrapper">
      <VerificationsPanelSearch
          @input="handleInputSearch"
          :isLoading="isLoadingSearch"
          :value="searchFilter"
      />
      <div class="verifications-panel__search-wrapper__options">
        <UiButtonDefault state="info--outline--small">+</UiButtonDefault>
        <UiButtonDefault state="info--outline--small">-</UiButtonDefault>
      </div>
    </div>

    <div class="verifications-panel--items">
      <div class="verifications-panel--row" v-for="verificationRequest in verificationRequests">
        <UiImageCircle
            :src="verificationRequest['user']['photo_url']"
            :two-chars="verificationRequest['user']['initials']"
            @click="handleClickVerificationRequest(verificationRequest['user']['id'])"
        />
        <span class="verifications-panel--row__user-info">
          <span class="verifications-panel--row__name">
            {{verificationRequest['user']['first_name']}} {{verificationRequest['user']['last_name']}}
          </span>
          <span class="verifications-panel--row__email">
            {{verificationRequest['user']['email']}}
          </span>
        </span>
        <span>{{verificationRequest['updated_at_human']}}...</span>
        <VerificationActions :status="verificationRequest['state']" />
      </div>
    </div>

<!--    <ClientsContent :data="clientsData" @click="handleOpenClientPage"/>-->

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
import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import VerificationsPanelSearch from "~/pages/admin/verifications/components/VerificationsPanelSearch.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

const {t} = useI18n({useScope: "global"});
const appCore = useAppCore();

const isLoading = ref(false);
const isLoadingSearch = ref(false);
const perPage = ref(5);
const page = ref(1);
const totalRows = ref(0);
const searchFields = ref([
  'id',
  'user_id',
  'data',
  'state',
  'created_at',
  'updated_at',
]);
const searchFilter = ref("");

const verificationRequests = reactive([]);

const loadData = async () => {
  const params = {
    page: page.value,
    perPage: perPage.value,
    searchFilter: searchFilter.value,
    searchFields: searchFields.value,
  };

  const response = await appCore.adminModules.verificationRequests.getAll(params);
  totalRows.value = response.data.data.total;

  let responseVerificationRequestsData = response.data.data.data;

  isLoading.value = false;
  verificationRequests.splice(0, verificationRequests.length, ...responseVerificationRequestsData);
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
    await loadData();
  } finally {
    isLoadingSearch.value = false;
  }
}, 300);

const handleClickVerificationRequest = (id:string) => {
  navigateTo(`/admin/clients/${id}?tab=1`)
}

onMounted(async () => {
  isLoading.value = true;
  await loadData();
  // useEventBus.on("loadDataForAdmins", loadData);
});
</script>

<style lang="scss" scoped>

.verifications-panel {
  padding: 20px;

  &__search-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__options {
      height: 46px;
      min-width: 46px;
      margin-bottom: 20px;
      gap: 10px;

      display: flex;
      align-items: flex-start;
      justify-content: center;

      color: var(--ui-text-main)
    }
  }

  &--items {

  }

  &--row {
    background-color: var(--color-stroke-ui-dark);
    border: 1px solid transparent;
    margin-bottom: 10px;
    border-radius: 10px;
    height: 80px;

    display: grid;
    align-items: center;
    grid-template-columns: 100px 1fr 150px 150px;
    padding: 0 20px;

    &:hover {
      background: none;
      border: 1px solid var(--color-stroke-ui-dark);
    }

    &__user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      height: 50px;
    }

    &__name {
      font-size: 16px;
    }

    &__email {
      font-size: 13px;
      font-weight: bold;
    }
  }

  // --- --- ---

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
