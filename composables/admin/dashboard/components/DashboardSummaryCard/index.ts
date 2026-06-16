import type { DashboardSummaryCard } from "~/pages/admin/dashboard/types";

export type DashboardSummaryCardProps = {
  card: DashboardSummaryCard;
};

export type DashboardSummaryCardEmits = {
  open: [to: string];
};

export type DashboardSummaryCardEmit = (event: "open", to: string) => void;

export const DASHBOARD_SUMMARY_TONE_CLASS_MAP: Record<DashboardSummaryCard["kind"], string> = {
  primary: "before:bg-[var(--ui-primary-main)]",
  accent: "before:bg-[var(--ui-primary-accent)]",
  info: "before:bg-[var(--color-info)]",
  warning: "before:bg-[var(--color-warning)]",
  success: "before:bg-[var(--color-success)]",
  danger: "before:bg-[var(--color-danger)]",
};

export const DASHBOARD_SUMMARY_ICON_CLASS_MAP: Record<DashboardSummaryCard["kind"], string> = {
  primary: "text-[var(--ui-primary-main)] bg-[color-mix(in_srgb,var(--ui-primary-main)_13%,transparent)]",
  accent: "text-[var(--ui-primary-accent)] bg-[color-mix(in_srgb,var(--ui-primary-accent)_13%,transparent)]",
  info: "text-[var(--color-info)] bg-[color-mix(in_srgb,var(--color-info)_13%,transparent)]",
  warning: "text-[var(--color-warning)] bg-[color-mix(in_srgb,var(--color-warning)_13%,transparent)]",
  success: "text-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_13%,transparent)]",
  danger: "text-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_13%,transparent)]",
};

export const DASHBOARD_SUMMARY_CARD_BASE_CLASS =
  "relative isolate h-full overflow-hidden rounded-[22px] border border-[color-mix(in_srgb,var(--ui-primary-main)_16%,var(--color-stroke-ui-light))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--ui-background-card)_74%,transparent),color-mix(in_srgb,var(--ui-background-panel)_86%,transparent))] backdrop-blur-[22px] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:z-[1] before:h-0.5 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ui-primary-main)_34%,var(--color-stroke-ui-light))]";

export const DASHBOARD_SUMMARY_ICON_BASE_CLASS = "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl";
