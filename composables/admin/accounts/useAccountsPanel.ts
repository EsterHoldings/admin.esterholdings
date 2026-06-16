import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { navigateTo } from "nuxt/app";
import { useLocalePath } from "~/.nuxt/imports";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import AccountsPanelEdit from "~/pages/admin/accounts/components/AccountsPanelEdit.vue";

export type ViewMode = "cards" | "table" | "full";
export type MetricFilterId = "total_accounts" | "new_today" | "new_week" | "new_month";
export type FilterKey =
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

export type AccountFilters = Record<FilterKey, string>;
export type SelectFilterKey = Exclude<
  FilterKey,
  "balance_from" | "balance_to" | "created_at_from" | "created_at_to" | "updated_at_from" | "updated_at_to"
>;
type DynamicSelectFilterKey = Extract<
  SelectFilterKey,
  "id" | "user_id" | "owner_name" | "owner_email" | "owner_phone" | "number" | "type_name" | "type_group"
>;
type RemoteSelectFilterKey = Exclude<SelectFilterKey, "is_favorite">;
type DynamicFilterOptionsMap = Record<DynamicSelectFilterKey, SelectOption[]>;
type FilterSearchQueryMap = Record<SelectFilterKey, string>;

export interface AdminAccount {
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

export interface AccountsStats {
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

export interface SelectOption {
  id: string;
  value: string;
  text: string;
}

export interface AccountsMetricFilterCard {
  id: MetricFilterId;
  label: string;
  value: string;
  icon: string;
}

export interface AccountsBalanceSegment {
  id: string;
  label: string;
  value: string;
}

export interface AccountsFilterChip {
  key: FilterKey;
  label: string;
  value: string;
}

export interface AccountsFilterSelectField {
  key: SelectFilterKey;
  label: string;
  options: SelectOption[];
  searchable?: boolean;
}

export interface AccountsFilterDateField {
  key: FilterKey;
  label: string;
}

export interface AccountsViewOption {
  value: ViewMode;
  label: string;
  icon: string;
}

export interface AccountsPanelProps {
  DEFAULT_ORDER_BY: string;
  ORDER_DIRECTION_ASC: string;
  ORDER_DIRECTION_DESC: string;
  metricFilterCards: AccountsMetricFilterCard[];
  activeMetricFilter: MetricFilterId;
  applyMetricFilter: (metric: MetricFilterId) => Promise<void>;
  resolveText: (key: string, fallback: string) => string;
  balanceSegments: AccountsBalanceSegment[];
  searchDraft: string;
  isLoadingSearch: boolean;
  handleSearchInput: (value: string | undefined) => void;
  isLoading: boolean;
  isStatsLoading: boolean;
  handleClickRefresh: () => Promise<void>;
  orderBy: string;
  sortByOptions: SelectOption[];
  handleOrderBy: (value: string) => Promise<void>;
  orderDirection: string;
  toggleOrderDirection: () => Promise<void>;
  viewOptions: AccountsViewOption[];
  viewMode: ViewMode;
  handleChangeViewMode: (value: string) => Promise<void>;
  toggleFiltersPopover: (event: MouseEvent) => void;
  activeFilterChips: AccountsFilterChip[];
  removeAppliedFilter: (key: FilterKey) => Promise<void>;
  clearAllAppliedFilters: () => Promise<void>;
  setFiltersPopoverRef: (component: any | null) => void;
  hideFiltersPopover: () => void;
  filterSelectFieldOptions: AccountsFilterSelectField[];
  draftFilters: AccountFilters;
  setDraftFilterValue: (key: FilterKey, value: unknown) => void;
  handleFilterOptionOpen: (key: SelectFilterKey) => Promise<void>;
  handleFilterOptionSearch: (key: SelectFilterKey, query: string) => void;
  filterTextFieldOptions: AccountsFilterSelectField[];
  filterDateFieldOptions: AccountsFilterDateField[];
  resetDraftFilters: () => void;
  applyDraftFilters: () => Promise<void>;
  isInitialLoading: boolean;
  accountsData: AdminAccount[];
  handleOpenAccountPage: (account: AdminAccount) => void;
  getTwoCharsByFullName: (fullName?: string) => string;
  formatMoney: (value: number, currency?: string) => string;
  canUpdateAccounts: boolean;
  refreshingAccountId: string | null;
  handleRefreshBalance: (account: AdminAccount) => Promise<void>;
  formatDate: (date?: string) => string;
  showActionColumn: boolean;
  toggleActionMenu: (event: MouseEvent, account: AdminAccount) => void;
  canDeleteAccounts: boolean;
  handleOpenEditModal: (account: AdminAccount) => void;
  handleDeleteAccount: (account: AdminAccount) => Promise<void>;
  totalRows: number;
  page: number;
  perPage: number;
  handlePaginatorPage: (event: { page: number; rows: number }) => Promise<void>;
  pageReport: string;
  setActionMenuRef: (component: any | null) => void;
  actionMenuItems: unknown[];
}

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";
const VIEW_MODE_STORAGE_KEY = "adminAccountsViewMode";
const DEFAULT_PER_PAGE = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_ORDER_BY = "created_at";
const DEFAULT_VIEW_MODE: ViewMode = "table";
const DEFAULT_METRIC_FILTER: MetricFilterId = "total_accounts";
const ORDER_BY_OPTIONS = ["created_at", "number", "balance", "user_id"] as const;
const METRIC_FILTER_IDS = ["total_accounts", "new_today", "new_week", "new_month"] as const;
const METRIC_MANAGED_FILTER_KEYS: FilterKey[] = ["created_at_from", "created_at_to"];
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
const REMOTE_SELECT_FILTER_KEYS = [
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
] as const satisfies ReadonlyArray<RemoteSelectFilterKey>;
const QUERY_KEY_PAGE = "page";
const QUERY_KEY_PER_PAGE = "perPage";
const QUERY_KEY_SEARCH = "search";
const QUERY_KEY_ORDER_BY = "orderBy";
const QUERY_KEY_ORDER_DIRECTION = "orderDirection";
const QUERY_KEY_VIEW_MODE = "view";
const QUERY_KEY_METRIC = "metric";
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
    if (normalized !== "") return normalized;
  }

