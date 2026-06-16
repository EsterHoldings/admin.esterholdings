import type { DashboardBucket, DashboardSelectOption } from "~/pages/admin/dashboard/types";

export type DashboardChartFiltersMode = "online" | "registrations";

export type DashboardChartFiltersProps = {
  mode: DashboardChartFiltersMode;
  dateFrom: string;
  dateTo: string;
  bucket: DashboardBucket;
  bucketOptions: DashboardSelectOption[];
  deviceOptions?: DashboardSelectOption[];
  browserOptions?: DashboardSelectOption[];
  osOptions?: DashboardSelectOption[];
  deviceType?: string;
  browser?: string;
  os?: string;
  fromLabel: string;
  toLabel: string;
  stepLabel: string;
  deviceLabel: string;
  browserLabel: string;
  osLabel: string;
  allDevicesLabel: string;
  allBrowsersLabel: string;
  allOsLabel: string;
  toDatePickerValue: (value?: string | null) => Date | null;
};

export type DashboardChartFiltersEmits = {
  "update-date": [key: "date_from" | "date_to", value: Date | string | null];
  "update-filter": [key: string, value: string];
};

export type DashboardChartFiltersEmit = {
  (event: "update-date", key: "date_from" | "date_to", value: Date | string | null): void;
  (event: "update-filter", key: string, value: string): void;
};

export const DASHBOARD_CHART_FILTER_DEFAULTS = {
  deviceOptions: () => [],
  browserOptions: () => [],
  osOptions: () => [],
  deviceType: "",
  browser: "",
  os: "",
};

export const DASHBOARD_CHART_FILTER_GRID_BASE_CLASS = "grid items-end gap-2 max-[640px]:grid-cols-1";
export const DASHBOARD_CHART_FILTER_ONLINE_GRID_CLASS = "grid-cols-6 max-[1180px]:grid-cols-3";
export const DASHBOARD_CHART_FILTER_COMPACT_GRID_CLASS = "grid-cols-3";
