import type { WithdrawalStatCard } from "~/composables/admin/withdrawal-requests";

export type WithdrawalStatsGridProps = {
  cards: WithdrawalStatCard[];
};

export type WithdrawalStatsGridEmits = {
  filter: [status: string];
};

export type WithdrawalStatsGridEmit = (event: "filter", status: string) => void;

export const WITHDRAWAL_STAT_CARD_BASE_CLASS =
  "min-h-[76px] rounded-2xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] px-4 py-3 text-left transition duration-200 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--ui-primary-main)_34%,transparent)]";

export const WITHDRAWAL_STAT_CARD_ACTIVE_CLASS =
  "border-[color-mix(in_srgb,var(--ui-primary-main)_58%,transparent)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--ui-primary-main)_32%,transparent)]";

export const WITHDRAWAL_STAT_CARD_TONE_CLASS_MAP: Record<string, string> = {
  "is-total":
    "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--ui-primary-main)_8%,transparent)_0%,transparent_72%),var(--ui-background-panel)]",
  "is-pending":
    "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-warning)_10%,transparent)_0%,transparent_72%),var(--ui-background-panel)]",
  "is-success":
    "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-success)_10%,transparent)_0%,transparent_72%),var(--ui-background-panel)]",
  "is-failed":
    "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-danger)_10%,transparent)_0%,transparent_72%),var(--ui-background-panel)]",
  "is-cancelled":
    "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-danger)_10%,transparent)_0%,transparent_72%),var(--ui-background-panel)]",
  "is-rejected":
    "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-danger)_10%,transparent)_0%,transparent_72%),var(--ui-background-panel)]",
};
