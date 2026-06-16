import type { DashboardOnlineClient, DashboardSummaryCard } from "~/pages/admin/dashboard/types";

export const DASHBOARD_ONLINE_CARD_ID = "online_now";

export type DashboardSummaryGridProps = {
  cards: DashboardSummaryCard[];
  onlineClients: DashboardOnlineClient[];
  onlineCount: number;
  formattedOnlineCount: string;
  onlineTitle: string;
  onlineClientsLabel: string;
  onlineEmptyText: string;
  onlineLoadingText: string;
  onlineClientName: (client: DashboardOnlineClient) => string;
  onlineClientEmail: (client: DashboardOnlineClient) => string;
  getInitials: (value?: string | null) => string;
};

export type DashboardSummaryGridEmits = {
  navigate: [to: string];
};

export type DashboardSummaryGridEmit = (event: "navigate", to: string) => void;
