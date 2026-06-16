import { computed } from "vue";
import type { ArchiveFilter } from "~/composables/admin/clients/components/TabPaymentDetails";
import type { PaymentDetailsToolbarEmit, PaymentDetailsToolbarProps } from "./index";

export function usePaymentDetailsToolbarSetup(props: PaymentDetailsToolbarProps, emit: PaymentDetailsToolbarEmit) {
  const selectedArchiveFilter = computed({
    get: () => props.archiveFilter,
    set: value => {
      emit("update:archiveFilter", value as ArchiveFilter);
    },
  });

  function handleRefresh(): void {
    emit("refresh");
  }

  return {
    handleRefresh,
    selectedArchiveFilter,
  };
}
