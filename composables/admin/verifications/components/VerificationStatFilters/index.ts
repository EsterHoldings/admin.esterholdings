import type { RequestStateFilter, VerificationStatCard } from "~/composables/admin/verifications/types";

export type VerificationStatFiltersProps = {
  cards: VerificationStatCard[];
  activeFilter: RequestStateFilter;
  ariaLabel: string;
};

export type VerificationStatFiltersEmits = {
  filter: [value: RequestStateFilter];
};

export type VerificationStatFiltersEmit = {
  (event: "filter", value: RequestStateFilter): void;
};

export const VERIFICATION_STAT_CARD_BASE_CLASS =
  "inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[var(--color-stroke-ui-light)] bg-transparent px-3 py-[7px] text-[var(--ui-text-secondary)] transition duration-200 hover:border-[color-mix(in_srgb,var(--ui-primary-main)_42%,var(--color-stroke-ui-light))] hover:text-[var(--ui-text-main)] max-[760px]:flex-[1_1_calc(50%_-_8px)] max-[760px]:justify-center";

export const VERIFICATION_STAT_CARD_ACTIVE_CLASS =
  "border-[var(--ui-primary-main)] bg-[color-mix(in_srgb,var(--ui-primary-main)_10%,transparent)] text-[var(--ui-text-main)]";
