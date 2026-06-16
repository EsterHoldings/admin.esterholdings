import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { debounce } from "~/utils/helper/debounce";
import { navigateTo } from "nuxt/app";
import { useLocalePath, useNuxtApp } from "~/.nuxt/imports";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";

export type ViewMode = "cards" | "table" | "full";

export interface AdminClient {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birthdate?: string;
  created_at?: string;
  photo_url?: string;
  is_online?: boolean;
  acquisition_source?: string;
  acquisition_source_label?: string;
  registration_method?: string;
  registration_method_label?: string;
  social_provider?: string | null;
  referrer_email?: string | null;
  referrer_name?: string | null;
}

export interface ClientsStats {
  online_clients_now: number;
  new_clients: {
    today: number;
    week: number;
    month: number;
  };
}

export interface SelectOption {
  id: string;
  value: string;
  text: string;
}

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";
const VIEW_MODE_STORAGE_KEY = "adminClientsViewMode";
const ONLINE_REFRESH_INTERVAL_MS = 60_000;
const ONLINE_REALTIME_SYNC_DEBOUNCE_MS = 1000;
const ONLINE_REALTIME_RETRY_INTERVAL_MS = 30_000;
const DEFAULT_PER_PAGE = 6;
const DEFAULT_PAGE = 1;
const DEFAULT_ORDER_BY = "created_at";
const DEFAULT_VIEW_MODE: ViewMode = "table";
const ORDER_BY_OPTIONS = ["created_at", "first_name", "email"] as const;
const QUERY_KEY_PAGE = "page";
const QUERY_KEY_PER_PAGE = "perPage";
const QUERY_KEY_SEARCH = "search";
const QUERY_KEY_ORDER_BY = "orderBy";
const QUERY_KEY_ORDER_DIRECTION = "orderDirection";
const QUERY_KEY_VIEW_MODE = "view";
const FILTER_QUERY_PREFIX = "filter_";

const ALL_SEARCH_FIELDS = [
  "id",
  "email",
  "first_name",
  "mid_name",
  "last_name",
  "phone",
  "birthdate",
  "country",
  "state",
  "city",
  "address",
  "postal_code",
  "provider_name",
  "provider_id",
  "email_verified_at",
  "updated_at",
  "created_at",
];

export type FilterKey =
  | "id"
  | "email"
  | "first_name"
  | "mid_name"
  | "last_name"
  | "phone"
  | "country"
  | "state"
  | "city"
  | "address"
  | "postal_code"
  | "provider_name"
  | "provider_id"
  | "online_status"
  | "email_verified"
  | "has_photo"
  | "two_factor_enabled"
  | "created_period"
  | "birthdate_from"
  | "birthdate_to"
  | "created_at_from"
  | "created_at_to"
  | "email_verified_at_from"
  | "email_verified_at_to"
  | "updated_at_from"
  | "updated_at_to";

export type ClientFilters = Record<FilterKey, string>;
export type SelectFilterKey = Extract<
  FilterKey,
  | "online_status"
  | "email_verified"
  | "has_photo"
  | "two_factor_enabled"
  | "created_period"
  | "id"
  | "email"
  | "first_name"
  | "mid_name"
  | "last_name"
  | "phone"
  | "country"
  | "state"
  | "city"
  | "address"
  | "postal_code"
  | "provider_name"
  | "provider_id"
>;
type DynamicSelectFilterKey = Extract<
  SelectFilterKey,
  | "id"
  | "email"
  | "first_name"
  | "mid_name"
  | "last_name"
  | "phone"
  | "country"
  | "state"
  | "city"
  | "address"
  | "postal_code"
  | "provider_name"
  | "provider_id"
>;
type RemoteSelectFilterKey = DynamicSelectFilterKey;
type DynamicFilterOptionsMap = Record<DynamicSelectFilterKey, SelectOption[]>;
export type FilterSearchQueryMap = Record<SelectFilterKey, string>;

const createEmptyFilters = (): ClientFilters => ({
  id: "",
  email: "",
  first_name: "",
  mid_name: "",
  last_name: "",
  phone: "",
  country: "",
  state: "",
  city: "",
  address: "",
  postal_code: "",
  provider_name: "",
  provider_id: "",
  online_status: "",
  email_verified: "",
  has_photo: "",
  two_factor_enabled: "",
  created_period: "",
  birthdate_from: "",
  birthdate_to: "",
  created_at_from: "",
  created_at_to: "",
  email_verified_at_from: "",
  email_verified_at_to: "",
  updated_at_from: "",
  updated_at_to: "",
});

const cloneFilters = (source: ClientFilters): ClientFilters => ({ ...source });
const FILTER_KEYS = Object.keys(createEmptyFilters()) as FilterKey[];
const SELECT_FILTER_KEYS = [
  "online_status",
  "email_verified",
  "has_photo",
  "two_factor_enabled",
  "created_period",
  "id",
  "email",
  "first_name",
  "mid_name",
  "last_name",
  "phone",
  "country",
  "state",
  "city",
  "address",
  "postal_code",
  "provider_name",
  "provider_id",
] as const satisfies ReadonlyArray<SelectFilterKey>;
const DYNAMIC_SELECT_FILTER_KEYS = [
  "id",
  "email",
  "first_name",
  "mid_name",
  "last_name",
  "phone",
  "country",
  "state",
  "city",
  "address",
  "postal_code",
  "provider_name",
  "provider_id",
] as const satisfies ReadonlyArray<DynamicSelectFilterKey>;

