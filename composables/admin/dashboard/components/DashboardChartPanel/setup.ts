import type { DashboardChartPanelEmit } from "./index";

export function useDashboardChartPanelSetup(emit: DashboardChartPanelEmit) {
  function handlePresetSelect(presetId: string): void {
    emit("select-preset", presetId);
  }

  return {
    handlePresetSelect,
  };
}
