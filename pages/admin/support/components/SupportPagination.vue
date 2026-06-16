<template>
  <div class="px-5 h-[50px] mt-2 flex items-center justify-between">
    <div class="p-0 flex items-center justify-center [&>div]:h-[33px] [&>div]:w-[33px]">
      <UiTextSmall class="mr-2">{{ supportListText.perPage }}</UiTextSmall>
      <UiSelect
        class="!w-min flex items-center justify-center !h-[32px]"
        :data="perPageList"
        :value="perPage"
        @change="handleChangePerPage"
        :withoutNoSelect="true" />
    </div>

    <UiTextSmall>{{ rangeLabel }}</UiTextSmall>

    <div class="flex items-center justify-center gap-2">
      <UiTextSmall
        class="px-3 py-1.5 h-[32px] border border-[--color-stroke-ui-dark] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
        v-if="canGoPrev"
        @click="goPrev">
        {{ prevLabel }}
      </UiTextSmall>

      <UiTextSmall
        v-if="showFirstPage"
        class="px-3 py-1.5 h-[32px] border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
        @click="setPage(1)">
        1
      </UiTextSmall>

      <UiTextSmall v-if="showStartEllipsis">...</UiTextSmall>

      <UiTextSmall
        v-for="page in visiblePages"
        :key="page"
        class="px-3 py-1.5 h-[32px] border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
        :class="{ 'bg-[var(--ui-primary-main)] text-white': currentPage === page }"
        @click="setPage(page)">
        {{ page }}
      </UiTextSmall>

      <UiTextSmall v-if="showEndEllipsis">...</UiTextSmall>

      <UiTextSmall
        v-if="showLastPage"
        class="px-3 py-1.5 h-[32px] border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
        @click="setPage(totalPages)"
        >{{ totalPages }}
      </UiTextSmall>

      <UiTextSmall
        class="px-3 py-1.5 border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
        v-if="canGoNext"
        @click="goNext">
        {{ nextLabel }}
      </UiTextSmall>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import type { SupportPaginationProps } from "~/composables/admin/support/components/SupportPagination";
  import { useSupportPaginationSetup } from "~/composables/admin/support/components/SupportPagination/setup";

  const props = defineProps<SupportPaginationProps>();

  const {
    canGoNext,
    canGoPrev,
    currentPage,
    goNext,
    goPrev,
    handleChangePerPage,
    nextLabel,
    perPage,
    perPageList,
    prevLabel,
    rangeLabel,
    setPage,
    showEndEllipsis,
    showFirstPage,
    showLastPage,
    showStartEllipsis,
    supportListText,
    totalPages,
    visiblePages,
  } = useSupportPaginationSetup(props);
</script>
