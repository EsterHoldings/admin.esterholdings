<template>
  <div class="space-y-3">
    <div class="grid grid-cols-4 gap-2.5 max-[820px]:grid-cols-2 max-[640px]:grid-cols-1">
      <PrimeCard
        v-for="item in summaryCards"
        :key="`summary-skeleton-${item}`"
        class="h-full rounded-[22px] border border-[color-mix(in_srgb,var(--ui-primary-main)_16%,var(--color-stroke-ui-light))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--ui-background-card)_74%,transparent),color-mix(in_srgb,var(--ui-background-panel)_86%,transparent))]">
        <template #content>
          <div class="flex min-h-16 flex-col gap-1.5 p-3.5">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 flex-1 flex-col gap-2">
                <PrimeSkeleton
                  width="62%"
                  height="14px"
                  border-radius="999px" />
                <PrimeSkeleton
                  width="44%"
                  height="32px"
                  border-radius="10px" />
              </div>
              <PrimeSkeleton
                shape="circle"
                size="44px" />
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>

    <div class="grid grid-cols-1 gap-3">
      <section
        v-for="item in chartCards"
        :key="`chart-skeleton-${item}`"
        class="flex flex-col gap-3">
        <div
          class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 max-[820px]:flex max-[820px]:flex-col max-[820px]:items-stretch">
          <div class="flex min-w-0 flex-col gap-1">
            <PrimeSkeleton
              width="220px"
              height="22px"
              border-radius="8px" />
            <PrimeSkeleton
              width="320px"
              height="14px"
              border-radius="999px" />
          </div>
          <div class="flex flex-wrap items-center justify-end gap-1.5 max-[820px]:justify-start">
            <PrimeSkeleton
              v-for="preset in presets"
              :key="`chart-preset-skeleton-${item}-${preset.id}`"
              width="52px"
              height="34px"
              border-radius="999px" />
          </div>
        </div>
        <div
          v-if="advancedFiltersVisible"
          class="grid grid-cols-6 gap-2 max-[1180px]:grid-cols-3 max-[640px]:grid-cols-1">
          <PrimeSkeleton
            v-for="filter in 6"
            :key="`filter-skeleton-${item}-${filter}`"
            height="64px"
            border-radius="16px" />
        </div>
        <PrimeSkeleton
          height="300px"
          border-radius="18px" />
      </section>
    </div>

    <div class="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
      <PrimeCard
        v-for="item in chartCards"
        :key="`list-skeleton-${item}`"
        class="rounded-[22px] border border-[color-mix(in_srgb,var(--ui-primary-main)_16%,var(--color-stroke-ui-light))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--ui-background-card)_74%,transparent),color-mix(in_srgb,var(--ui-background-panel)_86%,transparent))]">
        <template #content>
          <div class="flex flex-col gap-2.5 p-2.5">
            <div
              class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 max-[820px]:flex max-[820px]:flex-col max-[820px]:items-stretch">
              <div class="flex flex-col gap-1">
                <PrimeSkeleton
                  width="210px"
                  height="22px"
                  border-radius="8px" />
                <PrimeSkeleton
                  width="280px"
                  height="14px"
                  border-radius="999px" />
              </div>
              <PrimeSkeleton
                width="48px"
                height="28px"
                border-radius="999px" />
            </div>
            <div class="flex flex-col gap-2">
              <PrimeSkeleton
                v-for="row in rows"
                :key="`row-skeleton-${item}-${row}`"
                height="62px"
                border-radius="16px" />
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { DashboardSkeletonProps } from "~/composables/admin/dashboard/components/DashboardSkeleton";
  import { useDashboardSkeletonSetup } from "~/composables/admin/dashboard/components/DashboardSkeleton/setup";

  const props = defineProps<DashboardSkeletonProps>();

  useDashboardSkeletonSetup(props);
</script>
