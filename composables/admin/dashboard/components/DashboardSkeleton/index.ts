import type { DashboardPreset } from "~/pages/admin/dashboard/types";

export type DashboardSkeletonProps = {
  summaryCards: number[];
  chartCards: number[];
  rows: number[];
  presets: DashboardPreset[];
  advancedFiltersVisible: boolean;
};
