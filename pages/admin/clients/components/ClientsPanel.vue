<template>
  <div class="flex w-full flex-col gap-3 text-[var(--ui-text-main)]">
    <PageStructureContent :plain="viewMode !== 'table'">
      <template #top>
        <div class="flex w-full flex-col gap-2 md:flex-row md:items-center">
          <div class="flex w-full flex-1 min-w-[260px] items-center gap-2">
            <UiInput
              class="w-full"
              :placeholder="t('admin.access.components.admins-panel-search.placeholder')"
              @input="handleInputSearch"
              :value="searchFilter"
            >
              <template #icon-left>
                <UiIconSearch />
              </template>
            </UiInput>
            <UiButtonDefault state="info--small" class="!w-[44px]" @click="loadData">
              <UiIconUpdate :spinning="isLoading" />
            </UiButtonDefault>
          </div>

          <div class="flex w-full flex-1 items-center gap-2 md:w-auto md:flex-none md:justify-end">
            <UiSelect
              class="min-w-[180px] sm:w-[200px]"
              :value="orderBy"
              :data="sortByOptions"
              :withoutNoSelect="true"
              @change="handleOrderBy"
            >
              <template #icon-left>
                <UiIconSortBy class="!h-4 !w-4" :orderDirectionEnabled="true" :orderDirection="orderDirection" />
              </template>
            </UiSelect>

            <ViewModeToggle
              class="w-full sm:w-auto"
              bordered
              :modelValue="viewMode"
              :options="viewOptions"
              @update:modelValue="viewMode = $event"
            />
          </div>
        </div>
      </template>

      <template #content>
        <div>
          <div v-if="viewMode !== 'table'" class="relative">
            <div
              class="backdrop-blur-[2px] w-full absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              v-if="isLoading && !isInitialLoading"
            >
              <UiIconSpinnerDefault />
            </div>
            <ClientsContent
              :data="clientsData"
              :viewMode="viewMode"
              @click="handleOpenClientPage"
            />
          </div>

          <div v-else class="relative">
            <div
              class="backdrop-blur-sm bg-[var(--ui-background)]/40 w-full absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              v-if="isLoading && !isInitialLoading"
            >
              <UiIconSpinnerDefault />
            </div>

            <template v-if="clientsData.length">
              <TableMain>
                <template #thead>
                  <tr>
                    <th class="px-4 py-3 text-left font-normal">
                      {{ t("admin.accounts.components.accounts-panel.columns.name") }}
                    </th>
                    <th class="px-4 py-3 text-left font-normal">
                      {{ t("admin.accounts.components.accounts-panel.columns.email") }}
                    </th>
                    <th class="px-4 py-3 text-left font-normal">
                      {{ t("admin.accounts.components.accounts-panel.columns.phone") }}
                    </th>
                    <th class="px-4 py-3 text-left font-normal">
                      {{ t("admin.accounts.components.accounts-panel.columns.created_at") }}
                    </th>
                    <th class="px-4 py-3 text-center font-normal w-[60px]">ID</th>
                  </tr>
                </template>

                <template #tbody>
                  <tr
                    v-for="client in clientsData"
                    :key="client.id"
                    class="border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)]"
                  >
                    <td class="px-4 py-3 font-semibold truncate max-w-[200px]" :title="fullName(client)">
                      {{ fullName(client) }}
                    </td>
                    <td class="px-4 py-3 truncate max-w-[220px]" :title="client.email">
                      {{ client.email || "-" }}
                    </td>
                    <td class="px-4 py-3 truncate max-w-[160px]" :title="client.phone">
                      {{ client.phone || "-" }}
                    </td>
                    <td class="px-4 py-3 text-xs whitespace-nowrap">
                      {{ formatDate(client.created_at) }}
                    </td>
                    <td class="px-2 py-3 flex items-center justify-center">
                      <UiIconCopy v-if="client.id" :text="client.id" />
                      <span v-else>-</span>
                    </td>
                  </tr>
                </template>
              </TableMain>
            </template>

            <div
              v-else-if="!isLoading && !isInitialLoading"
              class="h-[32vh] flex items-center justify-center text-[var(--ui-text-main)]"
            >
              {{ t("cabinet.billing.nothingToShow") }}
            </div>
          </div>
        </div>
      </template>
    </PageStructureContent>

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
import {h, onMounted, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {debounce} from "~/utils/helper/debounce";
import TableMain from "~/components/block/tables/TableMain.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import {navigateTo} from "nuxt/app";
import ClientsContent from "~/pages/admin/clients/components/ClientsContent.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";

const {t} = useI18n({useScope: "global"});
const appCore = useAppCore();

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";
const VIEW_MODE_STORAGE_KEY = "adminClientsViewMode";

const isLoading = ref(false);
const isInitialLoading = ref(true);
const isLoadingSearch = ref(false);
const perPage = ref(6);
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
const orderBy = ref<string>("created_at");
const orderDirection = ref<string>(ORDER_DIRECTION_DESC);

const clientsData = reactive([]);
const viewMode = ref<"cards" | "table" | "full">("table");
const viewOptions = [
  {
    value: "table" as const,
    label: t("cabinet.billing.view.list") || "List",
    icon: {
      render() {
        return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
          h("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
          h("line", { x1: "3", y1: "6", x2: "4", y2: "6" }),
          h("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
          h("line", { x1: "3", y1: "12", x2: "4", y2: "12" }),
          h("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
          h("line", { x1: "3", y1: "18", x2: "4", y2: "18" }),
        ]);
      },
    },
  },
  {
    value: "cards" as const,
    label: t("cabinet.billing.view.cards") || "Cards",
    icon: {
      render() {
        return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
          h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
          h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
          h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
          h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }),
        ]);
      },
    },
  },
  {
    value: "full" as const,
    label: t("cabinet.billing.view.full") || "Full width",
    icon: {
      render() {
        return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
          h("rect", { x: "3", y: "6", width: "18", height: "4", rx: "1" }),
          h("rect", { x: "3", y: "14", width: "18", height: "4", rx: "1" }),
        ]);
      },
    },
  },
];

