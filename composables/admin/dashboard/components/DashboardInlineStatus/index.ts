import type { DashboardStatusTone } from "~/pages/admin/dashboard/types";

export type DashboardInlineStatusProps = {
  label: string;
  tone?: DashboardStatusTone;
};

export const DASHBOARD_STATUS_TONE_CLASS_MAP: Record<DashboardStatusTone, string> = {
  success: "text-[var(--color-success)]",
  danger: "text-[var(--color-danger)]",
  warning: "text-[var(--color-warning)]",
  info: "text-[var(--color-info)]",
  muted: "text-[var(--ui-text-secondary)]",
};