  return "";
};

const parsePositiveInt = (value: unknown, fallback: number, min = 1): number => {
  const parsed = Number.parseInt(getQueryValue(value), 10);
  if (!Number.isFinite(parsed) || parsed < min) return fallback;
  return parsed;
};

const isOrderByValue = (value: string): boolean =>
  ORDER_BY_OPTIONS.includes(value as (typeof ORDER_BY_OPTIONS)[number]);
const isOrderDirectionValue = (value: string): value is typeof ORDER_DIRECTION_ASC | typeof ORDER_DIRECTION_DESC =>
  value === ORDER_DIRECTION_ASC || value === ORDER_DIRECTION_DESC;
const isViewModeValue = (value: string): value is ViewMode =>
  value === "table" || value === "cards" || value === "full";
const isMetricFilterValue = (value: string): value is MetricFilterId =>
  METRIC_FILTER_IDS.includes(value as MetricFilterId);
const isFilterBracketQueryKey = (queryKey: string): boolean => {
  const matched = queryKey.match(/^filters\[(.+)\]$/);
  return Boolean(matched && FILTER_KEYS.includes(matched[1] as FilterKey));
};

const managedQueryKeys = new Set<string>([
  QUERY_KEY_PAGE,
  QUERY_KEY_PER_PAGE,
  QUERY_KEY_SEARCH,
  QUERY_KEY_ORDER_BY,
  QUERY_KEY_ORDER_DIRECTION,
  QUERY_KEY_VIEW_MODE,
  QUERY_KEY_METRIC,
  ...FILTER_KEYS.map(key => `${FILTER_QUERY_PREFIX}${key}`),
]);

