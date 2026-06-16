import type { AdminClient, ViewMode } from "~/composables/admin/clients/useClientsPage";

export type AdminClientCardItem = AdminClient;

export interface ClientsContentProps {
  data: AdminClientCardItem[];
  viewMode: ViewMode;
}

export type ClientsContentEmit = {
  (event: "click", id: string): void;
  (event: "fullDelete", client: AdminClientCardItem): void;
};
