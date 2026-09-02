<template>
  <section class="grid grid-cols-[minmax(220px,1fr)_auto] items-center gap-2.5 max-[760px]:grid-cols-1">
    <span class="relative flex items-center">
      <i
        class="pi pi-search absolute left-3.5 z-[1] text-[var(--ui-text-secondary)]"
        aria-hidden="true" />
      <PrimeInputText
        v-model="searchValue"
        class="w-full pl-10 pr-10"
        :placeholder="placeholder"
        fluid />
      <button
        v-if="searchValue"
        type="button"
        class="absolute right-2 z-[1] inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ui-text-secondary)] transition hover:bg-[color-mix(in_srgb,var(--ui-primary-main)_12%,transparent)] hover:text-[var(--ui-text-main)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ui-primary-main)]"
        aria-label="Clear"
        @click="searchValue = ''">
        <i
          class="pi pi-times text-xs"
          aria-hidden="true" />
      </button>
    </span>

    <PrimeButton
      class="h-[42px] w-[42px]"
      icon="pi pi-refresh"
      rounded
      :loading="isLoading"
      :aria-label="refreshAriaLabel"
      @click="handleRefresh" />
  </section>
</template>

<script setup lang="ts">
  import type {
    VerificationToolbarEmits,
    VerificationToolbarProps,
  } from "~/composables/admin/verifications/components/VerificationToolbar";
  import { useVerificationToolbarSetup } from "~/composables/admin/verifications/components/VerificationToolbar/setup";

  const props = defineProps<VerificationToolbarProps>();
  const emit = defineEmits<VerificationToolbarEmits>();

  const { handleRefresh, searchValue } = useVerificationToolbarSetup(props, emit);
</script>
