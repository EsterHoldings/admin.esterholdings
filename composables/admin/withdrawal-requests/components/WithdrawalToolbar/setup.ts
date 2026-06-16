import type { WithdrawalToolbarEmit } from "./index";

export function useWithdrawalToolbarSetup(emit: WithdrawalToolbarEmit) {
  const handleSearch = (value: string): void => {
    emit("search", value);
  };

  const handleRefresh = (): void => {
    emit("refresh");
  };

  return {
    handleRefresh,
    handleSearch,
  };
}