const createEmptyDynamicFilterOptions = (): DynamicFilterOptionsMap => ({
  id: [],
  email: [],
  first_name: [],
  mid_name: [],
  last_name: [],
  phone: [],
  country: [],
  state: [],
  city: [],
  address: [],
  postal_code: [],
  provider_name: [],
  provider_id: [],
});

const createEmptyFilterSearchQueries = (): FilterSearchQueryMap => ({
  online_status: "",
  email_verified: "",
  has_photo: "",
  two_factor_enabled: "",
  created_period: "",
  id: "",
  email: "",
  first_name: "",
  mid_name: "",
  last_name: "",
  phone: "",
  country: "",
  state: "",
  city: "",
  address: "",
  postal_code: "",
  provider_name: "",
  provider_id: "",
});

const sanitizeFilterValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return "";
  }

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

export function useClientsPage() {
  const { t, locale } = useI18n({ useScope: "global" });
  const route = useRoute();
  const router = useRouter();
  const localePath = useLocalePath();
  const appCore = useAppCore();
  const toast = useToast();
  const { $echo } = useNuxtApp() as unknown as { $echo?: any };

  const getNormalizedRoutePath = () => {
    const segments = route.path.split("/").filter(Boolean);
    const currentLocale = String(locale.value ?? "")
      .trim()
      .toLowerCase();

    if (currentLocale !== "" && segments[0]?.toLowerCase() === currentLocale) {
      segments.shift();
    }

    return `/${segments.join("/")}`;
  };

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const isClientsIndexRoute = computed(() => getNormalizedRoutePath() === "/clients");

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

  const clientsData = ref<AdminClient[]>([]);
  const statsData = ref<ClientsStats>({
    online_clients_now: 0,
    new_clients: {
      today: 0,
      week: 0,
      month: 0,
    },
  });

  const appliedFilters = ref<ClientFilters>(createEmptyFilters());
  const draftFilters = ref<ClientFilters>(createEmptyFilters());
  const isFiltersPopoverOpen = ref(false);
  const activeClientMenuId = ref<string | null>(null);
  const deletingClientId = ref<string | null>(null);
  const filtersTriggerRef = ref<HTMLElement | null>(null);
  const filtersPopoverPanelRef = ref<HTMLElement | null>(null);
  const filtersPopoverStyle = ref<Record<string, string>>({});
  const dynamicFilterOptions = ref<DynamicFilterOptionsMap>(createEmptyDynamicFilterOptions());
  const filterSearchQueries = ref<FilterSearchQueryMap>(createEmptyFilterSearchQueries());
  const filterSearchTimers = new Map<SelectFilterKey, ReturnType<typeof window.setTimeout>>();

  let pollingTimer: ReturnType<typeof setInterval> | null = null;
  let supportGlobalChannel: any = null;
  let realtimeSyncTimer: ReturnType<typeof setTimeout> | null = null;
  let realtimeSyncInFlight = false;
  let realtimeSyncQueued = false;
  let realtimeRetryTimer: ReturnType<typeof setInterval> | null = null;
  let realtimeSocketStateHandler: ((states: any) => void) | null = null;
  let realtimeResumeListenersAttached = false;

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

  const resetFilterSearchQueries = () => {
    filterSearchQueries.value = createEmptyFilterSearchQueries();
  };

  const getFilterOptionText = (options: SelectOption[], value: string): string => {
    return options.find(option => option.value === value)?.text ?? value;
  };

  const filterTextFieldOptions = computed(() => [
    { key: "id" as DynamicSelectFilterKey, label: "ID", options: getFilterOptions("id") },
    {
      key: "email" as DynamicSelectFilterKey,
      label: resolveText("admin.accounts.components.accounts-panel.columns.email", "Email"),
      options: getFilterOptions("email"),
    },
    {
      key: "first_name" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.components.clients-panel.columns.first_name", "First name"),
      options: getFilterOptions("first_name"),
    },
    {
      key: "mid_name" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.filters.fields.mid_name", "Middle name"),
      options: getFilterOptions("mid_name"),
    },
    {
      key: "last_name" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.components.clients-panel.columns.last_name", "Last name"),
      options: getFilterOptions("last_name"),
    },
    {
      key: "phone" as DynamicSelectFilterKey,
      label: resolveText("admin.accounts.components.accounts-panel.columns.phone", "Phone"),
      options: getFilterOptions("phone"),
    },
    {
      key: "country" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.columns.country", "Country"),
      options: getFilterOptions("country"),
    },
    {
      key: "state" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.columns.state", "State / Region"),
      options: getFilterOptions("state"),
    },
    {
      key: "city" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.columns.city", "City"),
      options: getFilterOptions("city"),
    },
    {
      key: "address" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.columns.address", "Address"),
      options: getFilterOptions("address"),
    },
    {
      key: "postal_code" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.columns.postalCode", "Postal code"),
      options: getFilterOptions("postal_code"),
    },
    {
      key: "provider_name" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.filters.fields.provider_name", "Provider name"),
      options: getFilterOptions("provider_name"),
    },
    {
      key: "provider_id" as DynamicSelectFilterKey,
      label: resolveText("admin.clients.filters.fields.provider_id", "Provider ID"),
      options: getFilterOptions("provider_id"),
    },
  ]);

  const onlineStatusOptions = computed(() => [
    { id: "online", value: "online", text: resolveText("admin.clients.filters.values.online", "Online") },
    { id: "offline", value: "offline", text: resolveText("admin.clients.filters.values.offline", "Offline") },
  ]);

  const emailVerifiedOptions = computed(() => [
    { id: "verified", value: "verified", text: resolveText("admin.clients.filters.values.verified", "Verified") },
    {
      id: "unverified",
      value: "unverified",
      text: resolveText("admin.clients.filters.values.unverified", "Unverified"),
    },
  ]);

  const hasPhotoOptions = computed(() => [
    { id: "yes", value: "yes", text: resolveText("admin.clients.filters.values.yes", "Yes") },
    { id: "no", value: "no", text: resolveText("admin.clients.filters.values.no", "No") },
  ]);

  const twoFactorOptions = computed(() => [
    { id: "enabled", value: "enabled", text: resolveText("admin.clients.filters.values.enabled", "Enabled") },
    { id: "disabled", value: "disabled", text: resolveText("admin.clients.filters.values.disabled", "Disabled") },
  ]);

  const createdPeriodOptions = computed(() => [
    { id: "today", value: "today", text: resolveText("admin.clients.filters.values.today", "Today") },
    { id: "week", value: "week", text: resolveText("admin.clients.filters.values.week", "Week") },
    { id: "month", value: "month", text: resolveText("admin.clients.filters.values.month", "Month") },
  ]);

  const getFilterOptions = (key: SelectFilterKey): SelectOption[] => {
    const query = filterSearchQueries.value[key] ?? "";

    const staticOptionsMap: Partial<Record<SelectFilterKey, SelectOption[]>> = {
      online_status: onlineStatusOptions.value,
      email_verified: emailVerifiedOptions.value,
      has_photo: hasPhotoOptions.value,
      two_factor_enabled: twoFactorOptions.value,
      created_period: createdPeriodOptions.value,
    };

    if ((DYNAMIC_SELECT_FILTER_KEYS as readonly string[]).includes(key)) {
      return filterOptionsByQuery(dynamicFilterOptions.value[key as DynamicSelectFilterKey] ?? [], query);
    }

    return filterOptionsByQuery(staticOptionsMap[key] ?? [], query);
  };

  const filterSelectFieldOptions = computed<
    Array<{ key: SelectFilterKey; label: string; options: SelectOption[]; searchable?: boolean }>
  >(() => [
    {
      key: "online_status",
      label: resolveText("admin.clients.filters.fields.online_status", "Online status"),
      options: getFilterOptions("online_status"),
    },
    {
      key: "email_verified",
      label: resolveText("admin.clients.filters.fields.email_verified", "Email verification"),
      options: getFilterOptions("email_verified"),
    },
    {
      key: "has_photo",
      label: resolveText("admin.clients.filters.fields.has_photo", "Photo"),
      options: getFilterOptions("has_photo"),
    },
    {
      key: "two_factor_enabled",
      label: resolveText("admin.clients.filters.fields.two_factor_enabled", "2FA"),
      options: getFilterOptions("two_factor_enabled"),
    },
    {
      key: "created_period",
      label: resolveText("admin.clients.filters.fields.created_period", "Created period"),
      options: getFilterOptions("created_period"),
    },
  ]);

  const filterDateFieldOptions = computed(() => [
    { key: "birthdate_from" as FilterKey, label: t("admin.clients.filters.fields.birthdate_from", "Birthdate from") },
    { key: "birthdate_to" as FilterKey, label: t("admin.clients.filters.fields.birthdate_to", "Birthdate to") },
    { key: "created_at_from" as FilterKey, label: t("admin.clients.filters.fields.created_at_from", "Created from") },
    { key: "created_at_to" as FilterKey, label: t("admin.clients.filters.fields.created_at_to", "Created to") },
    {
      key: "email_verified_at_from" as FilterKey,
      label: t("admin.clients.filters.fields.email_verified_at_from", "Email verified from"),
    },
    {
      key: "email_verified_at_to" as FilterKey,
      label: t("admin.clients.filters.fields.email_verified_at_to", "Email verified to"),
    },
    { key: "updated_at_from" as FilterKey, label: t("admin.clients.filters.fields.updated_at_from", "Updated from") },
    { key: "updated_at_to" as FilterKey, label: t("admin.clients.filters.fields.updated_at_to", "Updated to") },
  ]);

  const isDynamicSelectFilterKey = (key: SelectFilterKey): key is DynamicSelectFilterKey =>
    (DYNAMIC_SELECT_FILTER_KEYS as readonly string[]).includes(key);

  const isRemoteSelectFilterKey = (key: SelectFilterKey): key is RemoteSelectFilterKey => isDynamicSelectFilterKey(key);

  const getFilterDisplayValue = (key: FilterKey, value: string): string => {
    if (isDynamicSelectFilterKey(key as SelectFilterKey)) {
      return getFilterOptionText(dynamicFilterOptions.value[key as DynamicSelectFilterKey] ?? [], value);
    }

    return filterValueLabelMap.value[value] ?? value;
  };

  const filterLabelMap = computed<Record<FilterKey, string>>(() => ({
    id: "ID",
    email: resolveText("admin.accounts.components.accounts-panel.columns.email", "Email"),
    first_name: resolveText("admin.clients.components.clients-panel.columns.first_name", "First name"),
    mid_name: resolveText("admin.clients.filters.fields.mid_name", "Middle name"),
    last_name: resolveText("admin.clients.components.clients-panel.columns.last_name", "Last name"),
    phone: resolveText("admin.accounts.components.accounts-panel.columns.phone", "Phone"),
    country: resolveText("admin.clients.columns.country", "Country"),
    state: resolveText("admin.clients.columns.state", "State / Region"),
    city: resolveText("admin.clients.columns.city", "City"),
    address: resolveText("admin.clients.columns.address", "Address"),
    postal_code: resolveText("admin.clients.columns.postalCode", "Postal code"),
    provider_name: resolveText("admin.clients.filters.fields.provider_name", "Provider name"),
    provider_id: resolveText("admin.clients.filters.fields.provider_id", "Provider ID"),
    online_status: resolveText("admin.clients.filters.fields.online_status", "Online status"),
    email_verified: resolveText("admin.clients.filters.fields.email_verified", "Email verification"),
    has_photo: resolveText("admin.clients.filters.fields.has_photo", "Photo"),
    two_factor_enabled: resolveText("admin.clients.filters.fields.two_factor_enabled", "2FA"),
    created_period: resolveText("admin.clients.filters.fields.created_period", "Created period"),
    birthdate_from: resolveText("admin.clients.filters.fields.birthdate_from", "Birthdate from"),
    birthdate_to: resolveText("admin.clients.filters.fields.birthdate_to", "Birthdate to"),
    created_at_from: resolveText("admin.clients.filters.fields.created_at_from", "Created from"),
    created_at_to: resolveText("admin.clients.filters.fields.created_at_to", "Created to"),
    email_verified_at_from: resolveText("admin.clients.filters.fields.email_verified_at_from", "Email verified from"),
    email_verified_at_to: resolveText("admin.clients.filters.fields.email_verified_at_to", "Email verified to"),
    updated_at_from: resolveText("admin.clients.filters.fields.updated_at_from", "Updated from"),
    updated_at_to: resolveText("admin.clients.filters.fields.updated_at_to", "Updated to"),
  }));

  const filterValueLabelMap = computed<Record<string, string>>(() => ({
    online: resolveText("admin.clients.filters.values.online", "Online"),
    offline: resolveText("admin.clients.filters.values.offline", "Offline"),
    verified: resolveText("admin.clients.filters.values.verified", "Verified"),
    unverified: resolveText("admin.clients.filters.values.unverified", "Unverified"),
    yes: resolveText("admin.clients.filters.values.yes", "Yes"),
    no: resolveText("admin.clients.filters.values.no", "No"),
    enabled: resolveText("admin.clients.filters.values.enabled", "Enabled"),
    disabled: resolveText("admin.clients.filters.values.disabled", "Disabled"),
    today: resolveText("admin.clients.filters.values.today", "Today"),
    week: resolveText("admin.clients.filters.values.week", "Week"),
    month: resolveText("admin.clients.filters.values.month", "Month"),
    year: resolveText("admin.clients.filters.values.year", "Year"),
  }));

  const activeFilterChips = computed(() => {
    return (Object.entries(appliedFilters.value) as Array<[FilterKey, string]>)
      .filter(([, value]) => sanitizeFilterValue(value) !== "")
      .map(([key, value]) => ({
        key,
        label: filterLabelMap.value[key] ?? key,
        value: getFilterDisplayValue(key, value),
      }));
  });

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

  const metricCards = computed(() => [
    {
      id: "online_now",
      kind: statsData.value.online_clients_now > 0 ? "is-online-active" : "is-neutral",
      label: resolveText("admin.clients.stats.onlineNow", "Online now"),
      value: formatCount(statsData.value.online_clients_now),
      isActive: appliedFilters.value.online_status === "online",
    },
    {
      id: "new_today",
      kind: "is-neutral",
      label: resolveText("admin.clients.stats.newToday", "New clients today"),
      value: formatCount(statsData.value.new_clients.today),
      isActive: appliedFilters.value.created_period === "today",
    },
    {
      id: "new_week",
      kind: "is-neutral",
      label: resolveText("admin.clients.stats.newWeek", "New clients this week"),
      value: formatCount(statsData.value.new_clients.week),
      isActive: appliedFilters.value.created_period === "week",
    },
    {
      id: "new_month",
      kind: "is-neutral",
      label: resolveText("admin.clients.stats.newMonth", "New clients this month"),
      value: formatCount(statsData.value.new_clients.month),
      isActive: appliedFilters.value.created_period === "month",
    },
  ]);

  const initViewMode = () => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved && ["table", "cards", "full"].includes(saved)) {
      viewMode.value = saved as ViewMode;
    }
  };

  const getQueryFilters = (query: LocationQuery): ClientFilters => {
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

  const getFiltersPayload = (filters: ClientFilters): Partial<ClientFilters> => {
    const payload: Partial<ClientFilters> = {};

    for (const [key, value] of Object.entries(filters) as Array<[FilterKey, string]>) {
      const normalizedValue = sanitizeFilterValue(value);
      if (normalizedValue === "") {
        continue;
      }

      payload[key] = normalizedValue;
    }

    return payload;
  };

  const loadData = async ({ resetPage = false, silent = false }: { resetPage?: boolean; silent?: boolean } = {}) => {
    if (!isClientsIndexRoute.value) {
      return;
    }

    if (resetPage) {
      page.value = 1;
    }

    if (!silent) {
      isLoading.value = true;
    }

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
    if (!isClientsIndexRoute.value) {
      return;
    }

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
      };
    } catch {
      // keep previous stats silently
    } finally {
      if (!silent) {
        isStatsLoading.value = false;
      }
    }
  };

  const loadFilterMeta = async (options: { filterField?: RemoteSelectFilterKey; filterSearch?: string } = {}) => {
    const { filterField, filterSearch = "" } = options;

    try {
      const response = await appCore.adminModules.clients.getMeta({
        filter_field: filterField,
        filter_search: filterSearch,
        limit: 25,
      });

      const payload = response?.data?.data ?? {};
      const filterOptions = payload?.filter_options ?? {};
      const nextDynamicOptions = { ...dynamicFilterOptions.value };

      if (filterField) {
        if (Array.isArray(filterOptions?.[filterField])) {
          nextDynamicOptions[filterField] = normalizeSelectOptions(filterOptions[filterField]);
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
      if (filterField) {
        return;
      }

      dynamicFilterOptions.value = createEmptyDynamicFilterOptions();
    }
  };

  const loadAll = async () => {
    if (!isClientsIndexRoute.value) {
      return;
    }

    await Promise.all([loadData(), loadStats()]);
  };

  const handleOpenClientPage = (id?: string) => {
    if (!id) return;

    navigateTo(localePath(`/clients/${id}`));
  };

  const toggleClientActionMenu = (id?: string) => {
    if (!id || deletingClientId.value === id) return;
    activeClientMenuId.value = activeClientMenuId.value === id ? null : id;
  };

  const buildFullDeleteConfirmText = (client: AdminClient) => {
    const clientLabel = fullName(client) !== "-" ? fullName(client) : client.email || client.id;
    const fallback = `Fully delete client ${clientLabel}? Profile, documents, history and related data will be deleted. MT4 accounts will stay in the system without a linked client.`;

    return resolveText("admin.clients.delete.confirm", fallback).replace("{client}", clientLabel);
  };

  const handleFullDeleteClient = async (client: AdminClient) => {
    if (!client?.id || deletingClientId.value === client.id) return;

    activeClientMenuId.value = null;
    const confirmed = typeof window === "undefined" || window.confirm(buildFullDeleteConfirmText(client));
    if (!confirmed) return;

    deletingClientId.value = client.id;

    try {
      await appCore.adminModules.clients.delete(client.id);

      if (clientsData.value.length === 1 && page.value > DEFAULT_PAGE) {
        page.value -= 1;
      }

      await loadAll();
      await syncStateToUrl();
      toast.success(resolveText("admin.clients.delete.success", "Client fully deleted."));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || resolveText("admin.clients.delete.error", "Failed to delete client.")
      );
    } finally {
      deletingClientId.value = null;
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
      searchDraft.value = String(value ?? "");
      searchFilter.value = searchDraft.value;
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

    if (!isRemoteSelectFilterKey(key)) {
      return;
    }

    const activeTimer = filterSearchTimers.get(key);
    if (activeTimer) {
      window.clearTimeout(activeTimer);
    }

    filterSearchTimers.set(
      key,
      window.setTimeout(async () => {
        await loadFilterMeta({ filterField: key, filterSearch: query });
      }, 500)
    );
  };

  const handleFilterOptionOpen = async (key: SelectFilterKey) => {
    if (!isRemoteSelectFilterKey(key)) {
      return;
    }

    await loadFilterMeta({
      filterField: key,
      filterSearch: filterSearchQueries.value[key] ?? "",
    });
  };

  const handleDraftTextInput = (key: FilterKey, event: Event) => {
    const target = event.target as HTMLInputElement | null;
    setDraftFilterValue(key, target?.value ?? "");
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

  const hasDraftFilterValue = (key: FilterKey) => {
    return sanitizeFilterValue(draftFilters.value[key]) !== "";
  };

  const updateFiltersPopoverPosition = () => {
    if (!isFiltersPopoverOpen.value || !filtersTriggerRef.value) {
      return;
    }

    const triggerRect = filtersTriggerRef.value.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const margin = 12;
    const gap = 8;
    const preferredWidth = Math.min(Math.max(viewportWidth - 24, 320), 560);
    const left = Math.max(12, Math.min(triggerRect.right - preferredWidth, viewportWidth - preferredWidth - 12));
    const spaceBelow = viewportHeight - triggerRect.bottom - gap - margin;
    const spaceAbove = triggerRect.top - gap - margin;
    const shouldOpenAbove = spaceBelow < 360 && spaceAbove > spaceBelow;
    const availableHeight = shouldOpenAbove ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(220, Math.min(760, availableHeight));
    const top = shouldOpenAbove
      ? Math.max(margin, triggerRect.top - gap - maxHeight)
      : Math.max(margin, triggerRect.bottom + gap);

    filtersPopoverStyle.value = {
      position: "fixed",
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(preferredWidth)}px`,
      maxWidth: "calc(100vw - 24px)",
      maxHeight: `${Math.round(maxHeight)}px`,
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
    appliedFilters.value = {
      ...appliedFilters.value,
      [key]: "",
    };

    draftFilters.value = {
      ...draftFilters.value,
      [key]: "",
    };

    if ((SELECT_FILTER_KEYS as readonly string[]).includes(key)) {
      filterSearchQueries.value = {
        ...filterSearchQueries.value,
        [key as SelectFilterKey]: "",
      };
    }

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

  const handleClickOutsideClientMenu = () => {
    activeClientMenuId.value = null;
  };

  const handleMetricCardClick = async (cardId: string) => {
    const nextFilters = cloneFilters(appliedFilters.value);

    if (cardId === "online_now") {
      nextFilters.online_status = nextFilters.online_status === "online" ? "" : "online";
    }

    if (cardId === "new_today") {
      nextFilters.created_period = nextFilters.created_period === "today" ? "" : "today";
      nextFilters.created_at_from = "";
      nextFilters.created_at_to = "";
    }

    if (cardId === "new_week") {
      nextFilters.created_period = nextFilters.created_period === "week" ? "" : "week";
      nextFilters.created_at_from = "";
      nextFilters.created_at_to = "";
    }

    if (cardId === "new_month") {
      nextFilters.created_period = nextFilters.created_period === "month" ? "" : "month";
      nextFilters.created_at_from = "";
      nextFilters.created_at_to = "";
    }

    appliedFilters.value = nextFilters;
    draftFilters.value = cloneFilters(nextFilters);
    await loadData({ resetPage: true });
    await syncStateToUrl();
  };

  const handleFiltersPopoverViewportChange = () => {
    updateFiltersPopoverPosition();
  };

  const startPolling = () => {
    if (!isClientsIndexRoute.value || pollingTimer) return;

    pollingTimer = setInterval(() => {
      if (isRealtimeConnected()) return;

      loadData({ silent: true }).catch(() => {});
      loadStats(true).catch(() => {});
    }, ONLINE_REFRESH_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (!pollingTimer) return;

    clearInterval(pollingTimer);
    pollingTimer = null;
  };

  const syncOnlineState = async () => {
    if (realtimeSyncInFlight) {
      realtimeSyncQueued = true;
      return;
    }

    realtimeSyncInFlight = true;

    try {
      do {
        realtimeSyncQueued = false;
        await Promise.all([loadData({ silent: true }), loadStats(true)]);
      } while (realtimeSyncQueued);
    } finally {
      realtimeSyncInFlight = false;
    }
  };

  const scheduleOnlineSync = () => {
    if (!isClientsIndexRoute.value || realtimeSyncTimer) return;

    realtimeSyncTimer = setTimeout(() => {
      realtimeSyncTimer = null;
      syncOnlineState().catch(() => {});
    }, ONLINE_REALTIME_SYNC_DEBOUNCE_MS);
  };

  const clearScheduledOnlineSync = () => {
    if (!realtimeSyncTimer) return;
    clearTimeout(realtimeSyncTimer);
    realtimeSyncTimer = null;
  };

  const parseJsonObject = (value: unknown): Record<string, any> | null => {
    if (typeof value !== "string") return null;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : null;
    } catch {
      return null;
    }
  };

  const coerceBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
      if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "") return false;
    }
    return Boolean(value);
  };

  const normalizePresencePayload = (payload?: any): Record<string, any> | null => {
    if (!payload) return null;

    const parsedPayload =
      typeof payload === "string" ? parseJsonObject(payload) : payload && typeof payload === "object" ? payload : null;
    if (!parsedPayload) return null;

    const dataLayer =
      parsedPayload?.data && typeof parsedPayload.data === "object"
        ? parsedPayload.data
        : (parseJsonObject(parsedPayload?.data) ?? parsedPayload);

    return dataLayer && typeof dataLayer === "object" ? (dataLayer as Record<string, any>) : null;
  };

  const handleRealtimeClientPresence = (payload: any) => {
    const data = normalizePresencePayload(payload);
    if (!data) {
      scheduleOnlineSync();
      return;
    }

    const userId = String(data.user_id ?? data.userId ?? "").trim();
    const isOnline = coerceBoolean(data.is_online ?? data.isOnline);
    const onlineClientsNow = Number(data.online_clients_now ?? data.onlineClientsNow);
    const onlineFilter = sanitizeFilterValue(appliedFilters.value.online_status);

    if (onlineFilter !== "") {
      scheduleOnlineSync();
      return;
    }

    if (userId !== "") {
      clientsData.value = clientsData.value.map(client =>
        String(client.id) === userId
          ? {
              ...client,
              is_online: isOnline,
            }
          : client
      );
    }

    if (Number.isFinite(onlineClientsNow)) {
      statsData.value = {
        ...statsData.value,
        online_clients_now: Math.max(0, onlineClientsNow),
      };
    } else {
      scheduleOnlineSync();
    }

    // Keep UI optimistic, then re-sync snapshot shortly for consistency.
    scheduleOnlineSync();
  };

  const resolveEchoClient = () => {
    if ($echo && typeof $echo.private === "function") {
      return $echo;
    }
    if (typeof window !== "undefined") {
      const fallbackEcho = (window as any).Echo;
      if (fallbackEcho && typeof fallbackEcho.private === "function") {
        return fallbackEcho;
      }
    }
    return null;
  };

  const isRealtimeConnected = () => {
    const echoClient = resolveEchoClient();

    return String(echoClient?.connector?.pusher?.connection?.state ?? "") === "connected";
  };

  const reconnectRealtimeSocketTransport = () => {
    const echoClient = resolveEchoClient();
    const pusher = echoClient?.connector?.pusher;
    const state = String(pusher?.connection?.state ?? "");
    if (!pusher) return;

    if (state === "disconnected" || state === "failed" || state === "unavailable") {
      try {
        pusher.connect();
      } catch {
        // noop
      }
    }
  };

  const connectRealtime = () => {
    if (!isClientsIndexRoute.value) return;

    const echoClient = resolveEchoClient();
    if (!echoClient) return;

    reconnectRealtimeSocketTransport();
    const channel = supportGlobalChannel ?? echoClient.private("support.global");
    supportGlobalChannel = channel;
    channel.stopListening(".client.presence.updated", handleRealtimeClientPresence);
    channel.stopListening("client.presence.updated", handleRealtimeClientPresence);
    channel.stopListening(".App\\Events\\ClientPresenceUpdated", handleRealtimeClientPresence);
    channel.stopListening("App\\Events\\ClientPresenceUpdated", handleRealtimeClientPresence);
    channel.listen(".client.presence.updated", handleRealtimeClientPresence);
    channel.listen("client.presence.updated", handleRealtimeClientPresence);
    channel.listen(".App\\Events\\ClientPresenceUpdated", handleRealtimeClientPresence);
    channel.listen("App\\Events\\ClientPresenceUpdated", handleRealtimeClientPresence);
  };

  const disconnectRealtime = () => {
    if (!supportGlobalChannel) return;

    supportGlobalChannel.stopListening(".client.presence.updated", handleRealtimeClientPresence);
    supportGlobalChannel.stopListening("client.presence.updated", handleRealtimeClientPresence);
    supportGlobalChannel.stopListening(".App\\Events\\ClientPresenceUpdated", handleRealtimeClientPresence);
    supportGlobalChannel.stopListening("App\\Events\\ClientPresenceUpdated", handleRealtimeClientPresence);
    supportGlobalChannel = null;
  };

  const bindRealtimeSocketStateListener = () => {
    if (!isClientsIndexRoute.value || realtimeSocketStateHandler) return;

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (!connection || typeof connection.bind !== "function") return;

    realtimeSocketStateHandler = (states: any) => {
      const currentState = String(states?.current ?? connection?.state ?? "");
      if (currentState === "connected") {
        connectRealtime();
        scheduleOnlineSync();
        return;
      }

      if (currentState === "failed" || currentState === "unavailable" || currentState === "disconnected") {
        reconnectRealtimeSocketTransport();
      }
    };

    connection.bind("state_change", realtimeSocketStateHandler);
  };

  const unbindRealtimeSocketStateListener = () => {
    if (!realtimeSocketStateHandler) return;

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (connection && typeof connection.unbind === "function") {
      connection.unbind("state_change", realtimeSocketStateHandler);
    }
    realtimeSocketStateHandler = null;
  };

  const startRealtimeRetry = () => {
    if (!isClientsIndexRoute.value || realtimeRetryTimer) return;

    realtimeRetryTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      reconnectRealtimeSocketTransport();
      bindRealtimeSocketStateListener();
      connectRealtime();

      if (!isRealtimeConnected()) {
        scheduleOnlineSync();
      }
    }, ONLINE_REALTIME_RETRY_INTERVAL_MS);
  };

  const stopRealtimeRetry = () => {
    if (!realtimeRetryTimer) return;
    clearInterval(realtimeRetryTimer);
    realtimeRetryTimer = null;
  };

  const handleRealtimeResume = () => {
    if (!isClientsIndexRoute.value) return;

    reconnectRealtimeSocketTransport();
    connectRealtime();
    scheduleOnlineSync();
  };

  const attachRealtimeResumeListeners = () => {
    if (realtimeResumeListenersAttached) return;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleRealtimeResume);
    window.addEventListener("pageshow", handleRealtimeResume);
    realtimeResumeListenersAttached = true;
  };

  const detachRealtimeResumeListeners = () => {
    if (!realtimeResumeListenersAttached) return;
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("online", handleRealtimeResume);
    window.removeEventListener("pageshow", handleRealtimeResume);
    realtimeResumeListenersAttached = false;
  };

  const handleWindowFocus = () => {
    handleRealtimeResume();
  };

  const handleVisibilityChange = () => {
    if (typeof document === "undefined") return;
    if (document.visibilityState === "visible") {
      handleRealtimeResume();
    }
  };

  const handleExternalReload = async () => {
    await loadAll();
  };

  const fullName = (client: AdminClient) => `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() || "-";

  const normalizeBadgeValue = (value?: string | null): string => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");

    return normalized || "unknown";
  };

  const formatProviderName = (provider?: string | null): string => {
    const normalized = String(provider ?? "").trim();
    if (!normalized) return "";

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const acquisitionSourceLabel = (client: AdminClient): string => {
    const source = normalizeBadgeValue(client.acquisition_source);
    if (source === "referral") {
      return resolveText("admin.clients.origin.referral", "referral");
    }

    return resolveText("admin.clients.origin.organic", "organic");
  };

  const registrationMethodLabel = (client: AdminClient): string => {
    const method = normalizeBadgeValue(client.registration_method);
    if (method === "social") {
      const provider = formatProviderName(client.social_provider);
      const social = resolveText("admin.clients.registration.social", "social");

      return provider ? `${social}: ${provider}` : social;
    }

    return resolveText("admin.clients.registration.basic", "basic");
  };

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

  watch(viewMode, mode => {
    if (typeof window === "undefined") return;
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  });

  onMounted(async () => {
    initViewMode();
    initStateFromQuery();
    if (isClientsIndexRoute.value) {
      await loadFilterMeta();
      await syncStateToUrl();
      await loadAll();
    }
    isInitialLoading.value = false;

    useEventBus.on("loadDataForAdmins", handleExternalReload);
    if (isClientsIndexRoute.value) {
      connectRealtime();
      bindRealtimeSocketStateListener();
      startRealtimeRetry();
      startPolling();
      window.addEventListener("focus", handleWindowFocus);
      attachRealtimeResumeListeners();
      handleRealtimeResume();
    }

    document.addEventListener("click", handleClickOutsideFilters);
    document.addEventListener("click", handleClickOutsideClientMenu);
    window.addEventListener("resize", handleFiltersPopoverViewportChange, { passive: true });
    window.addEventListener("scroll", handleFiltersPopoverViewportChange, true);
  });

  watch(
    () => route.path,
    async () => {
      if (isClientsIndexRoute.value) {
        initStateFromQuery();
        await loadFilterMeta();
        await syncStateToUrl();
        await loadAll();
        connectRealtime();
        bindRealtimeSocketStateListener();
        startRealtimeRetry();
        startPolling();
        window.addEventListener("focus", handleWindowFocus);
        attachRealtimeResumeListeners();
        handleRealtimeResume();
        return;
      }

      disconnectRealtime();
      unbindRealtimeSocketStateListener();
      stopRealtimeRetry();
      stopPolling();
      clearScheduledOnlineSync();
      window.removeEventListener("focus", handleWindowFocus);
      detachRealtimeResumeListeners();
    }
  );

  onBeforeUnmount(() => {
    useEventBus.off("loadDataForAdmins", handleExternalReload);
    disconnectRealtime();
    unbindRealtimeSocketStateListener();
    stopRealtimeRetry();
    stopPolling();
    clearScheduledOnlineSync();
    window.removeEventListener("focus", handleWindowFocus);
    detachRealtimeResumeListeners();
    document.removeEventListener("click", handleClickOutsideFilters);
    document.removeEventListener("click", handleClickOutsideClientMenu);
    window.removeEventListener("resize", handleFiltersPopoverViewportChange);
    window.removeEventListener("scroll", handleFiltersPopoverViewportChange, true);
    filterSearchTimers.forEach(timerId => window.clearTimeout(timerId));
    filterSearchTimers.clear();
  });

  watch(isFiltersPopoverOpen, async isOpen => {
    if (!isOpen) {
      return;
    }

    await nextTick();
    updateFiltersPopoverPosition();
  });

  const setFiltersTriggerElement = (element: Element | null) => {
    filtersTriggerRef.value = element as HTMLElement | null;
  };

  const setFiltersPopoverPanelElement = (element: Element | null) => {
    filtersPopoverPanelRef.value = element as HTMLElement | null;
  };

  const clientsPanelProps = computed(() => ({
    metricCards: metricCards.value,
    viewMode: viewMode.value,
    isLoading: isLoading.value,
    isInitialLoading: isInitialLoading.value,
    isLoadingSearch: isLoadingSearch.value,
    isStatsLoading: isStatsLoading.value,
    searchDraft: searchDraft.value,
    orderBy: orderBy.value,
    sortByOptions: sortByOptions.value,
    orderDirection: orderDirection.value,
    viewOptions: viewOptions.value,
    activeFilterChips: activeFilterChips.value,
    clientsData: clientsData.value,
    deletingClientId: deletingClientId.value,
    activeClientMenuId: activeClientMenuId.value,
    perPage: perPage.value,
    page: page.value,
    totalRows: totalRows.value,
    isFiltersPopoverOpen: isFiltersPopoverOpen.value,
    filtersPopoverStyle: filtersPopoverStyle.value,
    filterSelectFieldOptions: filterSelectFieldOptions.value,
    filterTextFieldOptions: filterTextFieldOptions.value,
    filterDateFieldOptions: filterDateFieldOptions.value,
    filterSearchQueries: filterSearchQueries.value,
    draftFilters: draftFilters.value,
    handleMetricCardClick,
    handleInputSearch,
    handleClickRefresh,
    handleOrderBy,
    toggleOrderDirection,
    handleChangeViewMode,
    setFiltersTriggerElement,
    toggleFiltersPopover,
    removeAppliedFilter,
    clearAllAppliedFilters,
    handleOpenClientPage,
    handleFullDeleteClient,
    handleChangePerPage,
    handleChangePage,
    getTwoCharsByFullName,
    fullName,
    formatDate,
    normalizeBadgeValue,
    acquisitionSourceLabel,
    registrationMethodLabel,
    resolveText,
    toggleClientActionMenu,
    setFiltersPopoverPanelElement,
    setDraftFilterValue,
    handleFilterOptionOpen,
    handleFilterOptionSearch,
    hasDraftFilterValue,
    clearDraftFilterValue,
    handleDraftTextInput,
    resetDraftFilters,
    applyDraftFilters,
  }));

  return {
    clientsPanelProps,
  };
}
