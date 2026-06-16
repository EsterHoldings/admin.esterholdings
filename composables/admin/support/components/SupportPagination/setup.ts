import type { SupportPaginationProps } from ".";
import { computed, toRefs } from "vue";

export function useSupportPaginationSetup(props: SupportPaginationProps) {
  const refs = toRefs(props);

  const firstVisiblePage = computed(() => props.visiblePages[0] ?? 1);
  const lastVisiblePage = computed(() => props.visiblePages[props.visiblePages.length - 1] ?? 1);
  const rangeLabel = computed(
    () => `${props.currentPage * props.perPage - props.perPage}-${props.currentPage * props.perPage} / ${props.total}`
  );
  const canGoPrev = computed(() => props.currentPage !== 1 && props.total > props.perPage);
  const canGoNext = computed(() => props.currentPage !== props.totalPages && props.total > props.perPage);
  const showFirstPage = computed(() => firstVisiblePage.value > 1);
  const showStartEllipsis = computed(() => firstVisiblePage.value > 2);
  const showEndEllipsis = computed(() => lastVisiblePage.value < props.totalPages);
  const showLastPage = computed(() => lastVisiblePage.value < props.totalPages);
  const prevLabel = computed(() => props.t("cabinet.accounts.pagination.prev"));
  const nextLabel = computed(() => props.t("cabinet.accounts.pagination.next"));

  return {
    ...refs,
    canGoNext,
    canGoPrev,
    nextLabel,
    prevLabel,
    rangeLabel,
    showEndEllipsis,
    showFirstPage,
    showLastPage,
    showStartEllipsis,
  };
}
