import { computed } from "vue";
import {
  DASHBOARD_CHART_FILTER_COMPACT_GRID_CLASS,
  DASHBOARD_CHART_FILTER_GRID_BASE_CLASS,
  DASHBOARD_CHART_FILTER_ONLINE_GRID_CLASS,
  type DashboardChartFiltersEmit,
  type DashboardChartFiltersProps,
} from "./index";

export function useDashboardChartFiltersSetup(props: DashboardChartFiltersProps, emit: DashboardChartFiltersEmit) {
  const gridClass = computed(() => [
    DASHBOARD_CHART_FILTER_GRID_BASE_CLASS,
    props.mode === "online" ? DASHBOARD_CHART_FILTER_ONLINE_GRID_CLASS : DASHBOARD_CHART_FILTER_COMPACT_GRID_CLASS,
  ]);

  function normalizeSelectValue(value: unknown, fallback = ""): string {
    return String(value ?? fallback) || fallback;
  }

  function handleDateFromUpdate(value: Date | string | null | undefined): void {
    emit("update-date", "date_from", value ?? null);
  }

  function handleDateToUpdate(value: Date | string | null | undefined): void {
    emit("update-date", "date_to", value ?? null);
  }

  function handleBucketUpdate(value: unknown): void {
    emit("update-filter", "bucket", normalizeSelectValue(value, "day"));
  }

  function handleDeviceUpdate(value: unknown): void {
    emit("update-filter", "device_type", normalizeSelectValue(value));
  }

  function handleBrowserUpdate(value: unknown): void {
    emit("update-filter", "browser", normalizeSelectValue(value));
  }

  function handleOsUpdate(value: unknown): void {
    emit("update-filter", "os", normalizeSelectValue(value));
  }

  return {
    gridClass,
    handleBrowserUpdate,
    handleBucketUpdate,
    handleDateFromUpdate,
    handleDateToUpdate,
    handleDeviceUpdate,
    handleOsUpdate,
  };
}
