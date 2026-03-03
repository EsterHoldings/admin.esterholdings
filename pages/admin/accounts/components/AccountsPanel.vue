<template>
  <div class="flex w-full flex-col gap-3 text-[var(--ui-text-main)]">
    <div class="accounts-stats-grid">
      <div
        v-for="card in metricCards"
        :key="card.id"
        class="accounts-stat-card"
        :class="card.kind"
      >
        <template v-if="card.kind === 'is-balance-summary'">
          <div class="accounts-stat-card__label">{{ card.label }}</div>
          <div class="accounts-stat-card__balance-grid">
            <div
              v-for="segment in card.segments"
              :key="segment.id"
              class="accounts-stat-card__balance-item"
            >
              <div class="accounts-stat-card__balance-label">{{ segment.label }}</div>
              <div
                class="accounts-stat-card__balance-value"
                :class="`size-${segment.size}`"
              >
                {{ segment.value }}
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="accounts-stat-card__label">{{ card.label }}</div>
          <div class="accounts-stat-card__value">{{ card.value }}</div>
        </template>
      </div>
    </div>

    <PageStructureContent :plain="viewMode !== 'table'">
      <template #top>
        <div class="flex w-full flex-col gap-2">
          <div class="flex w-full flex-col gap-2 xl:flex-row xl:items-center">
            <div class="flex w-full flex-1 min-w-[260px] items-center gap-2">
              <UiInput
                class="w-full"
                :placeholder="resolveText('admin.accounts.components.accounts-panel-search.placeholder', 'Search accounts...')"
                @input="handleInputSearch"
                :value="searchFilter"
              >
                <template #icon-left>
                  <UiIconSearch />
                </template>
              </UiInput>

              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="handleClickRefresh"
              >
                <UiIconUpdate :spinning="isLoading || isStatsLoading" />
              </UiButtonDefault>
            </div>

            <div class="flex w-full flex-1 items-center gap-2 xl:w-auto xl:flex-none xl:justify-end">
              <UiSelect
                class="min-w-[160px] sm:w-[200px]"
                :value="orderBy"
                :data="sortByOptions"
                :withoutNoSelect="true"
                @change="handleOrderBy"
              />

              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="toggleOrderDirection"
              >
                <UiIconSortBy
                  class="!h-4 !w-4"
                  :orderDirectionEnabled="true"
                  :orderDirection="orderDirection"
                />
              </UiButtonDefault>

              <ViewModeToggle
                class="w-full sm:w-auto"
                bordered
                :modelValue="viewMode"
                :options="viewOptions"
                @update:modelValue="handleChangeViewMode"
              />

              <div
                ref="filtersPopoverRef"
                class="relative"
              >
                <UiButtonDefault
                  state="info--small"
                  class="!w-[44px]"
                  @click.stop="toggleFiltersPopover"
                >
                  <UiIconFilters class="!h-4 !w-4" />
                </UiButtonDefault>

                <div
                  v-if="isFiltersPopoverOpen"
                  class="accounts-filters-popover"
                  @click.stop
                >
                  <div class="accounts-filters-popover__title">
                    {{ resolveText("admin.accounts.filters.title", "Filters") }}
                  </div>

                  <div class="accounts-filters-popover__body">
                    <div class="accounts-filters-popover__section-title">
                      {{ resolveText("admin.accounts.filters.sections.statuses", "Statuses") }}
                    </div>

                    <div class="accounts-filters-popover__grid accounts-filters-popover__grid--status">
                      <label class="accounts-filters-popover__field">
                        <span>{{ resolveText("admin.accounts.filters.fields.is_favorite", "Favorite") }}</span>
                        <UiSelect
                          :withoutNoSelect="false"
                          :value="draftFilters.is_favorite || null"
                          :data="favoriteOptions"
                          @change="value => setDraftFilterValue('is_favorite', value)"
                        />
                      </label>
                    </div>

                    <div class="accounts-filters-popover__section-title">
                      {{ resolveText("admin.accounts.filters.sections.text", "Text fields") }}
                    </div>

                    <div class="accounts-filters-popover__grid">
                      <label
                        v-for="field in filterTextFieldOptions"
                        :key="field.key"
                        class="accounts-filters-popover__field"
                      >
                        <span>{{ field.label }}</span>
                        <input
                          class="accounts-filters-popover__input"
                          type="text"
                          :value="draftFilters[field.key]"
                          :placeholder="field.label"
                          @input="event => handleDraftTextInput(field.key, event)"
                        />
                      </label>
                    </div>

                    <div class="accounts-filters-popover__section-title">
                      {{ resolveText("admin.accounts.filters.sections.ranges", "Ranges") }}
                    </div>

                    <div class="accounts-filters-popover__grid">
                      <label class="accounts-filters-popover__field">
                        <span>{{ resolveText("admin.accounts.filters.fields.balance_from", "Balance from") }}</span>
                        <input
                          class="accounts-filters-popover__input"
                          type="number"
                          step="0.01"
                          :value="draftFilters.balance_from"
                          @input="event => handleDraftTextInput('balance_from', event)"
                        />
                      </label>

                      <label class="accounts-filters-popover__field">
                        <span>{{ resolveText("admin.accounts.filters.fields.balance_to", "Balance to") }}</span>
                        <input
                          class="accounts-filters-popover__input"
                          type="number"
                          step="0.01"
                          :value="draftFilters.balance_to"
                          @input="event => handleDraftTextInput('balance_to', event)"
                        />
                      </label>
                    </div>

                    <div class="accounts-filters-popover__section-title">
                      {{ resolveText("admin.accounts.filters.sections.dates", "Date ranges") }}
                    </div>

                    <div class="accounts-filters-popover__grid">
                      <label
                        v-for="field in filterDateFieldOptions"
                        :key="field.key"
                        class="accounts-filters-popover__field"
                      >
                        <span>{{ field.label }}</span>
                        <input
                          class="accounts-filters-popover__input"
                          type="date"
                          :value="draftFilters[field.key]"
                          @input="event => handleDraftTextInput(field.key, event)"
                        />
                      </label>
                    </div>
                  </div>

                  <div class="accounts-filters-popover__actions">
                    <UiButtonDefault
                      state="info--small"
                      class="!w-full"
                      @click="resetDraftFilters"
                    >
                      {{ resolveText("admin.accounts.filters.reset", "Reset") }}
                    </UiButtonDefault>
                    <UiButtonDefault
                      state="info--small"
                      class="!w-full"
                      @click="applyDraftFilters"
                    >
                      {{ resolveText("admin.accounts.filters.apply", "Apply") }}
                    </UiButtonDefault>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="activeFilterChips.length"
            class="accounts-filter-chips"
          >
            <button
              v-for="chip in activeFilterChips"
              :key="chip.key"
              type="button"
              class="accounts-filter-chip"
              @click="removeAppliedFilter(chip.key)"
            >
              <span>{{ chip.label }}: {{ chip.value }}</span>
              <span class="accounts-filter-chip__remove">×</span>
            </button>

            <button
              type="button"
              class="accounts-filter-chip accounts-filter-chip--clear"
              @click="clearAllAppliedFilters"
            >
              {{ resolveText("admin.accounts.filters.clearAll", "Clear all") }}
            </button>
          </div>
        </div>
      </template>

      <template #content>
        <div>
          <div
            v-if="viewMode !== 'table'"
            class="relative"
          >
            <div
              class="backdrop-blur-[2px] w-full absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              v-if="isLoading && !isInitialLoading"
            >
              <UiIconSpinnerDefault />
            </div>

            <AccountsContent
              :data="accountsData"
              :viewMode="viewMode"
              @click="handleOpenAccountPage"
            />
          </div>

          <div
            v-else
            class="relative"
          >
            <div
              class="backdrop-blur-sm bg-[var(--ui-background)]/40 w-full absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              v-if="isLoading && !isInitialLoading"
            >
              <UiIconSpinnerDefault />
            </div>

            <template v-if="accountsData.length">
              <TableMain>
                <template #thead>
                  <tr>
                    <th class="px-4 py-3 text-left font-normal">{{ resolveText("admin.accounts.columns.owner", "Owner") }}</th>
                    <th class="px-4 py-3 text-left font-normal">{{ resolveText("admin.accounts.columns.number", "Account number") }}</th>
                    <th class="px-4 py-3 text-left font-normal">{{ resolveText("admin.accounts.columns.type", "Type") }}</th>
                    <th class="px-4 py-3 text-left font-normal">{{ resolveText("admin.accounts.columns.balance", "Balance") }}</th>
                    <th class="px-4 py-3 text-left font-normal">{{ resolveText("admin.accounts.columns.leverage", "Leverage") }}</th>
                    <th class="px-4 py-3 text-left font-normal">
                      {{ t("admin.accounts.components.accounts-panel.columns.created_at") }}
                    </th>
                    <th class="px-4 py-3 text-center font-normal w-[60px]">ID</th>
                  </tr>
                </template>

                <template #tbody>
                  <tr
                    v-for="account in accountsData"
                    :key="account.id"
                    class="border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)] cursor-pointer"
                    @click="handleOpenAccountPage(account)"
                  >
                    <td class="px-4 py-3 max-w-[260px]">
                      <div class="truncate font-semibold">{{ account.owner_name || "-" }}</div>
                      <div class="text-xs text-[var(--ui-text-secondary)] truncate">{{ account.owner_email || "-" }}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ account.number || "-" }}</td>
                    <td class="px-4 py-3 truncate max-w-[180px]">
                      {{ account.type_name || account.type_id || "-" }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ formatMoney(account.balance, account.currency) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ account.leverage_display || account.leverage_id || "-" }}</td>
                    <td class="px-4 py-3 text-xs whitespace-nowrap">{{ formatDate(account.created_at) }}</td>
                    <td
                      class="px-2 py-3"
                      @click.stop
                    >
                      <div class="flex items-center justify-center">
                        <UiIconCopy
                          v-if="account.id"
                          :text="account.id"
                        />
                        <span v-else>-</span>
                      </div>
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
  import AccountsContent from "~/pages/admin/accounts/components/AccountsContent.vue";
  import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconFilters from "~/components/ui/UiIconFilters.vue";

  type ViewMode = "cards" | "table" | "full";
  type FilterKey =
    | "id"
    | "user_id"
    | "owner_name"
    | "owner_email"
    | "owner_phone"
    | "number"
    | "currency"
    | "payment_type"
    | "type_id"
    | "type_name"
    | "leverage_id"
    | "is_favorite"
    | "balance_from"
    | "balance_to"
    | "created_at_from"
    | "created_at_to"
    | "updated_at_from"
    | "updated_at_to";

  type AccountFilters = Record<FilterKey, string>;

  interface AdminAccount {
    id: string;
    user_id?: string;
    owner_name?: string;
    owner_email?: string;
    owner_phone?: string;
    owner_photo_path?: string;
    number?: string;
    balance?: number;
    currency?: string;
    payment_type?: string;
    type_id?: string;
    type_name?: string;
    leverage_id?: string;
    leverage_display?: string;
    is_favorite?: boolean;
    created_at?: string;
    updated_at?: string;
  }

  interface AccountsStats {
    total_accounts: number;
    favorite_accounts: number;
    new_accounts: {
      today: number;
      week: number;
      month: number;
    };
    balance_sum: {
      today: number;
      week: number;
      month: number;
      year: number;
      total: number;
    };
  }

  const ORDER_DIRECTION_ASC = "asc";
  const ORDER_DIRECTION_DESC = "desc";
  const VIEW_MODE_STORAGE_KEY = "adminAccountsViewMode";

  const ALL_SEARCH_FIELDS = [
    "id",
    "user_id",
    "number",
    "balance",
    "currency",
    "payment_type",
    "type_id",
    "leverage_id",
    "created_at",
    "updated_at",
    "owner_name",
    "owner_email",
    "owner_phone",
    "type_name",
  ];

  const createEmptyFilters = (): AccountFilters => ({
    id: "",
    user_id: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    number: "",
    currency: "",
    payment_type: "",
    type_id: "",
    type_name: "",
    leverage_id: "",
    is_favorite: "",
    balance_from: "",
    balance_to: "",
    created_at_from: "",
    created_at_to: "",
    updated_at_from: "",
    updated_at_to: "",
  });

  const cloneFilters = (source: AccountFilters): AccountFilters => ({ ...source });

  const sanitizeFilterValue = (value: unknown): string => {
    if (typeof value === "string") return value.trim();
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const { t, locale } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const appCore = useAppCore();

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const isLoading = ref(false);
  const isInitialLoading = ref(true);
  const isLoadingSearch = ref(false);
  const isStatsLoading = ref(false);

  const perPage = ref(10);
  const page = ref(1);
  const totalRows = ref(0);
  const searchFilter = ref("");
  const orderBy = ref<string>("created_at");
  const orderDirection = ref<string>(ORDER_DIRECTION_DESC);
  const viewMode = ref<ViewMode>("table");

  const accountsData = ref<AdminAccount[]>([]);
  const statsData = ref<AccountsStats>({
    total_accounts: 0,
    favorite_accounts: 0,
    new_accounts: {
      today: 0,
      week: 0,
      month: 0,
    },
    balance_sum: {
      today: 0,
      week: 0,
      month: 0,
      year: 0,
      total: 0,
    },
  });

  const appliedFilters = ref<AccountFilters>(createEmptyFilters());
  const draftFilters = ref<AccountFilters>(createEmptyFilters());
  const isFiltersPopoverOpen = ref(false);
  const filtersPopoverRef = ref<HTMLElement | null>(null);

  const filterTextFieldOptions = computed(() => [
    { key: "id" as FilterKey, label: "ID" },
    { key: "user_id" as FilterKey, label: resolveText("admin.accounts.filters.fields.user_id", "User ID") },
    { key: "owner_name" as FilterKey, label: resolveText("admin.accounts.filters.fields.owner_name", "Owner name") },
    { key: "owner_email" as FilterKey, label: resolveText("admin.accounts.filters.fields.owner_email", "Owner email") },
    { key: "owner_phone" as FilterKey, label: resolveText("admin.accounts.filters.fields.owner_phone", "Owner phone") },
    { key: "number" as FilterKey, label: resolveText("admin.accounts.columns.number", "Account number") },
    { key: "currency" as FilterKey, label: resolveText("admin.accounts.filters.fields.currency", "Currency") },
    { key: "payment_type" as FilterKey, label: resolveText("admin.accounts.filters.fields.payment_type", "Payment type") },
    { key: "type_id" as FilterKey, label: resolveText("admin.accounts.filters.fields.type_id", "Type ID") },
    { key: "type_name" as FilterKey, label: resolveText("admin.accounts.columns.type", "Type") },
    { key: "leverage_id" as FilterKey, label: resolveText("admin.accounts.filters.fields.leverage_id", "Leverage ID") },
  ]);

  const filterDateFieldOptions = computed(() => [
    { key: "created_at_from" as FilterKey, label: resolveText("admin.accounts.filters.fields.created_at_from", "Created from") },
    { key: "created_at_to" as FilterKey, label: resolveText("admin.accounts.filters.fields.created_at_to", "Created to") },
    { key: "updated_at_from" as FilterKey, label: resolveText("admin.accounts.filters.fields.updated_at_from", "Updated from") },
    { key: "updated_at_to" as FilterKey, label: resolveText("admin.accounts.filters.fields.updated_at_to", "Updated to") },
  ]);

  const favoriteOptions = computed(() => [
    { id: "yes", value: "yes", text: resolveText("admin.accounts.filters.values.yes", "Yes") },
    { id: "no", value: "no", text: resolveText("admin.accounts.filters.values.no", "No") },
  ]);

  const filterLabelMap = computed<Record<FilterKey, string>>(() => ({
    id: "ID",
    user_id: resolveText("admin.accounts.filters.fields.user_id", "User ID"),
    owner_name: resolveText("admin.accounts.filters.fields.owner_name", "Owner name"),
    owner_email: resolveText("admin.accounts.filters.fields.owner_email", "Owner email"),
    owner_phone: resolveText("admin.accounts.filters.fields.owner_phone", "Owner phone"),
    number: resolveText("admin.accounts.columns.number", "Account number"),
    currency: resolveText("admin.accounts.filters.fields.currency", "Currency"),
    payment_type: resolveText("admin.accounts.filters.fields.payment_type", "Payment type"),
    type_id: resolveText("admin.accounts.filters.fields.type_id", "Type ID"),
    type_name: resolveText("admin.accounts.columns.type", "Type"),
    leverage_id: resolveText("admin.accounts.filters.fields.leverage_id", "Leverage ID"),
    is_favorite: resolveText("admin.accounts.filters.fields.is_favorite", "Favorite"),
    balance_from: resolveText("admin.accounts.filters.fields.balance_from", "Balance from"),
    balance_to: resolveText("admin.accounts.filters.fields.balance_to", "Balance to"),
    created_at_from: resolveText("admin.accounts.filters.fields.created_at_from", "Created from"),
    created_at_to: resolveText("admin.accounts.filters.fields.created_at_to", "Created to"),
    updated_at_from: resolveText("admin.accounts.filters.fields.updated_at_from", "Updated from"),
    updated_at_to: resolveText("admin.accounts.filters.fields.updated_at_to", "Updated to"),
  }));

  const filterValueLabelMap = computed<Record<string, string>>(() => ({
    yes: resolveText("admin.accounts.filters.values.yes", "Yes"),
    no: resolveText("admin.accounts.filters.values.no", "No"),
  }));

  const activeFilterChips = computed(() =>
    (Object.entries(appliedFilters.value) as Array<[FilterKey, string]>)
      .filter(([, value]) => sanitizeFilterValue(value) !== "")
      .map(([key, value]) => ({
        key,
        label: filterLabelMap.value[key] ?? key,
        value: filterValueLabelMap.value[value] ?? value,
      }))
  );

  const sortByOptions = computed(() => [
    { id: "created_at", value: "created_at", text: t("admin.accounts.components.accounts-panel.columns.created_at") },
    { id: "number", value: "number", text: resolveText("admin.accounts.columns.number", "Account number") },
    { id: "balance", value: "balance", text: resolveText("admin.accounts.columns.balance", "Balance") },
    { id: "user_id", value: "user_id", text: resolveText("admin.accounts.filters.fields.user_id", "User ID") },
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

  const metricCards = computed(() => [
    {
      id: "total_accounts",
      kind: "is-neutral",
      label: resolveText("admin.accounts.stats.totalAccounts", "Total accounts"),
      value: formatCount(statsData.value.total_accounts),
    },
    {
      id: "favorite_accounts",
      kind: statsData.value.favorite_accounts > 0 ? "is-highlighted" : "is-neutral",
      label: resolveText("admin.accounts.stats.favoriteAccounts", "Favorite accounts"),
      value: formatCount(statsData.value.favorite_accounts),
    },
    {
      id: "new_today",
      kind: "is-neutral",
      label: resolveText("admin.accounts.stats.newToday", "New accounts today"),
      value: formatCount(statsData.value.new_accounts.today),
    },
    {
      id: "new_week",
      kind: "is-neutral",
      label: resolveText("admin.accounts.stats.newWeek", "New accounts this week"),
      value: formatCount(statsData.value.new_accounts.week),
    },
    {
      id: "new_month",
      kind: "is-neutral",
      label: resolveText("admin.accounts.stats.newMonth", "New accounts this month"),
      value: formatCount(statsData.value.new_accounts.month),
    },
    {
      id: "balance_summary",
      kind: "is-balance-summary",
      label: resolveText("admin.accounts.stats.balanceSummary", "Balances"),
      segments: [
        {
          id: "today",
          label: resolveText("admin.accounts.stats.balanceToday", "Today"),
          value: formatMoney(statsData.value.balance_sum.today),
          size: "xl",
        },
        {
          id: "week",
          label: resolveText("admin.accounts.stats.balanceWeek", "Week"),
          value: formatMoney(statsData.value.balance_sum.week),
          size: "lg",
        },
        {
          id: "month",
          label: resolveText("admin.accounts.stats.balanceMonth", "Month"),
          value: formatMoney(statsData.value.balance_sum.month),
          size: "md",
        },
        {
          id: "year",
          label: resolveText("admin.accounts.stats.balanceYear", "Year"),
          value: formatMoney(statsData.value.balance_sum.year),
          size: "sm",
        },
      ],
    },
  ]);

  const initViewMode = () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved && ["table", "cards", "full"].includes(saved)) {
      viewMode.value = saved as ViewMode;
    }
  };

  const getFiltersPayload = (filters: AccountFilters): Partial<AccountFilters> => {
    const payload: Partial<AccountFilters> = {};
    for (const [key, value] of Object.entries(filters) as Array<[FilterKey, string]>) {
      const normalizedValue = sanitizeFilterValue(value);
      if (normalizedValue !== "") payload[key] = normalizedValue;
    }
    return payload;
  };

  const loadData = async ({ resetPage = false }: { resetPage?: boolean } = {}) => {
    if (resetPage) page.value = 1;
    isLoading.value = true;

    try {
      const filtersPayload = getFiltersPayload(appliedFilters.value);
      const flatFilters = Object.fromEntries(
        Object.entries(filtersPayload).map(([key, value]) => [`filters[${key}]`, value])
      );

      const params = {
        page: page.value,
        perPage: perPage.value,
        searchFilter: searchFilter.value,
        searchFields: ALL_SEARCH_FIELDS.join(","),
        orderBy: orderBy.value,
        orderDirection: orderDirection.value,
        filters: filtersPayload,
        ...flatFilters,
      };

      const response = await appCore.adminModules.accounts.get(params);
      const payload = response?.data?.data ?? {};

      totalRows.value = Number(payload?.total ?? 0);
      accountsData.value = Array.isArray(payload?.data) ? payload.data : [];
    } catch {
      totalRows.value = 0;
      accountsData.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const loadStats = async () => {
    isStatsLoading.value = true;

    try {
      const response = await appCore.adminModules.accounts.getStats();
      const payload = response?.data?.data ?? {};

      statsData.value = {
        total_accounts: Number(payload?.total_accounts ?? 0),
        favorite_accounts: Number(payload?.favorite_accounts ?? 0),
        new_accounts: {
          today: Number(payload?.new_accounts?.today ?? 0),
          week: Number(payload?.new_accounts?.week ?? 0),
          month: Number(payload?.new_accounts?.month ?? 0),
        },
        balance_sum: {
          today: Number(payload?.balance_sum?.today ?? 0),
          week: Number(payload?.balance_sum?.week ?? 0),
          month: Number(payload?.balance_sum?.month ?? 0),
          year: Number(payload?.balance_sum?.year ?? 0),
          total: Number(payload?.balance_sum?.total ?? 0),
        },
      };
    } catch {
      // keep current values
    } finally {
      isStatsLoading.value = false;
    }
  };

  const loadAll = async () => {
    await Promise.all([loadData(), loadStats()]);
  };

  const handleOpenAccountPage = (account: AdminAccount) => {
    const ownerId = String(account?.user_id ?? "").trim();
    if (!ownerId) return;
    navigateTo(localePath(`/clients/${ownerId}`));
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

  const setDraftFilterValue = (key: FilterKey, value: unknown) => {
    draftFilters.value = {
      ...draftFilters.value,
      [key]: sanitizeFilterValue(value),
    };
  };

  const handleDraftTextInput = (key: FilterKey, event: Event) => {
    const target = event.target as HTMLInputElement | null;
    setDraftFilterValue(key, target?.value ?? "");
  };

  const toggleFiltersPopover = () => {
    if (!isFiltersPopoverOpen.value) {
      draftFilters.value = cloneFilters(appliedFilters.value);
    }
    isFiltersPopoverOpen.value = !isFiltersPopoverOpen.value;
  };

  const resetDraftFilters = () => {
    draftFilters.value = createEmptyFilters();
  };

  const applyDraftFilters = async () => {
    appliedFilters.value = cloneFilters(draftFilters.value);
    isFiltersPopoverOpen.value = false;
    await loadData({ resetPage: true });
  };

  const removeAppliedFilter = async (key: FilterKey) => {
    appliedFilters.value = { ...appliedFilters.value, [key]: "" };
    draftFilters.value = { ...draftFilters.value, [key]: "" };
    await loadData({ resetPage: true });
  };

  const clearAllAppliedFilters = async () => {
    appliedFilters.value = createEmptyFilters();
    draftFilters.value = createEmptyFilters();
    await loadData({ resetPage: true });
  };

  const handleClickOutsideFilters = (event: MouseEvent) => {
    if (!isFiltersPopoverOpen.value) return;
    const target = event.target as Node | null;
    if (!target) return;
    if (filtersPopoverRef.value && !filtersPopoverRef.value.contains(target)) {
      isFiltersPopoverOpen.value = false;
    }
  };

  const handleExternalReload = async () => {
    await loadAll();
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleString(locale.value || undefined);
  };

  const formatCount = (value: number) => Number(value || 0).toLocaleString(locale.value || undefined);

  const formatMoney = (value: number, currency = "USD") => {
    const numericValue = Number(value || 0);

    try {
      return new Intl.NumberFormat(locale.value || undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);
    } catch {
      return `${currency} ${numericValue.toFixed(2)}`;
    }
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
    document.addEventListener("click", handleClickOutsideFilters);
  });

  onBeforeUnmount(() => {
    useEventBus.off("loadDataForAdmins", handleExternalReload);
    document.removeEventListener("click", handleClickOutsideFilters);
  });
</script>

<style scoped lang="scss">
  .accounts-stats-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  @media (min-width: 768px) {
    .accounts-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1400px) {
    .accounts-stats-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .accounts-stat-card {
    border-radius: 10px;
    padding: 12px;
    border: none;
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 10%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
  }

  .accounts-stat-card.is-highlighted {
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-sticker-success) 18%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
  }

  .accounts-stat-card.is-balance-summary {
    grid-column: 1 / -1;
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-accent) 16%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
  }

  .accounts-stat-card__label {
    font-size: 12px;
    color: var(--ui-text-secondary);
  }

  .accounts-stat-card__value {
    margin-top: 2px;
    font-size: 24px;
    line-height: 28px;
    font-weight: 700;
    color: var(--ui-text-main);
  }

  .accounts-stat-card__balance-grid {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 8px;
  }

  @media (min-width: 640px) {
    .accounts-stat-card__balance-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .accounts-stat-card__balance-item {
    border-radius: 8px;
    background: color-mix(in srgb, var(--ui-background-panel) 80%, transparent);
    padding: 8px 10px;
  }

  .accounts-stat-card__balance-label {
    font-size: 11px;
    color: var(--ui-text-secondary);
  }

  .accounts-stat-card__balance-value {
    color: var(--ui-text-main);
    line-height: 1.1;
    margin-top: 2px;
    white-space: nowrap;
  }

  .accounts-stat-card__balance-value.size-xl {
    font-size: clamp(20px, 2.4vw, 28px);
    font-weight: 800;
  }

  .accounts-stat-card__balance-value.size-lg {
    font-size: clamp(18px, 2vw, 24px);
    font-weight: 700;
  }

  .accounts-stat-card__balance-value.size-md {
    font-size: clamp(16px, 1.8vw, 20px);
    font-weight: 700;
  }

  .accounts-stat-card__balance-value.size-sm {
    font-size: clamp(14px, 1.5vw, 18px);
    font-weight: 600;
  }

  .accounts-filters-popover {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    z-index: 40;
    width: min(92vw, 560px);
    max-height: min(70vh, 760px);
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    background: var(--ui-background-panel);
    box-shadow: 0 12px 30px color-mix(in srgb, var(--ui-background) 70%, transparent);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .accounts-filters-popover__title {
    font-size: 12px;
    font-weight: 600;
    color: var(--ui-text-secondary);
  }

  .accounts-filters-popover__body {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-right: 2px;
  }

  .accounts-filters-popover__section-title {
    font-size: 11px;
    line-height: 14px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--ui-text-secondary);
  }

  .accounts-filters-popover__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  @media (min-width: 640px) {
    .accounts-filters-popover__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .accounts-filters-popover__grid--status {
    grid-template-columns: 1fr;
  }

  .accounts-filters-popover__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .accounts-filters-popover__field > span {
    font-size: 12px;
    color: var(--ui-text-secondary);
  }

  .accounts-filters-popover__input {
    width: 100%;
    height: 40px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 8px;
    background: var(--color-stroke-ui-dark);
    color: var(--ui-text-main);
    font-size: 13px;
    line-height: 1;
    padding: 0 12px;
    outline: none;
  }

  .accounts-filters-popover__input:focus {
    border-color: var(--ui-primary-accent);
  }

  .accounts-filters-popover__input::placeholder {
    color: var(--ui-text-secondary);
  }

  .accounts-filters-popover__actions {
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .accounts-filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .accounts-filter-chip {
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

  .accounts-filter-chip:hover {
    background: var(--color-stroke-ui-dark);
  }

  .accounts-filter-chip--clear {
    color: var(--ui-text-secondary);
  }

  .accounts-filter-chip__remove {
    font-size: 16px;
    line-height: 1;
    color: var(--ui-text-secondary);
  }
</style>

