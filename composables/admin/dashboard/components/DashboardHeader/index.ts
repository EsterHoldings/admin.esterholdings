export type DashboardHeaderProps = {
  title: string;
  subtitle: string;
  autoRefreshLabel: string;
  updatedAt: string;
  advancedFiltersLabel: string;
  advancedFiltersVisible: boolean;
  refreshLabel: string;
  isLoading: boolean;
};

export type DashboardHeaderEmits = {
  refresh: [];
  "toggle-advanced": [];
};

export type DashboardHeaderEmit = {
  (event: "refresh"): void;
  (event: "toggle-advanced"): void;
};
