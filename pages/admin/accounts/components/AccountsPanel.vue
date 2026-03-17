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
                :isLoading="isLoadingSearch"
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
                ref="filtersTriggerRef"
                class="relative"
              >
                <UiButtonDefault
                  state="info--small"
                  class="min-w-[120px] shrink-0"
                  @click="toggleFiltersPopover"
                >
                  <span class="inline-flex items-center gap-2">
                    <UiIconFilters class="!h-4 !w-4" />
                    <span>{{ resolveText("admin.accounts.filters.title", "Filters") }}</span>
                  </span>
                </UiButtonDefault>
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
              :canEdit="canUpdateAccounts"
              :canRefresh="canUpdateAccounts"
              :canDelete="canDeleteAccounts"
              :refreshingAccountId="refreshingAccountId"
              @click="handleOpenAccountPage"
              @edit="handleOpenEditModal"
              @refresh="handleRefreshBalance"
              @delete="handleDeleteAccount"
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
                    <th
                      v-if="showActionColumn"
                      class="px-4 py-3 text-center font-normal w-[80px]"
                    >
                      {{ resolveText("admin.accounts.columns.actions", "Actions") }}
                    </th>
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
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <span>{{ formatMoney(account.balance, account.currency) }}</span>
                        <button
                          v-if="canUpdateAccounts"
                          type="button"
                          class="accounts-inline-refresh-btn"
                          :disabled="refreshingAccountId === account.id"
                          :title="resolveText('admin.accounts.actions.refreshBalance', 'Refresh balance')"
                          @click.stop="handleRefreshBalance(account)"
                        >
                          <UiIconUpdate :spinning="refreshingAccountId === account.id" />
                        </button>
                      </div>
                    </td>
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
                    <td
                      v-if="showActionColumn"
                      class="px-2 py-3"
                      @click.stop
                    >
                      <div class="relative flex items-center justify-center">
                        <button
                          type="button"
                          class="accounts-row-action-btn"
                          @click.stop="toggleActionMenu(account.id)"
                        >
                          <UiIconDotsVertical />
                        </button>

                        <div
                          v-if="actionMenuId === account.id"
                          class="accounts-row-menu"
                        >
                          <button
                            v-if="canUpdateAccounts"
                            type="button"
                            class="accounts-row-menu__item"
                            @click="handleOpenEditModal(account)"
                          >
                            {{ resolveText("admin.accounts.actions.edit", "Edit") }}
                          </button>
                          <button
                            v-if="canUpdateAccounts"
                            type="button"
                            class="accounts-row-menu__item"
                            @click="handleRefreshBalance(account)"
                          >
                            {{ resolveText("admin.accounts.actions.refreshBalance", "Refresh balance") }}
                          </button>
                          <button
                            v-if="canDeleteAccounts"
                            type="button"
                            class="accounts-row-menu__item danger"
                            @click="handleDeleteAccount(account)"
                          >
                            {{ resolveText("admin.accounts.actions.archive", "Archive") }}
                          </button>
                        </div>
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

    <Teleport to="body">
      <div
        v-if="isFiltersPopoverOpen"
        ref="filtersPopoverPanelRef"
        class="accounts-filters-popover"
        :style="filtersPopoverStyle"
        @click.stop
      >
        <div class="accounts-filters-popover__title">
          {{ resolveText("admin.accounts.filters.title", "Filters") }}
        </div>

        <div class="accounts-filters-popover__body">
          <div class="accounts-filters-popover__section-title">
            {{ resolveText("admin.accounts.filters.sections.selects", "Select filters") }}
          </div>

          <div class="accounts-filters-popover__grid accounts-filters-popover__grid--status">
            <label
              v-for="field in filterSelectFieldOptions"
              :key="field.key"
              class="accounts-filters-popover__field"
            >
              <span>{{ field.label }}</span>
              <div class="accounts-filters-popover__control">
                <UiSelect
                  :withoutNoSelect="false"
                  :searchable="Boolean(field.searchable)"
                  :searchValue="filterSearchQueries[field.key]"
                  :value="draftFilters[field.key] || null"
                  :data="field.options"
                  @change="value => setDraftFilterValue(field.key, value)"
                  @search="value => handleFilterOptionSearch(field.key, value)"
                />
                <button
                  v-if="hasDraftFilterValue(field.key)"
                  type="button"
                  class="accounts-filters-popover__clear"
                  @click.prevent.stop="clearDraftFilterValue(field.key)"
                >
                  ×
                </button>
              </div>
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
              <div class="accounts-filters-popover__control">
                <UiSelect
                  :withoutNoSelect="false"
                  :searchable="true"
                  :searchValue="filterSearchQueries[field.key]"
                  :value="draftFilters[field.key] || null"
                  :data="field.options"
                  @change="value => setDraftFilterValue(field.key, value)"
                  @search="value => handleFilterOptionSearch(field.key, value)"
                />
                <button
                  v-if="hasDraftFilterValue(field.key)"
                  type="button"
                  class="accounts-filters-popover__clear"
                  @click.prevent.stop="clearDraftFilterValue(field.key)"
                >
                  ×
                </button>
              </div>
            </label>
          </div>

          <div class="accounts-filters-popover__section-title">
            {{ resolveText("admin.accounts.filters.sections.ranges", "Ranges") }}
          </div>

          <div class="accounts-filters-popover__grid">
            <label class="accounts-filters-popover__field">
              <span>{{ resolveText("admin.accounts.filters.fields.balance_from", "Balance from") }}</span>
              <div class="accounts-filters-popover__control">
                <input
                  class="accounts-filters-popover__input"
                  type="number"
                  step="0.01"
                  :value="draftFilters.balance_from"
                  @input="event => handleDraftTextInput('balance_from', event)"
                />
                <button
                  v-if="hasDraftFilterValue('balance_from')"
                  type="button"
                  class="accounts-filters-popover__clear"
                  @click.prevent.stop="clearDraftFilterValue('balance_from')"
                >
                  ×
                </button>
              </div>
            </label>

            <label class="accounts-filters-popover__field">
              <span>{{ resolveText("admin.accounts.filters.fields.balance_to", "Balance to") }}</span>
              <div class="accounts-filters-popover__control">
                <input
                  class="accounts-filters-popover__input"
                  type="number"
                  step="0.01"
                  :value="draftFilters.balance_to"
                  @input="event => handleDraftTextInput('balance_to', event)"
                />
                <button
                  v-if="hasDraftFilterValue('balance_to')"
                  type="button"
                  class="accounts-filters-popover__clear"
                  @click.prevent.stop="clearDraftFilterValue('balance_to')"
                >
                  ×
                </button>
              </div>
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
              <div class="accounts-filters-popover__control">
                <input
                  class="accounts-filters-popover__input"
                  type="date"
                  :value="draftFilters[field.key]"
                  @input="event => handleDraftTextInput(field.key, event)"
                />
                <button
                  v-if="hasDraftFilterValue(field.key)"
                  type="button"
                  class="accounts-filters-popover__clear"
                  @click.prevent.stop="clearDraftFilterValue(field.key)"
                >
                  ×
                </button>
              </div>
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
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
  import { computed, h, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from "vue-router";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import { debounce } from "~/utils/helper/debounce";
  import { navigateTo } from "nuxt/app";
  import { useLocalePath } from "~/.nuxt/imports";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

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
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import AccountsPanelEdit from "~/pages/admin/accounts/components/AccountsPanelEdit.vue";

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
    | "type_group"
    | "leverage_id"
    | "is_favorite"
    | "balance_from"
    | "balance_to"
    | "created_at_from"
    | "created_at_to"
    | "updated_at_from"
    | "updated_at_to";

  type AccountFilters = Record<FilterKey, string>;
  type SelectFilterKey = Exclude<
    FilterKey,
    "balance_from" | "balance_to" | "created_at_from" | "created_at_to" | "updated_at_from" | "updated_at_to"
  >;
  type DynamicSelectFilterKey = Extract<
    SelectFilterKey,
    "id" | "user_id" | "owner_name" | "owner_email" | "owner_phone" | "number" | "type_name" | "type_group"
  >;
  type DynamicFilterOptionsMap = Record<DynamicSelectFilterKey, SelectOption[]>;
  type FilterSearchQueryMap = Record<SelectFilterKey, string>;

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

  interface SelectOption {
    id: string;
    value: string;
    text: string;
  }

  const ORDER_DIRECTION_ASC = "asc";
  const ORDER_DIRECTION_DESC = "desc";
  const VIEW_MODE_STORAGE_KEY = "adminAccountsViewMode";
  const DEFAULT_PER_PAGE = 10;
  const DEFAULT_PAGE = 1;
  const DEFAULT_ORDER_BY = "created_at";
  const DEFAULT_VIEW_MODE: ViewMode = "table";
  const ORDER_BY_OPTIONS = ["created_at", "number", "balance", "user_id"] as const;
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
    "type_group",
  ] as const;
  const SELECT_FILTER_KEYS = [
    "id",
    "user_id",
    "owner_name",
    "owner_email",
    "owner_phone",
    "number",
    "currency",
    "payment_type",
    "type_id",
    "type_name",
    "type_group",
    "leverage_id",
    "is_favorite",
  ] as const satisfies ReadonlyArray<SelectFilterKey>;
  const DYNAMIC_SELECT_FILTER_KEYS = [
    "id",
    "user_id",
    "owner_name",
    "owner_email",
    "owner_phone",
    "number",
    "type_name",
    "type_group",
  ] as const satisfies ReadonlyArray<DynamicSelectFilterKey>;
  const QUERY_KEY_PAGE = "page";
  const QUERY_KEY_PER_PAGE = "perPage";
  const QUERY_KEY_SEARCH = "search";
  const QUERY_KEY_ORDER_BY = "orderBy";
  const QUERY_KEY_ORDER_DIRECTION = "orderDirection";
  const QUERY_KEY_VIEW_MODE = "view";
  const FILTER_QUERY_PREFIX = "filter_";

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
    type_group: "",
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
  const FILTER_KEYS = Object.keys(createEmptyFilters()) as FilterKey[];
  const createEmptyDynamicFilterOptions = (): DynamicFilterOptionsMap => ({
    id: [],
    user_id: [],
    owner_name: [],
    owner_email: [],
    owner_phone: [],
    number: [],
    type_name: [],
    type_group: [],
  });
  const createEmptyFilterSearchQueries = (): FilterSearchQueryMap => ({
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
    type_group: "",
    leverage_id: "",
    is_favorite: "",
  });

  const sanitizeFilterValue = (value: unknown): string => {
    if (typeof value === "string") return value.trim();
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const getQueryValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return sanitizeFilterValue(value[0]);
    }

    return sanitizeFilterValue(value);
  };

  const getFirstNonEmptyQueryValue = (...values: unknown[]): string => {
    for (const value of values) {
      const normalized = getQueryValue(value);
      if (normalized !== "") {
        return normalized;
      }
    }

    return "";
  };

  const parsePositiveInt = (value: unknown, fallback: number, min = 1): number => {
    const parsed = Number.parseInt(getQueryValue(value), 10);
    if (!Number.isFinite(parsed) || parsed < min) {
      return fallback;
    }

    return parsed;
  };

  const isOrderByValue = (value: string): boolean => {
    return ORDER_BY_OPTIONS.includes(value as (typeof ORDER_BY_OPTIONS)[number]);
  };

  const isOrderDirectionValue = (value: string): value is typeof ORDER_DIRECTION_ASC | typeof ORDER_DIRECTION_DESC => {
    return value === ORDER_DIRECTION_ASC || value === ORDER_DIRECTION_DESC;
  };

  const isViewModeValue = (value: string): value is ViewMode => {
    return value === "table" || value === "cards" || value === "full";
  };

  const isFilterBracketQueryKey = (queryKey: string): boolean => {
    const matched = queryKey.match(/^filters\[(.+)\]$/);
    if (!matched) return false;

    return FILTER_KEYS.includes(matched[1] as FilterKey);
  };

  const managedQueryKeys = new Set<string>([
    QUERY_KEY_PAGE,
    QUERY_KEY_PER_PAGE,
    QUERY_KEY_SEARCH,
    QUERY_KEY_ORDER_BY,
    QUERY_KEY_ORDER_DIRECTION,
    QUERY_KEY_VIEW_MODE,
    ...FILTER_KEYS.map(key => `${FILTER_QUERY_PREFIX}${key}`),
  ]);

  const normalizeQuery = (query: LocationQuery | LocationQueryRaw): Record<string, string> => {
    return Object.fromEntries(Object.entries(query).map(([key, value]) => [key, getQueryValue(value)]));
  };

  const areQueryObjectsEqual = (left: Record<string, string>, right: Record<string, string>): boolean => {
    const leftEntries = Object.entries(left).filter(([, value]) => value !== "");
    const rightEntries = Object.entries(right).filter(([, value]) => value !== "");

    if (leftEntries.length !== rightEntries.length) {
      return false;
    }

    for (const [key, value] of leftEntries) {
      if (right[key] !== value) {
        return false;
      }
    }

    return true;
  };

  const { t, locale } = useI18n({ useScope: "global" });
  const route = useRoute();
  const router = useRouter();
  const localePath = useLocalePath();
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const toast = useToast();
  const { openModal } = inject("modalControl") as { openModal: (component: unknown, props?: Record<string, unknown>) => void };
  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const isLoading = ref(false);
  const isInitialLoading = ref(true);
  const isLoadingSearch = ref(false);
  const isStatsLoading = ref(false);

  const perPage = ref(DEFAULT_PER_PAGE);
  const page = ref(DEFAULT_PAGE);
  const totalRows = ref(0);
  const searchFilter = ref("");
  const orderBy = ref<string>(DEFAULT_ORDER_BY);
  const orderDirection = ref<string>(ORDER_DIRECTION_DESC);
  const viewMode = ref<ViewMode>(DEFAULT_VIEW_MODE);

  const accountsData = ref<AdminAccount[]>([]);
  const actionMenuId = ref<string | null>(null);
  const refreshingAccountId = ref<string | null>(null);
  const deletingAccountId = ref<string | null>(null);
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
  const filtersTriggerRef = ref<HTMLElement | null>(null);
  const filtersPopoverPanelRef = ref<HTMLElement | null>(null);
  const filtersPopoverStyle = ref<Record<string, string>>({});
  const dynamicFilterOptions = ref<DynamicFilterOptionsMap>(createEmptyDynamicFilterOptions());
  const filterSearchQueries = ref<FilterSearchQueryMap>(createEmptyFilterSearchQueries());
  const filterSearchTimers = new Map<SelectFilterKey, ReturnType<typeof window.setTimeout>>();
  const accountTypeFilterOptions = ref<SelectOption[]>([]);
  const leverageFilterOptions = ref<SelectOption[]>([]);
  const currencyFilterOptions = ref<SelectOption[]>([]);
  const paymentTypeFilterOptions = ref<SelectOption[]>([]);
  const accountFilterFeatures = ref({
    currency: true,
    payment_type: true,
  });

  const filterTextFieldOptions = computed(() => [
    { key: "id" as DynamicSelectFilterKey, label: "ID", options: getFilterOptions("id") },
    {
      key: "user_id" as DynamicSelectFilterKey,
      label: resolveText("admin.accounts.filters.fields.user_id", "User ID"),
      options: getFilterOptions("user_id"),
    },
    {
      key: "owner_name" as DynamicSelectFilterKey,
      label: resolveText("admin.accounts.filters.fields.owner_name", "Owner name"),
      options: getFilterOptions("owner_name"),
    },
    {
      key: "owner_email" as DynamicSelectFilterKey,
      label: resolveText("admin.accounts.filters.fields.owner_email", "Owner email"),
      options: getFilterOptions("owner_email"),
    },
    {
      key: "owner_phone" as DynamicSelectFilterKey,
      label: resolveText("admin.accounts.filters.fields.owner_phone", "Owner phone"),
      options: getFilterOptions("owner_phone"),
    },
    {
      key: "number" as DynamicSelectFilterKey,
      label: resolveText("admin.accounts.columns.number", "Account number"),
      options: getFilterOptions("number"),
    },
    {
      key: "type_name" as DynamicSelectFilterKey,
      label: resolveText("admin.accounts.columns.type", "Type"),
      options: getFilterOptions("type_name"),
    },
    {
      key: "type_group" as DynamicSelectFilterKey,
      label: resolveText("admin.accounts.filters.fields.type_group", "Type group"),
      options: getFilterOptions("type_group"),
    },
  ]);

  const filterSelectFieldOptions = computed(() => {
    const fields: Array<{ key: SelectFilterKey; label: string; options: SelectOption[]; searchable?: boolean }> = [
      {
        key: "is_favorite",
        label: resolveText("admin.accounts.filters.fields.is_favorite", "Favorite"),
        options: getFilterOptions("is_favorite"),
      },
      {
        key: "type_id",
        label: resolveText("admin.accounts.columns.type", "Type"),
        options: getFilterOptions("type_id"),
        searchable: true,
      },
      {
        key: "leverage_id",
        label: resolveText("admin.accounts.columns.leverage", "Leverage"),
        options: getFilterOptions("leverage_id"),
        searchable: true,
      },
    ];

    if (accountFilterFeatures.value.currency) {
      fields.push({
        key: "currency",
        label: resolveText("admin.accounts.filters.fields.currency", "Currency"),
        options: getFilterOptions("currency"),
        searchable: true,
      });
    }

    if (accountFilterFeatures.value.payment_type) {
      fields.push({
        key: "payment_type",
        label: resolveText("admin.accounts.filters.fields.payment_type", "Payment type"),
        options: getFilterOptions("payment_type"),
        searchable: true,
      });
    }

    return fields;
  });

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

  const isDynamicSelectFilterKey = (key: SelectFilterKey): key is DynamicSelectFilterKey =>
    (DYNAMIC_SELECT_FILTER_KEYS as readonly string[]).includes(key);

  const normalizeSelectOptions = (items: any[] = []): SelectOption[] =>
    items.map((item: any) => ({
      id: String(item?.id ?? item?.value ?? ""),
      value: String(item?.value ?? item?.id ?? ""),
      text: String(item?.text ?? item?.name ?? item?.value ?? item?.id ?? "-"),
    }));

  const filterOptionsByQuery = (options: SelectOption[], query: string): SelectOption[] => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter(option => {
      const haystack = `${option.text} ${option.value}`.trim().toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  };

  const getFilterOptions = (key: SelectFilterKey): SelectOption[] => {
    const query = filterSearchQueries.value[key] ?? "";

    if (isDynamicSelectFilterKey(key)) {
      return filterOptionsByQuery(dynamicFilterOptions.value[key] ?? [], query);
    }

    const baseOptionsMap: Partial<Record<SelectFilterKey, SelectOption[]>> = {
      is_favorite: favoriteOptions.value,
      type_id: accountTypeFilterOptions.value,
      leverage_id: leverageFilterOptions.value,
      currency: currencyFilterOptions.value,
      payment_type: paymentTypeFilterOptions.value,
    };

    return filterOptionsByQuery(baseOptionsMap[key] ?? [], query);
  };

  const resetFilterSearchQueries = () => {
    filterSearchQueries.value = createEmptyFilterSearchQueries();
  };

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
    type_group: resolveText("admin.accounts.filters.fields.type_group", "Type group"),
    leverage_id: resolveText("admin.accounts.filters.fields.leverage_id", "Leverage ID"),
    is_favorite: resolveText("admin.accounts.filters.fields.is_favorite", "Favorite"),
    balance_from: resolveText("admin.accounts.filters.fields.balance_from", "Balance from"),
    balance_to: resolveText("admin.accounts.filters.fields.balance_to", "Balance to"),
    created_at_from: resolveText("admin.accounts.filters.fields.created_at_from", "Created from"),
    created_at_to: resolveText("admin.accounts.filters.fields.created_at_to", "Created to"),
    updated_at_from: resolveText("admin.accounts.filters.fields.updated_at_from", "Updated from"),
    updated_at_to: resolveText("admin.accounts.filters.fields.updated_at_to", "Updated to"),
  }));

  const getFilterOptionText = (options: SelectOption[], value: string): string => {
    return options.find(option => option.value === value)?.text ?? value;
  };

  const getFilterDisplayValue = (key: FilterKey, value: string): string => {
    switch (key) {
      case "is_favorite":
        return value === "yes"
          ? resolveText("admin.accounts.filters.values.yes", "Yes")
          : value === "no"
            ? resolveText("admin.accounts.filters.values.no", "No")
            : value;
      case "id":
      case "user_id":
      case "owner_name":
      case "owner_email":
      case "owner_phone":
      case "number":
      case "type_name":
      case "type_group":
        return getFilterOptionText(dynamicFilterOptions.value[key as DynamicSelectFilterKey] ?? [], value);
      case "type_id":
        return getFilterOptionText(accountTypeFilterOptions.value, value);
      case "leverage_id":
        return getFilterOptionText(leverageFilterOptions.value, value);
      case "currency":
        return getFilterOptionText(currencyFilterOptions.value, value);
      case "payment_type":
        return getFilterOptionText(paymentTypeFilterOptions.value, value);
      default:
        return value;
    }
  };

  const activeFilterChips = computed(() =>
    (Object.entries(appliedFilters.value) as Array<[FilterKey, string]>)
      .filter(([, value]) => sanitizeFilterValue(value) !== "")
      .map(([key, value]) => ({
        key,
        label: filterLabelMap.value[key] ?? key,
        value: getFilterDisplayValue(key, value),
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

  const canUpdateAccounts = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-accounts"));
  const canDeleteAccounts = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("delete-accounts"));
  const showActionColumn = computed(() => canUpdateAccounts.value || canDeleteAccounts.value);

  const initViewMode = () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved && ["table", "cards", "full"].includes(saved)) {
      viewMode.value = saved as ViewMode;
    }
  };

  const getQueryFilters = (query: LocationQuery): AccountFilters => {
    const filters = createEmptyFilters();

    for (const filterKey of FILTER_KEYS) {
      filters[filterKey] = getQueryValue(query[`${FILTER_QUERY_PREFIX}${filterKey}`]);
    }

    for (const [queryKey, rawValue] of Object.entries(query)) {
      const matched = queryKey.match(/^filters\[(.+)\]$/);
      if (!matched) continue;

      const filterKey = matched[1] as FilterKey;
      if (!FILTER_KEYS.includes(filterKey)) continue;

      filters[filterKey] = getQueryValue(rawValue);
    }

    return filters;
  };

  const initStateFromQuery = () => {
    const query = route.query;

    perPage.value = parsePositiveInt(query[QUERY_KEY_PER_PAGE], DEFAULT_PER_PAGE);
    page.value = parsePositiveInt(query[QUERY_KEY_PAGE], DEFAULT_PAGE);
    searchFilter.value = getFirstNonEmptyQueryValue(query[QUERY_KEY_SEARCH], query.searchFilter);

    const queryOrderBy = getQueryValue(query[QUERY_KEY_ORDER_BY]);
    if (isOrderByValue(queryOrderBy)) {
      orderBy.value = queryOrderBy;
    }

    const queryOrderDirection = getQueryValue(query[QUERY_KEY_ORDER_DIRECTION]);
    if (isOrderDirectionValue(queryOrderDirection)) {
      orderDirection.value = queryOrderDirection;
    }

    const queryViewMode = getQueryValue(query[QUERY_KEY_VIEW_MODE]);
    if (isViewModeValue(queryViewMode)) {
      viewMode.value = queryViewMode;
    }

    const parsedFilters = getQueryFilters(query);
    appliedFilters.value = parsedFilters;
    draftFilters.value = cloneFilters(parsedFilters);
  };

  const buildStateQuery = (): Record<string, string> => {
    const query: Record<string, string> = {};

    if (page.value > DEFAULT_PAGE) {
      query[QUERY_KEY_PAGE] = String(page.value);
    }

    if (perPage.value !== DEFAULT_PER_PAGE) {
      query[QUERY_KEY_PER_PAGE] = String(perPage.value);
    }

    const normalizedSearch = sanitizeFilterValue(searchFilter.value);
    if (normalizedSearch !== "") {
      query[QUERY_KEY_SEARCH] = normalizedSearch;
    }

    if (orderBy.value !== DEFAULT_ORDER_BY) {
      query[QUERY_KEY_ORDER_BY] = orderBy.value;
    }

    if (orderDirection.value !== ORDER_DIRECTION_DESC) {
      query[QUERY_KEY_ORDER_DIRECTION] = orderDirection.value;
    }

    if (viewMode.value !== DEFAULT_VIEW_MODE) {
      query[QUERY_KEY_VIEW_MODE] = viewMode.value;
    }

    for (const filterKey of FILTER_KEYS) {
      const filterValue = sanitizeFilterValue(appliedFilters.value[filterKey]);
      if (filterValue === "") continue;

      query[`${FILTER_QUERY_PREFIX}${filterKey}`] = filterValue;
    }

    return query;
  };

  const buildNextQuery = (): Record<string, string> => {
    const preserved = Object.fromEntries(
      Object.entries(normalizeQuery(route.query)).filter(
        ([key]) => !managedQueryKeys.has(key) && !isFilterBracketQueryKey(key)
      )
    );

    return {
      ...preserved,
      ...buildStateQuery(),
    };
  };

  const syncStateToUrl = async () => {
    const currentQuery = normalizeQuery(route.query);
    const nextQuery = buildNextQuery();

    if (areQueryObjectsEqual(currentQuery, nextQuery)) {
      return;
    }

    try {
      await router.replace({ query: nextQuery });
    } catch {
      // ignore navigation race in the same route
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
        search: searchFilter.value,
        searchFilter: searchFilter.value,
        searchFields: [...ALL_SEARCH_FIELDS],
        orderBy: orderBy.value,
        orderDirection: orderDirection.value,
        ...flatFilters,
      };

      const response = await appCore.adminModules.accounts.get(params);
      const payload = response?.data?.data ?? {};

      totalRows.value = Number(payload?.total ?? 0);
      accountsData.value = Array.isArray(payload?.data) ? payload.data : [];
    } catch (error: any) {
      totalRows.value = 0;
      accountsData.value = [];
      toast.error(
        error?.response?.data?.message ||
          resolveText("admin.accounts.messages.loadError", "Failed to load accounts.")
      );
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

  const loadFilterMeta = async (options: { filterField?: DynamicSelectFilterKey; filterSearch?: string } = {}) => {
    const { filterField, filterSearch = "" } = options;

    try {
      const response = await appCore.adminModules.accounts.getMeta({
        filter_field: filterField,
        filter_search: filterSearch,
        limit: 25,
      });
      const payload = response?.data?.data ?? {};

      if (!filterField) {
        accountTypeFilterOptions.value = normalizeSelectOptions(Array.isArray(payload?.account_types) ? payload.account_types : []);
        leverageFilterOptions.value = normalizeSelectOptions(Array.isArray(payload?.leverages) ? payload.leverages : []);
        currencyFilterOptions.value = normalizeSelectOptions(Array.isArray(payload?.currencies) ? payload.currencies : []);
        paymentTypeFilterOptions.value = normalizeSelectOptions(Array.isArray(payload?.payment_types) ? payload.payment_types : []);
      }

      accountFilterFeatures.value = {
        currency: Boolean(payload?.features?.currency ?? true),
        payment_type: Boolean(payload?.features?.payment_type ?? true),
      };

      const filterOptions = payload?.filter_options ?? {};
      const nextDynamicOptions = { ...dynamicFilterOptions.value };

      for (const key of DYNAMIC_SELECT_FILTER_KEYS) {
        if (filterField && key !== filterField) continue;

        if (Array.isArray(filterOptions?.[key])) {
          nextDynamicOptions[key] = normalizeSelectOptions(filterOptions[key]);
        }
      }

      dynamicFilterOptions.value = nextDynamicOptions;
    } catch {
      if (filterField) {
        return;
      }

      accountTypeFilterOptions.value = [];
      leverageFilterOptions.value = [];
      currencyFilterOptions.value = [];
      paymentTypeFilterOptions.value = [];
      dynamicFilterOptions.value = createEmptyDynamicFilterOptions();
      accountFilterFeatures.value = {
        currency: false,
        payment_type: false,
      };
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

  const handleOpenEditModal = (account: AdminAccount) => {
    if (!account?.id || !canUpdateAccounts.value) return;

    actionMenuId.value = null;
    openModal(AccountsPanelEdit, {
      id: account.id,
      title: resolveText("admin.accounts.form.titles.edit", "Edit account"),
    });
  };

  const toggleActionMenu = (accountId: string) => {
    if (!showActionColumn.value) return;

    actionMenuId.value = actionMenuId.value === accountId ? null : accountId;
  };

  const replaceAccountInList = (nextAccount: AdminAccount) => {
    accountsData.value = accountsData.value.map(account =>
      account.id === nextAccount.id ? { ...account, ...nextAccount } : account
    );
  };

  const handleRefreshBalance = async (account: AdminAccount) => {
    if (!account?.id || !canUpdateAccounts.value || refreshingAccountId.value === account.id) return;

    actionMenuId.value = null;
    refreshingAccountId.value = account.id;

    try {
      const response = await appCore.adminModules.accounts.refreshBalance(account.id);
      const refreshedAccount = response?.data?.data?.account as AdminAccount | undefined;

      if (refreshedAccount?.id) {
        replaceAccountInList(refreshedAccount);
      }

      await loadStats();
      toast.success(resolveText("admin.accounts.messages.refreshSuccess", "Account balance updated."));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          resolveText("admin.accounts.messages.refreshError", "Failed to refresh account balance.")
      );
    } finally {
      refreshingAccountId.value = null;
    }
  };

  const handleDeleteAccount = async (account: AdminAccount) => {
    if (!account?.id || !canDeleteAccounts.value || deletingAccountId.value === account.id) return;

    const confirmed = window.confirm(
      resolveText("admin.accounts.messages.archiveConfirm", "Archive this account?")
    );

    if (!confirmed) return;

    actionMenuId.value = null;
    deletingAccountId.value = account.id;

    try {
      await appCore.adminModules.accounts.delete(account.id);

      if (accountsData.value.length === 1 && page.value > DEFAULT_PAGE) {
        page.value -= 1;
      }

      await loadAll();
      await syncStateToUrl();
      toast.success(resolveText("admin.accounts.messages.archiveSuccess", "Account archived."));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          resolveText("admin.accounts.messages.archiveError", "Failed to archive account.")
      );
    } finally {
      deletingAccountId.value = null;
    }
  };

  const handleChangePerPage = async (value: number) => {
    perPage.value = value;
    await loadData({ resetPage: true });
    await syncStateToUrl();
  };

  const handleChangePage = async (value: number) => {
    page.value = value;
    await loadData();
    await syncStateToUrl();
  };

  const handleInputSearch = debounce(async (value: string) => {
    try {
      isLoadingSearch.value = true;
      searchFilter.value = value;
      await loadData({ resetPage: true });
      await syncStateToUrl();
    } finally {
      isLoadingSearch.value = false;
    }
  }, 500);

  const handleOrderBy = async (value: string) => {
    orderBy.value = value;
    await loadData();
    await syncStateToUrl();
  };

  const toggleOrderDirection = async () => {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
    await loadData();
    await syncStateToUrl();
  };

  const handleChangeViewMode = async (value: string) => {
    if (value === "table" || value === "cards" || value === "full") {
      viewMode.value = value;
      await syncStateToUrl();
    }
  };

  const handleClickRefresh = async () => {
    await loadAll();
    await syncStateToUrl();
  };

  const setDraftFilterValue = (key: FilterKey, value: unknown) => {
    draftFilters.value = {
      ...draftFilters.value,
      [key]: sanitizeFilterValue(value),
    };
  };

  const handleFilterOptionSearch = (key: SelectFilterKey, query: string) => {
    filterSearchQueries.value = {
      ...filterSearchQueries.value,
      [key]: query,
    };

    if (!isDynamicSelectFilterKey(key)) {
      return;
    }

    const activeTimer = filterSearchTimers.get(key);
    if (activeTimer) {
      window.clearTimeout(activeTimer);
    }

    filterSearchTimers.set(key, window.setTimeout(async () => {
      await loadFilterMeta({ filterField: key, filterSearch: query });
    }, 300));
  };

  const clearDraftFilterValue = (key: FilterKey) => {
    setDraftFilterValue(key, "");

    if ((SELECT_FILTER_KEYS as readonly string[]).includes(key)) {
      filterSearchQueries.value = {
        ...filterSearchQueries.value,
        [key as SelectFilterKey]: "",
      };
    }
  };

  const hasDraftFilterValue = (key: FilterKey): boolean => {
    return sanitizeFilterValue(draftFilters.value[key]) !== "";
  };

  const handleDraftTextInput = (key: FilterKey, event: Event) => {
    const target = event.target as HTMLInputElement | null;
    setDraftFilterValue(key, target?.value ?? "");
  };

  const updateFiltersPopoverPosition = () => {
    if (!isFiltersPopoverOpen.value || !filtersTriggerRef.value) {
      return;
    }

    const triggerRect = filtersTriggerRef.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const preferredWidth = Math.min(Math.max(viewportWidth - 24, 320), 560);
    const left = Math.max(12, Math.min(triggerRect.right - preferredWidth, viewportWidth - preferredWidth - 12));

    filtersPopoverStyle.value = {
      position: "fixed",
      top: `${Math.round(triggerRect.bottom + 8)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(preferredWidth)}px`,
      maxWidth: "calc(100vw - 24px)",
    };
  };

  const toggleFiltersPopover = async () => {
    if (!isFiltersPopoverOpen.value) {
      draftFilters.value = cloneFilters(appliedFilters.value);
      resetFilterSearchQueries();
    }
    isFiltersPopoverOpen.value = !isFiltersPopoverOpen.value;

    if (isFiltersPopoverOpen.value) {
      await nextTick();
      updateFiltersPopoverPosition();
    }
  };

  const resetDraftFilters = () => {
    draftFilters.value = createEmptyFilters();
    resetFilterSearchQueries();
  };

  const applyDraftFilters = async () => {
    appliedFilters.value = cloneFilters(draftFilters.value);
    isFiltersPopoverOpen.value = false;
    resetFilterSearchQueries();
    await loadData({ resetPage: true });
    await syncStateToUrl();
  };

  const removeAppliedFilter = async (key: FilterKey) => {
    appliedFilters.value = { ...appliedFilters.value, [key]: "" };
    draftFilters.value = { ...draftFilters.value, [key]: "" };
    await loadData({ resetPage: true });
    await syncStateToUrl();
  };

  const clearAllAppliedFilters = async () => {
    appliedFilters.value = createEmptyFilters();
    draftFilters.value = createEmptyFilters();
    resetFilterSearchQueries();
    await loadData({ resetPage: true });
    await syncStateToUrl();
  };

  const handleClickOutsideFilters = (event: MouseEvent) => {
    if (!isFiltersPopoverOpen.value) return;
    const target = event.target as Node | null;
    if (!target) return;

    const clickedOnTrigger = filtersTriggerRef.value?.contains(target) ?? false;
    const clickedOnPopover = filtersPopoverPanelRef.value?.contains(target) ?? false;

    if (!clickedOnTrigger && !clickedOnPopover) {
      isFiltersPopoverOpen.value = false;
    }
  };

  const handleClickOutsideActionMenu = () => {
    actionMenuId.value = null;
  };

  const handleExternalReload = async () => {
    await loadAll();
  };

  const handleFiltersPopoverViewportChange = () => {
    updateFiltersPopoverPosition();
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
    initStateFromQuery();
    await loadFilterMeta();
    await syncStateToUrl();
    await loadAll();
    isInitialLoading.value = false;

    useEventBus.on("loadDataForAdminAccounts", handleExternalReload);
    document.addEventListener("click", handleClickOutsideFilters);
    document.addEventListener("click", handleClickOutsideActionMenu);
    window.addEventListener("resize", handleFiltersPopoverViewportChange, { passive: true });
    window.addEventListener("scroll", handleFiltersPopoverViewportChange, true);
  });

  onBeforeUnmount(() => {
    filterSearchTimers.forEach(timerId => window.clearTimeout(timerId));
    filterSearchTimers.clear();
    useEventBus.off("loadDataForAdminAccounts", handleExternalReload);
    document.removeEventListener("click", handleClickOutsideFilters);
    document.removeEventListener("click", handleClickOutsideActionMenu);
    window.removeEventListener("resize", handleFiltersPopoverViewportChange);
    window.removeEventListener("scroll", handleFiltersPopoverViewportChange, true);
  });

  watch(isFiltersPopoverOpen, async isOpen => {
    if (!isOpen) {
      return;
    }

    await nextTick();
    updateFiltersPopoverPosition();
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
    background: transparent;
    padding: 0;
  }

  .accounts-stat-card__label {
    font-size: 12px;
    color: var(--ui-text-secondary);
  }

  .accounts-stat-card.is-balance-summary .accounts-stat-card__label {
    margin-bottom: 8px;
  }

  .accounts-stat-card__value {
    margin-top: 2px;
    font-size: 24px;
    line-height: 28px;
    font-weight: 700;
    color: var(--ui-text-main);
  }

  .accounts-stat-card__balance-grid {
    margin-top: 0;
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
    border-radius: 0;
    background: transparent;
    padding: 0;
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
    position: fixed;
    z-index: 1200;
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

  .accounts-filters-popover__control {
    position: relative;
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
    padding: 0 36px 0 12px;
    outline: none;
  }

  .accounts-filters-popover__input:focus {
    border-color: var(--ui-primary-accent);
  }

  .accounts-filters-popover__input::placeholder {
    color: var(--ui-text-secondary);
  }

  .accounts-filters-popover__clear {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 999px;
    background: var(--ui-background-panel);
    color: var(--ui-text-secondary);
    font-size: 14px;
    line-height: 1;
    z-index: 2;
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

  .accounts-row-action-btn {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--color-stroke-ui-dark);
    color: var(--ui-text-main);
  }

  .accounts-inline-refresh-btn {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--color-stroke-ui-dark);
    color: var(--ui-text-main);
    transition:
      opacity 0.2s ease,
      background-color 0.2s ease;

    &:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  }

  .accounts-row-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 30;
    min-width: 190px;
    padding: 6px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  }

  .accounts-row-menu__item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--ui-text-main);
    text-align: left;
    font-size: 13px;
  }

  .accounts-row-menu__item:hover {
    background: var(--color-stroke-ui-dark);
  }

  .accounts-row-menu__item.danger {
    color: var(--ui-sticker-danger);
  }
</style>
