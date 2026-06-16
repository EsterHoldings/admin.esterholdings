import type { StyleValue } from "vue";
import type {
  AdminClient,
  ClientFilters,
  FilterKey,
  FilterSearchQueryMap,
  SelectFilterKey,
  SelectOption,
  ViewMode,
} from "~/composables/admin/clients/useClientsPage";

export interface ClientsMetricCard {
  id: string;
  kind: string;
  label: string;
  value: string;
  isActive: boolean;
}

export interface ClientsFilterChip {
  key: FilterKey;
  label: string;
  value: string;
}

export interface ClientsFilterSelectField {
  key: SelectFilterKey;
  label: string;
  options: SelectOption[];
  searchable?: boolean;
}

export interface ClientsFilterDateField {
  key: FilterKey;
  label: string;
}

export interface ClientsViewOption {
  value: ViewMode;
  label: string;
  icon?: unknown;
}

export interface ClientsPanelProps {
  metricCards: ClientsMetricCard[];
  viewMode: ViewMode;
  isLoading: boolean;
  isInitialLoading: boolean;
  isLoadingSearch: boolean;
  isStatsLoading: boolean;
  searchDraft: string;
  orderBy: string;
  sortByOptions: SelectOption[];
  orderDirection: string;
  viewOptions: ClientsViewOption[];
  activeFilterChips: ClientsFilterChip[];
  clientsData: AdminClient[];
  deletingClientId: string | null;
  activeClientMenuId: string | null;
  perPage: number;
  page: number;
  totalRows: number;
  isFiltersPopoverOpen: boolean;
  filtersPopoverStyle: StyleValue;
  filterSelectFieldOptions: ClientsFilterSelectField[];
  filterTextFieldOptions: ClientsFilterSelectField[];
  filterDateFieldOptions: ClientsFilterDateField[];
  filterSearchQueries: FilterSearchQueryMap;
  draftFilters: ClientFilters;
  handleMetricCardClick: (cardId: string) => Promise<void>;
  handleInputSearch: (value: string) => void;
  handleClickRefresh: () => Promise<void>;
  handleOrderBy: (value: string) => Promise<void>;
  toggleOrderDirection: () => Promise<void>;
  handleChangeViewMode: (value: string) => Promise<void>;
  setFiltersTriggerElement: (element: Element | null) => void;
  toggleFiltersPopover: () => Promise<void>;
  removeAppliedFilter: (key: FilterKey) => Promise<void>;
  clearAllAppliedFilters: () => Promise<void>;
  handleOpenClientPage: (id?: string) => void;
  handleFullDeleteClient: (client: AdminClient) => Promise<void>;
  handleChangePerPage: (value: number) => Promise<void>;
  handleChangePage: (value: number) => Promise<void>;
  getTwoCharsByFullName: (firstName?: string, lastName?: string) => string;
  fullName: (client: AdminClient) => string;
  formatDate: (date?: string) => string;
  normalizeBadgeValue: (value?: string | null) => string;
  acquisitionSourceLabel: (client: AdminClient) => string;
  registrationMethodLabel: (client: AdminClient) => string;
  resolveText: (key: string, fallback: string) => string;
  toggleClientActionMenu: (id?: string) => void;
  setFiltersPopoverPanelElement: (element: Element | null) => void;
  setDraftFilterValue: (key: FilterKey, value: unknown) => void;
  handleFilterOptionOpen: (key: SelectFilterKey) => Promise<void>;
  handleFilterOptionSearch: (key: SelectFilterKey, query: string) => void;
  hasDraftFilterValue: (key: FilterKey) => boolean;
  clearDraftFilterValue: (key: FilterKey) => void;
  handleDraftTextInput: (key: FilterKey, event: Event) => void;
  resetDraftFilters: () => void;
  applyDraftFilters: () => Promise<void>;
}
