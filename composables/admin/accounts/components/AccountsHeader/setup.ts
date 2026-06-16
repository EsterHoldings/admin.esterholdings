import type { AccountsHeaderEmit } from "./index";

export function useAccountsHeaderSetup(emit: AccountsHeaderEmit) {
  const handleCreate = (): void => {
    emit("create");
  };

  return {
    handleCreate,
  };
}
