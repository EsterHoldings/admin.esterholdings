import type { DashboardOnlineClient } from "~/pages/admin/dashboard/types";
import type { DashboardOnlinePopoverEmit, DashboardOnlinePopoverProps } from "./index";

export function useDashboardOnlinePopoverSetup(props: DashboardOnlinePopoverProps, emit: DashboardOnlinePopoverEmit) {
  function resolveClientInitials(client: DashboardOnlineClient): string {
    return client.initials || props.getInitials(props.resolveName(client) || props.resolveEmail(client));
  }

  function handleClientOpen(id: string): void {
    emit("open-client", id);
  }

  return {
    handleClientOpen,
    resolveClientInitials,
  };
}
