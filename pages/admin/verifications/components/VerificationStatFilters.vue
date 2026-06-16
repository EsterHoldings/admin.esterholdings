<template>
  <section
    class="flex flex-wrap items-center gap-2 max-[760px]:items-stretch"
    :aria-label="ariaLabel">
    <button
      v-for="card in cards"
      :key="card.id"
      type="button"
      :class="statCardClass(card)"
      @click="handleFilter(card.filter)">
      <span class="text-xs font-extrabold">{{ card.label }}</span>
      <span class="min-w-[18px] text-[13px] font-extrabold leading-none">{{ card.value }}</span>
    </button>
  </section>
</template>

<script setup lang="ts">
  import type {
    VerificationStatFiltersEmits,
    VerificationStatFiltersProps,
  } from "~/composables/admin/verifications/components/VerificationStatFilters";
  import { useVerificationStatFiltersSetup } from "~/composables/admin/verifications/components/VerificationStatFilters/setup";

  const props = defineProps<VerificationStatFiltersProps>();
  const emit = defineEmits<VerificationStatFiltersEmits>();

  const { handleFilter, statCardClass } = useVerificationStatFiltersSetup(props, emit);
</script>
