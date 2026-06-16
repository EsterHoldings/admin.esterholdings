import { computed } from "vue";
import type { BirthdaysPanelProps } from "./index";

export function useBirthdaysPanelSetup(props: BirthdaysPanelProps) {
  const showInitialLoading = computed(() => props.isLoading && props.items.length === 0);
  const showInitialError = computed(() => Boolean(props.loadError) && props.items.length === 0);
  const showEmpty = computed(() => !showInitialLoading.value && !showInitialError.value && props.items.length === 0);
  const showResults = computed(() => !showInitialLoading.value && !showInitialError.value && props.items.length > 0);

  const updatePeriod = (value: string): void => {
    props.updateFilter("period", value);
  };

  const updateScope = (value: string): void => {
    props.updateFilter("scope", value);
  };

  const updatePerPage = (value: number | string): void => {
    props.updatePerPage(Number(value));
  };

  const handlePerPageChange = (event: Event): void => {
    const target = event.target instanceof HTMLSelectElement ? event.target : null;
    updatePerPage(target?.value ?? props.perPage);
  };

  return {
    handlePerPageChange,
    showEmpty,
    showInitialError,
    showInitialLoading,
    showResults,
    updatePeriod,
    updateScope,
  };
}
