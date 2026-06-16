import { computed } from "vue";
import type { VerificationToolbarEmit, VerificationToolbarProps } from "./index";

export function useVerificationToolbarSetup(props: VerificationToolbarProps, emit: VerificationToolbarEmit) {
  const searchValue = computed({
    get: () => props.searchInput,
    set: (value: string) => {
      emit("update:searchInput", String(value ?? ""));
    },
  });

  function handleRefresh(): void {
    emit("refresh");
  }

  return {
    handleRefresh,
    searchValue,
  };
}
