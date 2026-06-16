import {
  WITHDRAWAL_STAT_CARD_ACTIVE_CLASS,
  WITHDRAWAL_STAT_CARD_BASE_CLASS,
  WITHDRAWAL_STAT_CARD_TONE_CLASS_MAP,
  type WithdrawalStatsGridEmit,
} from "./index";
import type { WithdrawalStatCard } from "~/composables/admin/withdrawal-requests";

export function useWithdrawalStatsGridSetup(emit: WithdrawalStatsGridEmit) {
  const cardClass = (card: WithdrawalStatCard) => [
    WITHDRAWAL_STAT_CARD_BASE_CLASS,
    WITHDRAWAL_STAT_CARD_TONE_CLASS_MAP[card.cardClass] ?? "",
    card.isActive ? WITHDRAWAL_STAT_CARD_ACTIVE_CLASS : "",
  ];

  const handleFilter = (status: string): void => {
    emit("filter", status);
  };

  return {
    cardClass,
    handleFilter,
  };
}
