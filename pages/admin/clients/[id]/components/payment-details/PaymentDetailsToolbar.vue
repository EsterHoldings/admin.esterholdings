<template>
  <section class="flex justify-end gap-2.5 max-[640px]:flex-col">
    <PrimeSelect
      v-model="selectedArchiveFilter"
      :options="archiveFilterOptions"
      option-label="label"
      option-value="value"
      class="w-[min(100%,220px)] max-[640px]:w-full" />

    <PrimeButton
      icon="pi pi-refresh"
      rounded
      :loading="isLoading"
      :aria-label="refreshLabel"
      @click="handleRefresh" />
  </section>
</template>

<script setup lang="ts">
  import type {
    PaymentDetailsToolbarEmits,
    PaymentDetailsToolbarProps,
  } from "~/composables/admin/clients/components/PaymentDetailsToolbar";
  import { usePaymentDetailsToolbarSetup } from "~/composables/admin/clients/components/PaymentDetailsToolbar/setup";

  const props = defineProps<PaymentDetailsToolbarProps>();
  const emit = defineEmits<PaymentDetailsToolbarEmits>();

  const { handleRefresh, selectedArchiveFilter } = usePaymentDetailsToolbarSetup(props, emit);
</script>
