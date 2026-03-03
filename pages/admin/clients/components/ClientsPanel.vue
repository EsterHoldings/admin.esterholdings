<template>
  <div class="flex w-full flex-col gap-3 text-[var(--ui-text-main)]">
    <div class="clients-stats-grid">
      <div
        v-for="card in metricCards"
        :key="card.id"
        class="clients-stat-card"
        :class="card.kind">
        <div class="clients-stat-card__label">{{ card.label }}</div>
        <div class="clients-stat-card__value">{{ card.value }}</div>
      </div>
    </div>

    <PageStructureContent :plain="viewMode !== 'table'">
      <template #top>
        <div class="flex w-full flex-col gap-2">
          <div class="flex w-full flex-col gap-2 xl:flex-row xl:items-center">
            <div class="flex w-full flex-1 min-w-[260px] items-center gap-2">
              <UiInput
                class="w-full"
                :placeholder="t('admin.clients.components.clients-panel-search.placeholder', 'Search clients...')"
                @input="handleInputSearch"
                :value="searchFilter">
                <template #icon-left>
                  <UiIconSearch />
                </template>
              </UiInput>

              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="handleClickRefresh">
                <UiIconUpdate :spinning="isLoading || isStatsLoading" />
              </UiButtonDefault>
            </div>

            <div class="flex w-full flex-1 items-center gap-2 xl:w-auto xl:flex-none xl:justify-end">
              <UiSelect
                class="min-w-[160px] sm:w-[200px]"
                :value="orderBy"
                :data="sortByOptions"
                :withoutNoSelect="true"
                @change="handleOrderBy" />

              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="toggleOrderDirection">
                <UiIconSortBy
                  class="!h-4 !w-4"
                  :orderDirectionEnabled="true"
                  :orderDirection="orderDirection" />
              </UiButtonDefault>

              <ViewModeToggle
                class="w-full sm:w-auto"
                bordered
                :modelValue="viewMode"
                :options="viewOptions"
                @update:modelValue="handleChangeViewMode" />

              <div
                ref="filtersPopoverRef"
                class="relative">
                <UiButtonDefault
                  state="info--small"
                  class="!w-[44px]"
                  @click.stop="toggleFiltersPopover">
                  <UiIconFilters class="!h-4 !w-4" />
                </UiButtonDefault>

                <div
                  v-if="isFiltersPopoverOpen"
                  class="clients-filters-popover"
                  @click.stop>
                  <div class="clients-filters-popover__title">
                    {{ t("admin.clients.filters.title", "Search filters") }}
                  </div>

                  <div class="clients-filters-popover__list">
                    <label
                      v-for="item in searchFieldOptions"
                      :key="item.value"
                      class="clients-filters-popover__item">
                      <input
                        type="checkbox"
                        :checked="draftSearchFields.includes(item.value)"
                        @change="toggleDraftSearchField(item.value)" />
                      <span>{{ item.label }}</span>
                    </label>
                  </div>

                  <div class="clients-filters-popover__actions">
                    <UiButtonDefault
                      state="info--small"
                      class="!w-full"
                      @click="resetDraftFilters">
                      {{ t("admin.clients.filters.reset", "Reset") }}
                    </UiButtonDefault>
                    <UiButtonDefault
                      state="info--small"
                      class="!w-full"
                      @click="applyDraftFilters">
                      {{ t("admin.clients.filters.apply", "Apply") }}
                    </UiButtonDefault>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="selectedSearchFields.length"
            class="clients-filter-chips">
            <button
              v-for="field in selectedSearchFields"
              :key="field"
              type="button"
              class="clients-filter-chip"
              @click="removeSearchField(field)">
              <span>{{ getSearchFieldLabel(field) }}</span>
              <span class="clients-filter-chip__remove">×</span>
            </button>

            <button
              type="button"
              class="clients-filter-chip clients-filter-chip--clear"
              @click="clearAllAppliedFilters">
              {{ t("admin.clients.filters.clearAll", "Clear all") }}
            </button>
          </div>
        </div>
      </template>

      <template #content>
        <div>
          <div
            v-if="viewMode !== 'table'"
            class="relative">
            <div
              class="backdrop-blur-[2px] w-full absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              v-if="isLoading && !isInitialLoading">
              <UiIconSpinnerDefault />
            </div>
            <ClientsContent
              :data="clientsData"
              :viewMode="viewMode"
              @click="handleOpenClientPage" />
          </div>

          <div
            v-else
            class="relative">
            <div
              class="backdrop-blur-sm bg-[var(--ui-background)]/40 w-full absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              v-if="isLoading && !isInitialLoading">
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
                    class="border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)] cursor-pointer"
                    @click="handleOpenClientPage(client.id)">
                    <td class="px-4 py-3 max-w-[280px]">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="relative shrink-0">
                          <UiImageCircle
                            :twoChars="getTwoCharsByFullName(client.first_name, client.last_name)"
                            :src="client.photo_url" />
                          <span
                            class="clients-online-dot"
                            :class="client.is_online ? 'is-online' : 'is-offline'" />
                        </div>

                        <div class="min-w-0">
                          <div
                            class="font-semibold truncate"
                            :title="fullName(client)">
                            {{ fullName(client) }}
                          </div>
                          <div class="text-xs text-[var(--ui-text-secondary)]">
                            {{
                              client.is_online
                                ? t("admin.clients.online.onlineNow", "Online")
                                : t("admin.clients.online.offlineNow", "Offline")
                            }}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      class="px-4 py-3 truncate max-w-[220px]"
                      :title="client.email">
                      {{ client.email || "-" }}
                    </td>
                    <td
                      class="px-4 py-3 truncate max-w-[160px]"
                      :title="client.phone">
                      {{ client.phone || "-" }}
                    </td>
                    <td class="px-4 py-3 text-xs whitespace-nowrap">
                      {{ formatDate(client.created_at) }}
                    </td>
                    <td
                      class="px-2 py-3"
                      @click.stop>
                      <div class="flex items-center justify-center">
                        <UiIconCopy
                          v-if="client.id"
                          :text="client.id" />
                        <span v-else>-</span>
                      </div>
                    </td>
                  </tr>
                </template>
              </TableMain>
            </template>

            <div
              v-else-if="!isLoading && !isInitialLoading"
              class="h-[32vh] flex items-center justify-center text-[var(--ui-text-main)]">
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
      @pageChange="handleChangePage" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, h, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { debounce } from "~/utils/helper/debounce";
  import { navigateTo } from "nuxt/app";
  import { useLocalePath } from "~/.nuxt/imports";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";

  import TableMain from "~/components/block/tables/TableMain.vue";
  import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
  import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
  import ClientsContent from "~/pages/admin/clients/components/ClientsContent.vue";
  import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import UiIconFilters from "~/components/ui/UiIconFilters.vue";

  type ViewMode = "cards" | "table" | "full";

  interface AdminClient {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    created_at?: string;
    photo_url?: string;
    is_online?: boolean;
  }

  interface ClientsStats {
    online_clients_now: number;
    new_clients: {
      today: number;
      week: number;
      month: number;
    };
    deposits_sum: {
      today: number;
      week: number;
      month: number;
      year: number;
    };
  }

  const ORDER_DIRECTION_ASC = "asc";
  const ORDER_DIRECTION_DESC = "desc";
  const VIEW_MODE_STORAGE_KEY = "adminClientsViewMode";
  const ONLINE_REFRESH_INTERVAL_MS = 10_000;

  const ALL_SEARCH_FIELDS = [
    "id",
    "email",
    "first_name",
    "last_name",
    "phone",
    "birthdate",
    "country",
    "state",
    "city",
    "address",
    "postal_code",
    "created_at",
  ];

  const { t, locale } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const appCore = useAppCore();

  const isLoading = ref(false);
  const isInitialLoading = ref(true);
  const isLoadingSearch = ref(false);
  const isStatsLoading = ref(false);

  const perPage = ref(6);
  const page = ref(1);
  const totalRows = ref(0);
  const searchFilter = ref("");

  const orderBy = ref<string>("created_at");
  const orderDirection = ref<string>(ORDER_DIRECTION_DESC);
  const viewMode = ref<ViewMode>("table");

  const clientsData = ref<AdminClient[]>([]);
  const statsData = ref<ClientsStats>({
    online_clients_now: 0,
    new_clients: {
      today: 0,
      week: 0,
      month: 0,
    },
    deposits_sum: {
      today: 0,
      week: 0,
      month: 0,
      year: 0,
    },
  });

  const selectedSearchFields = ref<string[]>([]);
  const draftSearchFields = ref<string[]>([]);
  const isFiltersPopoverOpen = ref(false);
  const filtersPopoverRef = ref<HTMLElement | null>(null);

  let pollingTimer: ReturnType<typeof setInterval> | null = null;

  const searchFieldOptions = computed(() => [
    { value: "id", label: "ID" },
    { value: "email", label: t("admin.accounts.components.accounts-panel.columns.email") },
    { value: "first_name", label: t("admin.clients.components.clients-panel.columns.first_name", "First name") },
    { value: "last_name", label: t("admin.clients.components.clients-panel.columns.last_name", "Last name") },
    { value: "phone", label: t("admin.accounts.components.accounts-panel.columns.phone") },
    { value: "birthdate", label: t("admin.clients.columns.birthdate", "Birthdate") },
    { value: "country", label: t("admin.clients.columns.country", "Country") },
    { value: "state", label: t("admin.clients.columns.state", "State") },
    { value: "city", label: t("admin.clients.columns.city", "City") },
    { value: "address", label: t("admin.clients.columns.address", "Address") },
    { value: "postal_code", label: t("admin.clients.columns.postalCode", "Postal code") },
    { value: "created_at", label: t("admin.accounts.components.accounts-panel.columns.created_at") },
  ]);

  const sortByOptions = computed(() => [
    { id: "created_at", value: "created_at", text: t("admin.accounts.components.accounts-panel.columns.created_at") },
    { id: "first_name", value: "first_name", text: t("admin.accounts.components.accounts-panel.columns.name") },
    { id: "email", value: "email", text: t("admin.accounts.components.accounts-panel.columns.email") },
  ]);

  const viewOptions = computed(() => [
    {
      value: "table" as const,
      label: t("cabinet.billing.view.list") || "List",
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
              h("line", { x1: "3", y1: "6", x2: "4", y2: "6" }),
              h("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
              h("line", { x1: "3", y1: "12", x2: "4", y2: "12" }),
              h("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
              h("line", { x1: "3", y1: "18", x2: "4", y2: "18" }),
            ]
          );
        },
      },
    },
    {
      value: "cards" as const,
      label: t("cabinet.billing.view.cards") || "Cards",
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }),
            ]
          );
        },
      },
    },
    {
      value: "full" as const,
      label: t("cabinet.billing.view.full") || "Full width",
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("rect", { x: "3", y: "6", width: "18", height: "4", rx: "1" }),
              h("rect", { x: "3", y: "14", width: "18", height: "4", rx: "1" }),
            ]
          );
        },
      },
    },
  ]);

  const effectiveSearchFields = computed(() => {
    return selectedSearchFields.value.length ? selectedSearchFields.value : ALL_SEARCH_FIELDS;
  });

  const metricCards = computed(() => [
    {
      id: "online_now",
      kind: "is-online",
      label: t("admin.clients.stats.onlineNow", "Online now"),
      value: formatCount(statsData.value.online_clients_now),
    },
    {
      id: "new_today",
      kind: "is-neutral",
      label: t("admin.clients.stats.newToday", "New clients today"),
      value: formatCount(statsData.value.new_clients.today),
    },
    {
      id: "new_week",
      kind: "is-neutral",
      label: t("admin.clients.stats.newWeek", "New clients week"),
      value: formatCount(statsData.value.new_clients.week),
    },
    {
      id: "new_month",
      kind: "is-neutral",
      label: t("admin.clients.stats.newMonth", "New clients month"),
      value: formatCount(statsData.value.new_clients.month),
    },
    {
      id: "deposits_today",
      kind: "is-money",
      label: t("admin.clients.stats.depositsToday", "Deposits today"),
      value: formatMoney(statsData.value.deposits_sum.today),
    },
    {
      id: "deposits_week",
      kind: "is-money",
      label: t("admin.clients.stats.depositsWeek", "Deposits week"),
      value: formatMoney(statsData.value.deposits_sum.week),
    },
    {
      id: "deposits_month",
      kind: "is-money",
      label: t("admin.clients.stats.depositsMonth", "Deposits month"),
      value: formatMoney(statsData.value.deposits_sum.month),
    },
    {
      id: "deposits_year",
      kind: "is-money",
      label: t("admin.clients.stats.depositsYear", "Deposits year"),
      value: formatMoney(statsData.value.deposits_sum.year),
    },
  ]);

  const initViewMode = () => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved && ["table", "cards", "full"].includes(saved)) {
      viewMode.value = saved as ViewMode;
    }
  };

  const loadData = async ({ resetPage = false, silent = false }: { resetPage?: boolean; silent?: boolean } = {}) => {
    if (resetPage) {
      page.value = 1;
    }

    if (!silent) {
      isLoading.value = true;
    }

    try {
      const params = {
        page: page.value,
        perPage: perPage.value,
        searchFilter: searchFilter.value,
        searchFields: effectiveSearchFields.value,
        orderBy: orderBy.value,
        orderDirection: orderDirection.value,
      };

      const response = await appCore.adminModules.clients.get(params);
      const payload = response?.data?.data ?? {};

      totalRows.value = Number(payload?.total ?? 0);
      clientsData.value = Array.isArray(payload?.data) ? payload.data : [];
    } catch {
      if (!silent) {
        totalRows.value = 0;
        clientsData.value = [];
      }
    } finally {
      if (!silent) {
        isLoading.value = false;
      }
    }
  };

  const loadStats = async (silent = false) => {
    if (!silent) {
      isStatsLoading.value = true;
    }

    try {
      const response = await appCore.adminModules.clients.getStats();
      const payload = response?.data?.data ?? {};

      statsData.value = {
        online_clients_now: Number(payload?.online_clients_now ?? 0),
        new_clients: {
          today: Number(payload?.new_clients?.today ?? 0),
          week: Number(payload?.new_clients?.week ?? 0),
          month: Number(payload?.new_clients?.month ?? 0),
        },
        deposits_sum: {
          today: Number(payload?.deposits_sum?.today ?? 0),
          week: Number(payload?.deposits_sum?.week ?? 0),
          month: Number(payload?.deposits_sum?.month ?? 0),
          year: Number(payload?.deposits_sum?.year ?? 0),
        },
      };
    } catch {
      // keep previous stats silently
    } finally {
      if (!silent) {
        isStatsLoading.value = false;
      }
    }
  };

  const loadAll = async () => {
    await Promise.all([loadData(), loadStats()]);
  };

  const handleOpenClientPage = (id?: string) => {
    if (!id) return;

    navigateTo(localePath(`/clients/${id}`));
  };

  const handleChangePerPage = async (value: number) => {
    perPage.value = value;
    await loadData({ resetPage: true });
  };

  const handleChangePage = async (value: number) => {
    page.value = value;
    await loadData();
  };

  const handleInputSearch = debounce(async (value: string) => {
    try {
      isLoadingSearch.value = true;
      searchFilter.value = value;
      await loadData({ resetPage: true });
    } finally {
      isLoadingSearch.value = false;
    }
  }, 300);

  const handleOrderBy = async (value: string) => {
    orderBy.value = value;
    await loadData();
  };

  const toggleOrderDirection = async () => {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
    await loadData();
  };

  const handleChangeViewMode = (value: string) => {
    if (value === "table" || value === "cards" || value === "full") {
      viewMode.value = value;
    }
  };

  const handleClickRefresh = async () => {
    await loadAll();
  };

  const toggleFiltersPopover = () => {
    if (!isFiltersPopoverOpen.value) {
      draftSearchFields.value = [...selectedSearchFields.value];
    }

    isFiltersPopoverOpen.value = !isFiltersPopoverOpen.value;
  };

  const toggleDraftSearchField = (value: string) => {
    if (draftSearchFields.value.includes(value)) {
      draftSearchFields.value = draftSearchFields.value.filter(field => field !== value);
      return;
    }

    draftSearchFields.value = [...draftSearchFields.value, value];
  };

  const resetDraftFilters = () => {
    draftSearchFields.value = [];
  };

  const applyDraftFilters = async () => {
    selectedSearchFields.value = Array.from(new Set(draftSearchFields.value));
    isFiltersPopoverOpen.value = false;
    await loadData({ resetPage: true });
  };

  const removeSearchField = async (field: string) => {
    selectedSearchFields.value = selectedSearchFields.value.filter(item => item !== field);
    await loadData({ resetPage: true });
  };

  const clearAllAppliedFilters = async () => {
    selectedSearchFields.value = [];
    await loadData({ resetPage: true });
  };

  const getSearchFieldLabel = (field: string) => {
    const target = searchFieldOptions.value.find(item => item.value === field);
    return target?.label ?? field;
  };

  const handleClickOutsideFilters = (event: MouseEvent) => {
    if (!isFiltersPopoverOpen.value) return;

    const target = event.target as Node | null;
    if (!target) return;

    if (filtersPopoverRef.value && !filtersPopoverRef.value.contains(target)) {
      isFiltersPopoverOpen.value = false;
    }
  };

  const startPolling = () => {
    if (pollingTimer) return;

    pollingTimer = setInterval(() => {
      loadData({ silent: true }).catch(() => {});
      loadStats(true).catch(() => {});
    }, ONLINE_REFRESH_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (!pollingTimer) return;

    clearInterval(pollingTimer);
    pollingTimer = null;
  };

  const handleExternalReload = async () => {
    await loadAll();
  };

  const fullName = (client: AdminClient) => `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() || "-";

  const getTwoCharsByFullName = (firstName?: string, lastName?: string): string => {
    const firstInitial = String(firstName ?? "").charAt(0);
    const lastInitial = String(lastName ?? "").charAt(0);
    return `${firstInitial}${lastInitial}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const d = new Date(date);
    if (isNaN(d.getTime())) return date;

    return d.toLocaleString(locale.value || undefined);
  };

  const formatCount = (value: number) => {
    return Number(value || 0).toLocaleString(locale.value || undefined);
  };

  const formatMoney = (value: number) => {
    const numericValue = Number(value || 0);
    return `$ ${numericValue.toLocaleString(locale.value || undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  watch(viewMode, mode => {
    if (typeof window === "undefined") return;
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  });

  onMounted(async () => {
    initViewMode();
    await loadAll();
    isInitialLoading.value = false;

    useEventBus.on("loadDataForAdmins", handleExternalReload);
    startPolling();

    document.addEventListener("click", handleClickOutsideFilters);
  });

  onBeforeUnmount(() => {
    useEventBus.off("loadDataForAdmins", handleExternalReload);
    stopPolling();
    document.removeEventListener("click", handleClickOutsideFilters);
  });
</script>

<style scoped lang="scss">
  .clients-stats-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  @media (min-width: 768px) {
    .clients-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1400px) {
    .clients-stats-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .clients-stat-card {
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    background: var(--ui-background-panel);
    padding: 12px;
  }

  .clients-stat-card.is-online {
    border-color: color-mix(in srgb, var(--ui-sticker-success) 50%, var(--color-stroke-ui-light));
  }

  .clients-stat-card.is-money {
    border-color: color-mix(in srgb, var(--ui-primary-accent) 40%, var(--color-stroke-ui-light));
  }

  .clients-stat-card__label {
    font-size: 12px;
    color: var(--ui-text-secondary);
  }

  .clients-stat-card__value {
    margin-top: 2px;
    font-size: 24px;
    line-height: 28px;
    font-weight: 700;
    color: var(--ui-text-main);
  }

  .clients-filters-popover {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    z-index: 40;
    width: 280px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    background: var(--ui-background-panel);
    box-shadow: 0 12px 30px color-mix(in srgb, var(--ui-background) 70%, transparent);
    padding: 10px;
  }

  .clients-filters-popover__title {
    font-size: 12px;
    font-weight: 600;
    color: var(--ui-text-secondary);
    margin-bottom: 8px;
  }

  .clients-filters-popover__list {
    max-height: 220px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .clients-filters-popover__item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    font-size: 13px;
    color: var(--ui-text-main);
  }

  .clients-filters-popover__item input {
    width: 14px;
    height: 14px;
    accent-color: var(--ui-primary-accent);
  }

  .clients-filters-popover__actions {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .clients-filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .clients-filter-chip {
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 999px;
    min-height: 28px;
    padding: 0 10px;
    background: var(--ui-background-panel);
    color: var(--ui-text-main);
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .clients-filter-chip:hover {
    background: var(--color-stroke-ui-dark);
  }

  .clients-filter-chip--clear {
    color: var(--ui-text-secondary);
  }

  .clients-filter-chip__remove {
    font-size: 16px;
    line-height: 1;
    color: var(--ui-text-secondary);
  }

  .clients-online-dot {
    width: 9px;
    height: 9px;
    border-radius: 9999px;
    border: 2px solid var(--ui-background-panel);
    position: absolute;
    right: -1px;
    bottom: -1px;
    background: var(--ui-text-secondary);
  }

  .clients-online-dot.is-online {
    background: var(--ui-sticker-success);
  }

  .clients-online-dot.is-offline {
    background: var(--ui-text-secondary);
  }
</style>
