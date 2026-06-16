import type { DashboardOnlineClient } from "~/pages/admin/dashboard/types";

export type DashboardOnlinePopoverProps = {
  clients: DashboardOnlineClient[];
  rawCount: number;
  count: string;
  title: string;
  clientsLabel: string;
  emptyText: string;
  loadingText: string;
  resolveName: (client: DashboardOnlineClient) => string;
  resolveEmail: (client: DashboardOnlineClient) => string;
  getInitials: (value?: string | null) => string;
};

export type DashboardOnlinePopoverEmits = {
  "open-client": [id: string];
};

export type DashboardOnlinePopoverEmit = (event: "open-client", id: string) => void;
