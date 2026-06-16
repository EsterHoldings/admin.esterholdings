import type { DashboardUserRowEmit } from "./index";

export function useDashboardUserRowSetup(emit: DashboardUserRowEmit) {
  function handleOpen(): void {
    emit("open");
  }

  return {
    handleOpen,
  };
}