const sortByOptions = reactive([
  {id: "created_at", value: "created_at", text: t("admin.accounts.components.accounts-panel.columns.created_at")},
  {id: "first_name", value: "first_name", text: t("admin.accounts.components.accounts-panel.columns.name")},
  {id: "email", value: "email", text: t("admin.accounts.components.accounts-panel.columns.email")},
]);

const loadData = async (isFilterQuery = false) => {
  isLoading.value = true;
  const params = {
    page: isFilterQuery ? 1 : page.value,
    perPage: perPage.value,
    searchFilter: searchFilter.value,
    searchFields: searchFields.value,
    orderBy: orderBy.value,
    orderDirection: orderDirection.value,
  };

  const response = await appCore.adminModules.clients.get(params);
  totalRows.value = response.data.data.total;

  const responseClientData = response.data.data.data;

  isLoading.value = false;
  clientsData.splice(0, clientsData.length, ...responseClientData);
};

const handleOpenClientPage = (id: string) => {
  navigateTo(`/clients/${id}`);
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

const handleOrderBy = async (value: string) => {
  orderDirection.value =
      orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
  orderBy.value = value;
  await loadData();
};

const fullName = (client: any) =>
  `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() || "-";

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return isNaN(d.getTime()) ? date : d.toLocaleString();
};

const initViewMode = () => {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  if (saved && ["table", "cards", "full"].includes(saved)) {
    viewMode.value = saved as typeof viewMode.value;
  }
};

watch(viewMode, (mode) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
});

onMounted(async () => {
  isLoading.value = true;
  initViewMode();
  await loadData();
  isInitialLoading.value = false;
  useEventBus.on("loadDataForAdmins", loadData);
});
</script>
