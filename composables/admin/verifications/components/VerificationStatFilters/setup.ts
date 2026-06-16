import {
  VERIFICATION_STAT_CARD_ACTIVE_CLASS,
  VERIFICATION_STAT_CARD_BASE_CLASS,
  type VerificationStatFiltersEmit,
  type VerificationStatFiltersProps,
} from "./index";
import type { RequestStateFilter, VerificationStatCard } from "~/composables/admin/verifications/types";

export function useVerificationStatFiltersSetup(
  props: VerificationStatFiltersProps,
  emit: VerificationStatFiltersEmit
) {
  function statCardClass(card: VerificationStatCard): string[] {
    return [
      VERIFICATION_STAT_CARD_BASE_CLASS,
      props.activeFilter === card.filter ? VERIFICATION_STAT_CARD_ACTIVE_CLASS : "",
    ];
  }

  function handleFilter(value: RequestStateFilter): void {
    emit("filter", value);
  }

  return {
    handleFilter,
    statCardClass,
  };
}
