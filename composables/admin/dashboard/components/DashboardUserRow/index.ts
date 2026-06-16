import type { DashboardStatusTone } from "~/pages/admin/dashboard/types";

export type DashboardUserRowProps = {
  initials: string;
  name: string;
  meta: string;
  statusLabel: string;
  statusTone: DashboardStatusTone;
};

export type DashboardUserRowEmits = {
  open: [];
};

export type DashboardUserRowEmit = (event: "open") => void;
