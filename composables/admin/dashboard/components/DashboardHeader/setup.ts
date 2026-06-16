import type { DashboardHeaderEmit } from "./index";

export function useDashboardHeaderSetup(emit: DashboardHeaderEmit) {
  function handleRefresh(): void {
    emit("refresh");
  }

  function handleToggleAdvanced(): void {
    emit("toggle-advanced");
  }

  return {
    handleRefresh,
    handleToggleAdvanced,
  };
}
