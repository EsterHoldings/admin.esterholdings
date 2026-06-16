<template>
  <div class="flex items-start justify-between gap-3.5 max-[820px]:flex-col max-[820px]:items-stretch">
    <div class="min-w-0">
      <h1 class="m-0 text-[clamp(24px,2.1vw,36px)] font-[850] leading-none tracking-normal text-[var(--ui-text-main)]">
        {{ title }}
      </h1>
      <p class="mt-1.5 max-w-[900px] text-[13px] leading-snug text-[var(--ui-text-secondary)]">
        {{ subtitle }}
      </p>
    </div>

    <div class="flex min-w-0 flex-wrap items-center justify-end gap-2.5 max-[820px]:justify-start">
      <DashboardInlineStatus
        :label="autoRefreshLabel"
        tone="info" />
      <span
        class="max-w-[280px] text-right text-xs leading-snug text-[var(--ui-text-secondary)] max-[820px]:max-w-none max-[820px]:text-left">
        {{ updatedAt }}
      </span>
      <PrimeButton
        icon="pi pi-check"
        :label="advancedFiltersLabel"
        size="small"
        rounded
        :outlined="!advancedFiltersVisible"
        :text="!advancedFiltersVisible"
        @click="$emit('toggle-advanced')" />
      <PrimeButton
        icon="pi pi-refresh"
        rounded
        text
        :loading="isLoading"
        :aria-label="refreshLabel"
        :title="refreshLabel"
        @click="$emit('refresh')" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import DashboardInlineStatus from "./DashboardInlineStatus.vue";

  defineProps<{
    title: string;
    subtitle: string;
    autoRefreshLabel: string;
    updatedAt: string;
    advancedFiltersLabel: string;
    advancedFiltersVisible: boolean;
    refreshLabel: string;
    isLoading: boolean;
  }>();

  defineEmits<{
    refresh: [];
    "toggle-advanced": [];
  }>();
</script>
