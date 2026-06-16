import type { DashboardPreset } from "~/pages/admin/dashboard/types";

export type DashboardChartPanelProps = {
  name: string;
  title: string;
  subtitle: string;
  presets: DashboardPreset[];
  activePreset: string;
};

export type DashboardChartPanelEmits = {
  "select-preset": [presetId: string];
};

export type DashboardChartPanelEmit = (event: "select-preset", presetId: string) => void;
