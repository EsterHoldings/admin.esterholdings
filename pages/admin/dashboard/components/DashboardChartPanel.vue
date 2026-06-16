<template>
  <section class="flex flex-col gap-3">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 max-[820px]:flex max-[820px]:flex-col max-[820px]:items-stretch">
      <div class="flex min-w-0 flex-col gap-1">
        <h2 class="m-0 text-[17px] font-[820] leading-tight tracking-normal text-[var(--ui-text-main)]">
          {{ title }}
        </h2>
        <p class="m-0 text-xs leading-snug text-[var(--ui-text-secondary)]">
          {{ subtitle }}
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-1.5 max-[820px]:justify-start">
        <PrimeButton
          v-for="preset in presets"
          :key="`${name}-${preset.id}`"
          size="small"
          rounded
          :outlined="activePreset !== preset.id"
          :text="activePreset !== preset.id"
          :label="preset.label"
          @click="$emit('select-preset', preset.id)" />
      </div>
    </div>

    <slot name="filters" />

    <div class="min-h-[320px] overflow-hidden bg-transparent">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { DashboardPreset } from "../types";

  defineProps<{
    name: string;
    title: string;
    subtitle: string;
    presets: DashboardPreset[];
    activePreset: string;
  }>();

  defineEmits<{
    "select-preset": [presetId: string];
  }>();
</script>