const normalizeQuery = (query: LocationQuery | LocationQueryRaw): Record<string, string> =>
  Object.fromEntries(Object.entries(query).map(([key, value]) => [key, getQueryValue(value)]));

const areQueryObjectsEqual = (left: Record<string, string>, right: Record<string, string>): boolean => {
  const leftEntries = Object.entries(left).filter(([, value]) => value !== "");
  const rightEntries = Object.entries(right).filter(([, value]) => value !== "");

  if (leftEntries.length !== rightEntries.length) return false;

  for (const [key, value] of leftEntries) {
    if (right[key] !== value) return false;
  }

  return true;
};

export function useAccountsPanelState() {
  const { t, locale } = useI18n({ useScope: "global" });
  const route = useRoute();
  const router = useRouter();
  const localePath = useLocalePath();
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const toast = useToast();
  const { openModal } = inject("modalControl") as {
    openModal: (component: unknown, props?: Record<string, unknown>) => void;
  };

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : String(value);
  };

  const isLoading = ref(false);
  const isInitialLoading = ref(true);
  const isLoadingSearch = ref(false);
  const isStatsLoading = ref(false);

  const perPage = ref(DEFAULT_PER_PAGE);
  const page = ref(DEFAULT_PAGE);
  const totalRows = ref(0);
  const searchFilter = ref("");
  const searchDraft = ref("");
  const orderBy = ref<string>(DEFAULT_ORDER_BY);
  const orderDirection = ref<string>(ORDER_DIRECTION_DESC);
  const viewMode = ref<ViewMode>(DEFAULT_VIEW_MODE);
  const activeMetricFilter = ref<MetricFilterId>(DEFAULT_METRIC_FILTER);

  const accountsData = ref<AdminAccount[]>([]);
  const refreshingAccountId = ref<string | null>(null);
  const deletingAccountId = ref<string | null>(null);
  const activeActionAccount = ref<AdminAccount | null>(null);
  const actionMenu = ref<any | null>(null);
  const filtersPopover = ref<any | null>(null);
  const searchTimer = ref<ReturnType<typeof window.setTimeout> | null>(null);
  let latestLoadRequestId = 0;
  let latestSearchToken = 0;

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

  const canUpdateAccounts = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-accounts")
  );
  const canDeleteAccounts = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("delete-accounts")
  );
  const showActionColumn = computed(() => canUpdateAccounts.value || canDeleteAccounts.value);

  const formatDateInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const metricDateRange = (metric: MetricFilterId): Partial<AccountFilters> => {
    const today = new Date();
    const end = formatDateInput(today);

    if (metric === "new_today") {
      return { created_at_from: end, created_at_to: end };
    }

    if (metric === "new_week") {
      const start = new Date(today);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
      return { created_at_from: formatDateInput(start), created_at_to: end };
    }

    if (metric === "new_month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { created_at_from: formatDateInput(start), created_at_to: end };
    }

    return { created_at_from: "", created_at_to: "" };
  };

  const applyMetricFiltersToState = (metric: MetricFilterId, filters: AccountFilters): AccountFilters => ({
    ...filters,
    created_at_from: "",
    created_at_to: "",
    ...metricDateRange(metric),
  });

  const sortByOptions = computed(() => [
    {
      id: "created_at",
      value: "created_at",
      text: resolveText("admin.accounts.components.accounts-panel.columns.created_at", "Created at"),
    },
    { id: "number", value: "number", text: resolveText("admin.accounts.columns.number", "Account number") },
    { id: "balance", value: "balance", text: resolveText("admin.accounts.columns.balance", "Balance") },
    { id: "user_id", value: "user_id", text: resolveText("admin.accounts.filters.fields.user_id", "User ID") },
  ]);

  const viewOptions = computed(() => [
    { value: "table" as const, label: resolveText("admin.accounts.view.table", "Table"), icon: "pi pi-list" },
    { value: "cards" as const, label: resolveText("admin.accounts.view.cards", "Cards"), icon: "pi pi-th-large" },
    { value: "full" as const, label: resolveText("admin.accounts.view.full", "Full width cards"), icon: "pi pi-bars" },
  ]);

  const metricFilterCards = computed(() => [
    {
      id: "total_accounts" as const,
      label: resolveText("admin.accounts.stats.totalAccounts", "Total accounts"),
      value: formatCount(statsData.value.total_accounts),
      icon: "pi pi-wallet",
    },
    {
      id: "new_today" as const,
      label: resolveText("admin.accounts.stats.newToday", "New accounts today"),
      value: formatCount(statsData.value.new_accounts.today),
      icon: "pi pi-calendar",
    },
    {
      id: "new_week" as const,
      label: resolveText("admin.accounts.stats.newWeek", "New accounts this week"),
      value: formatCount(statsData.value.new_accounts.week),
      icon: "pi pi-calendar-plus",
    },
    {
      id: "new_month" as const,
      label: resolveText("admin.accounts.stats.newMonth", "New accounts this month"),
      value: formatCount(statsData.value.new_accounts.month),
      icon: "pi pi-chart-line",
    },
  ]);

  const balanceSegments = computed(() => [
    {
      id: "today",
      label: resolveText("admin.accounts.stats.balanceToday", "Today"),
      value: formatMoney(statsData.value.balance_sum.today),
    },
    {
      id: "week",
      label: resolveText("admin.accounts.stats.balanceWeek", "Week"),
      value: formatMoney(statsData.value.balance_sum.week),
    },
    {
      id: "month",
      label: resolveText("admin.accounts.stats.balanceMonth", "Month"),
      value: formatMoney(statsData.value.balance_sum.month),
    },
    {
      id: "year",
      label: resolveText("admin.accounts.stats.balanceYear", "Year"),
      value: formatMoney(statsData.value.balance_sum.year),
    },
  ]);

  const normalizeSelectOptions = (items: any[] = []): SelectOption[] =>
    items.map((item: any) => ({
      id: String(item?.id ?? item?.value ?? ""),
      value: String(item?.value ?? item?.id ?? ""),
      text: String(item?.text ?? item?.name ?? item?.label ?? item?.value ?? item?.id ?? "-"),
    }));

  const filterOptionsByQuery = (options: SelectOption[], query: string): SelectOption[] => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter(option => `${option.text} ${option.value}`.trim().toLowerCase().includes(normalizedQuery));
  };

  const isDynamicSelectFilterKey = (key: SelectFilterKey): key is DynamicSelectFilterKey =>
    (DYNAMIC_SELECT_FILTER_KEYS as readonly string[]).includes(key);
  const isRemoteSelectFilterKey = (key: SelectFilterKey): key is RemoteSelectFilterKey =>
    (REMOTE_SELECT_FILTER_KEYS as readonly string[]).includes(key);

  const getFilterOptions = (key: SelectFilterKey): SelectOption[] => {
    const query = filterSearchQueries.value[key] ?? "";

    if (isDynamicSelectFilterKey(key)) {
      return filterOptionsByQuery(dynamicFilterOptions.value[key] ?? [], query);
    }

    const baseOptionsMap: Partial<Record<SelectFilterKey, SelectOption[]>> = {
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

    return fields;
  });

  const filterDateFieldOptions = computed(() => [
    {
      key: "created_at_from" as FilterKey,
      label: resolveText("admin.accounts.filters.fields.created_at_from", "Created from"),
    },
    {
      key: "created_at_to" as FilterKey,
      label: resolveText("admin.accounts.filters.fields.created_at_to", "Created to"),
    },
    {
      key: "updated_at_from" as FilterKey,
      label: resolveText("admin.accounts.filters.fields.updated_at_from", "Updated from"),
    },
    {
      key: "updated_at_to" as FilterKey,
      label: resolveText("admin.accounts.filters.fields.updated_at_to", "Updated to"),
    },
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

  const getFilterOptionText = (options: SelectOption[], value: string): string =>
    options.find(option => option.value === value)?.text ?? value;

  const getFilterDisplayValue = (key: FilterKey, value: string): string => {
    switch (key) {
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
      .filter(
        ([key, value]) =>
          sanitizeFilterValue(value) !== "" &&
          !(activeMetricFilter.value !== DEFAULT_METRIC_FILTER && METRIC_MANAGED_FILTER_KEYS.includes(key))
      )
      .map(([key, value]) => ({
        key,
        label: filterLabelMap.value[key] ?? key,
        value: getFilterDisplayValue(key, value),
      }))
  );

  const actionMenuItems = computed(() => {
    const account = activeActionAccount.value;
    if (!account) return [];

    return [
      canUpdateAccounts.value
        ? {
            label: resolveText("admin.accounts.actions.edit", "Edit"),
            icon: "pi pi-pencil",
            command: () => handleOpenEditModal(account),
          }
        : null,
      canUpdateAccounts.value
        ? {
            label: resolveText("admin.accounts.actions.refreshBalance", "Refresh balance"),
            icon: "pi pi-refresh",
            command: () => handleRefreshBalance(account),
          }
        : null,
      canDeleteAccounts.value
        ? {
            label: resolveText("admin.accounts.actions.archive", "Archive"),
            icon: "pi pi-archive",
            class: "account-action-danger",
            command: () => handleDeleteAccount(account),
          }
        : null,
    ].filter(Boolean);
  });

  const pageReport = computed(() => {
    if (totalRows.value === 0) {
      return resolveText("admin.accounts.pagination.empty", "0 accounts");
    }

    const first = (page.value - 1) * perPage.value + 1;
    const last = Math.min(page.value * perPage.value, totalRows.value);
    return resolveText("admin.accounts.pagination.report", "{first} to {last} / Total: {total}")
      .replace("{first}", formatCount(first))
      .replace("{last}", formatCount(last))
      .replace("{total}", formatCount(totalRows.value));
  });

  const initViewMode = () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved && isViewModeValue(saved)) {
      viewMode.value = saved;
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
    searchDraft.value = searchFilter.value;

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

    const queryMetric = getQueryValue(query[QUERY_KEY_METRIC]);
    if (isMetricFilterValue(queryMetric)) {
      activeMetricFilter.value = queryMetric;
    }

    const parsedFilters = applyMetricFiltersToState(activeMetricFilter.value, getQueryFilters(query));
    appliedFilters.value = parsedFilters;
    draftFilters.value = cloneFilters(parsedFilters);
  };

  const buildStateQuery = (): Record<string, string> => {
    const query: Record<string, string> = {};

    if (page.value > DEFAULT_PAGE) query[QUERY_KEY_PAGE] = String(page.value);
    if (perPage.value !== DEFAULT_PER_PAGE) query[QUERY_KEY_PER_PAGE] = String(perPage.value);

    const normalizedSearch = sanitizeFilterValue(searchFilter.value);
    if (normalizedSearch !== "") query[QUERY_KEY_SEARCH] = normalizedSearch;
    if (orderBy.value !== DEFAULT_ORDER_BY) query[QUERY_KEY_ORDER_BY] = orderBy.value;
    if (orderDirection.value !== ORDER_DIRECTION_DESC) query[QUERY_KEY_ORDER_DIRECTION] = orderDirection.value;
    if (viewMode.value !== DEFAULT_VIEW_MODE) query[QUERY_KEY_VIEW_MODE] = viewMode.value;
    if (activeMetricFilter.value !== DEFAULT_METRIC_FILTER) query[QUERY_KEY_METRIC] = activeMetricFilter.value;

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

    if (areQueryObjectsEqual(currentQuery, nextQuery)) return;

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
    const requestId = ++latestLoadRequestId;
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
      if (requestId !== latestLoadRequestId) return;

      const payload = response?.data?.data ?? {};
      totalRows.value = Number(payload?.total ?? 0);
      accountsData.value = Array.isArray(payload?.data) ? payload.data : [];
    } catch (error: any) {
      if (requestId !== latestLoadRequestId) return;

      totalRows.value = 0;
      accountsData.value = [];
      toast.error(
        error?.response?.data?.message || resolveText("admin.accounts.messages.loadError", "Failed to load accounts.")
      );
    } finally {
      if (requestId === latestLoadRequestId) {
        isLoading.value = false;
      }
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

  const loadFilterMeta = async (options: { filterField?: RemoteSelectFilterKey; filterSearch?: string } = {}) => {
    const { filterField, filterSearch = "" } = options;

    try {
      const response = await appCore.adminModules.accounts.getMeta({
        filter_field: filterField,
        filter_search: filterSearch,
        limit: 25,
      });
      const payload = response?.data?.data ?? {};

      if (!filterField) {
        accountTypeFilterOptions.value = normalizeSelectOptions(
          Array.isArray(payload?.account_types) ? payload.account_types : []
        );
        leverageFilterOptions.value = normalizeSelectOptions(
          Array.isArray(payload?.leverages) ? payload.leverages : []
        );
        currencyFilterOptions.value = normalizeSelectOptions(
          Array.isArray(payload?.currencies) ? payload.currencies : []
        );
        paymentTypeFilterOptions.value = normalizeSelectOptions(
          Array.isArray(payload?.payment_types) ? payload.payment_types : []
        );
      }

      accountFilterFeatures.value = {
        currency: Boolean(payload?.features?.currency ?? true),
        payment_type: Boolean(payload?.features?.payment_type ?? true),
      };

      const filterOptions = payload?.filter_options ?? {};
      const nextDynamicOptions = { ...dynamicFilterOptions.value };

      if (filterField) {
        const normalizedOptions = normalizeSelectOptions(
          Array.isArray(filterOptions?.[filterField]) ? filterOptions[filterField] : []
        );

        switch (filterField) {
          case "type_id":
            accountTypeFilterOptions.value = normalizedOptions;
            break;
          case "leverage_id":
            leverageFilterOptions.value = normalizedOptions;
            break;
          case "currency":
            currencyFilterOptions.value = normalizedOptions;
            break;
          case "payment_type":
            paymentTypeFilterOptions.value = normalizedOptions;
            break;
          default:
            if (isDynamicSelectFilterKey(filterField)) {
              nextDynamicOptions[filterField] = normalizedOptions;
            }
            break;
        }
      } else {
        for (const key of DYNAMIC_SELECT_FILTER_KEYS) {
          if (Array.isArray(filterOptions?.[key])) {
            nextDynamicOptions[key] = normalizeSelectOptions(filterOptions[key]);
          }
        }
      }

      dynamicFilterOptions.value = nextDynamicOptions;
    } catch {
      if (filterField) return;

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

    openModal(AccountsPanelEdit, {
      id: account.id,
      title: resolveText("admin.accounts.form.titles.edit", "Edit account"),
    });
  };

  const toggleActionMenu = (event: MouseEvent, account: AdminAccount) => {
    if (!showActionColumn.value) return;

    activeActionAccount.value = account;
    actionMenu.value?.toggle(event);
  };

  const replaceAccountInList = (nextAccount: AdminAccount) => {
    accountsData.value = accountsData.value.map(account =>
      account.id === nextAccount.id ? { ...account, ...nextAccount } : account
    );
  };

  const handleRefreshBalance = async (account: AdminAccount) => {
    if (!account?.id || !canUpdateAccounts.value || refreshingAccountId.value === account.id) return;

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

    const confirmed = window.confirm(resolveText("admin.accounts.messages.archiveConfirm", "Archive this account?"));
    if (!confirmed) return;

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

  const handlePaginatorPage = async (event: { page: number; rows: number }) => {
    const nextPage = Number(event.page ?? 0) + 1;
    const nextRows = Number(event.rows ?? perPage.value);

    const pageChanged = nextPage !== page.value;
    const rowsChanged = nextRows !== perPage.value;

    page.value = rowsChanged ? DEFAULT_PAGE : nextPage;
    perPage.value = nextRows;

    if (pageChanged || rowsChanged) {
      await loadData();
      await syncStateToUrl();
    }
  };

  const runSearch = async (token: number) => {
    searchFilter.value = searchDraft.value;
    await loadData({ resetPage: true });
    await syncStateToUrl();

    if (token === latestSearchToken) {
      isLoadingSearch.value = false;
    }
  };

  const handleSearchInput = (value: string | undefined) => {
    searchDraft.value = String(value ?? "");
    latestSearchToken += 1;
    const token = latestSearchToken;

    if (searchTimer.value) {
      window.clearTimeout(searchTimer.value);
    }

    isLoadingSearch.value = true;
    searchTimer.value = window.setTimeout(() => {
      searchTimer.value = null;
      void runSearch(token);
    }, 450);
  };

  const handleOrderBy = async (value: string) => {
    orderBy.value = value;
    await loadData({ resetPage: true });
    await syncStateToUrl();
  };

  const toggleOrderDirection = async () => {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
    await loadData({ resetPage: true });
    await syncStateToUrl();
  };

  const handleChangeViewMode = async (value: string) => {
    if (value === "table" || value === "cards" || value === "full") {
      viewMode.value = value;
      if (typeof window !== "undefined") {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, value);
      }
      await syncStateToUrl();
    }
  };

  const handleClickRefresh = async () => {
    await loadAll();
    await syncStateToUrl();
  };

  const applyMetricFilter = async (metric: MetricFilterId) => {
    activeMetricFilter.value = metric;
    appliedFilters.value = applyMetricFiltersToState(metric, appliedFilters.value);
    draftFilters.value = cloneFilters(appliedFilters.value);
    await loadData({ resetPage: true });
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

    if (!isRemoteSelectFilterKey(key)) return;

    const activeTimer = filterSearchTimers.get(key);
    if (activeTimer) {
      window.clearTimeout(activeTimer);
    }

    filterSearchTimers.set(
      key,
      window.setTimeout(async () => {
        await loadFilterMeta({ filterField: key, filterSearch: query });
      }, 400)
    );
  };

  const handleFilterOptionOpen = async (key: SelectFilterKey) => {
    if (!isRemoteSelectFilterKey(key)) return;

    await loadFilterMeta({
      filterField: key,
      filterSearch: filterSearchQueries.value[key] ?? "",
    });
  };

  const toggleFiltersPopover = (event: MouseEvent) => {
    draftFilters.value = cloneFilters(appliedFilters.value);
    resetFilterSearchQueries();
    filtersPopover.value?.toggle(event);
  };

  const hideFiltersPopover = () => {
    filtersPopover.value?.hide();
  };

  const resetDraftFilters = () => {
    draftFilters.value = applyMetricFiltersToState(activeMetricFilter.value, createEmptyFilters());
    resetFilterSearchQueries();
  };

  const applyDraftFilters = async () => {
    appliedFilters.value = cloneFilters(draftFilters.value);
    activeMetricFilter.value = DEFAULT_METRIC_FILTER;
    hideFiltersPopover();
    resetFilterSearchQueries();
    await loadData({ resetPage: true });
    await syncStateToUrl();
  };

  const removeAppliedFilter = async (key: FilterKey) => {
    appliedFilters.value = { ...appliedFilters.value, [key]: "" };
    draftFilters.value = { ...draftFilters.value, [key]: "" };

    if (METRIC_MANAGED_FILTER_KEYS.includes(key)) {
      activeMetricFilter.value = DEFAULT_METRIC_FILTER;
    }

    await loadData({ resetPage: true });
    await syncStateToUrl();
  };

  const clearAllAppliedFilters = async () => {
    activeMetricFilter.value = DEFAULT_METRIC_FILTER;
    appliedFilters.value = createEmptyFilters();
    draftFilters.value = createEmptyFilters();
    resetFilterSearchQueries();
    await loadData({ resetPage: true });
    await syncStateToUrl();
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

  const getTwoCharsByFullName = (fullName?: string): string => {
    const segments = String(fullName ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return `${segments[0]?.charAt(0) ?? ""}${segments[1]?.charAt(0) ?? ""}`;
  };

  onMounted(async () => {
    initViewMode();
    initStateFromQuery();
    await loadFilterMeta();
    await syncStateToUrl();
    await loadAll();
    isInitialLoading.value = false;

    useEventBus.on("loadDataForAdminAccounts", handleExternalReload);
  });

  onBeforeUnmount(() => {
    if (searchTimer.value) {
      window.clearTimeout(searchTimer.value);
      searchTimer.value = null;
    }

    filterSearchTimers.forEach(timerId => window.clearTimeout(timerId));
    filterSearchTimers.clear();
    useEventBus.off("loadDataForAdminAccounts", handleExternalReload);
  });

  const setActionMenuRef = (component: any | null) => {
    actionMenu.value = component;
  };

  const setFiltersPopoverRef = (component: any | null) => {
    filtersPopover.value = component;
  };

  const accountsPanelProps = computed<AccountsPanelProps>(() => ({
    DEFAULT_ORDER_BY,
    ORDER_DIRECTION_ASC,
    ORDER_DIRECTION_DESC,
    metricFilterCards: metricFilterCards.value,
    activeMetricFilter: activeMetricFilter.value,
    applyMetricFilter,
    resolveText,
    balanceSegments: balanceSegments.value,
    searchDraft: searchDraft.value,
    isLoadingSearch: isLoadingSearch.value,
    handleSearchInput,
    isLoading: isLoading.value,
    isStatsLoading: isStatsLoading.value,
    handleClickRefresh,
    orderBy: orderBy.value,
    sortByOptions: sortByOptions.value,
    handleOrderBy,
    orderDirection: orderDirection.value,
    toggleOrderDirection,
    viewOptions: viewOptions.value,
    viewMode: viewMode.value,
    handleChangeViewMode,
    toggleFiltersPopover,
    activeFilterChips: activeFilterChips.value,
    removeAppliedFilter,
    clearAllAppliedFilters,
    setFiltersPopoverRef,
    hideFiltersPopover,
    filterSelectFieldOptions: filterSelectFieldOptions.value,
    draftFilters: draftFilters.value,
    setDraftFilterValue,
    handleFilterOptionOpen,
    handleFilterOptionSearch,
    filterTextFieldOptions: filterTextFieldOptions.value,
    filterDateFieldOptions: filterDateFieldOptions.value,
    resetDraftFilters,
    applyDraftFilters,
    isInitialLoading: isInitialLoading.value,
    accountsData: accountsData.value,
    handleOpenAccountPage,
    getTwoCharsByFullName,
    formatMoney,
    canUpdateAccounts: canUpdateAccounts.value,
    refreshingAccountId: refreshingAccountId.value,
    handleRefreshBalance,
    formatDate,
    showActionColumn: showActionColumn.value,
    toggleActionMenu,
    canDeleteAccounts: canDeleteAccounts.value,
    handleOpenEditModal,
    handleDeleteAccount,
    totalRows: totalRows.value,
    page: page.value,
    perPage: perPage.value,
    handlePaginatorPage,
    pageReport: pageReport.value,
    setActionMenuRef,
    actionMenuItems: actionMenuItems.value,
  }));

  return {
    accountsPanelProps,
  };
}
