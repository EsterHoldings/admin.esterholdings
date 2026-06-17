<template>
  <div class="grid grid-cols-4 gap-2.5 max-[820px]:grid-cols-2 max-[640px]:grid-cols-1">
    <div
      v-for="card in cards"
      :key="card.id"
      class="relative min-w-0"
      :class="{ group: isOnlineCard(card) }">
      <DashboardSummaryCard
        :card="card"
        @open="handleNavigate" />

      <template v-if="isOnlineCard(card)">
        <div class="absolute left-0 top-full z-[19] h-2 w-[min(360px,calc(100vw-32px))]" />
        <DashboardOnlinePopover
          :clients="onlineClients"
          :raw-count="onlineCount"
          :count="formattedOnlineCount"
          :title="onlineTitle"
          :clients-label="onlineClientsLabel"
          :empty-text="onlineEmptyText"
          :loading-text="onlineLoadingText"
          :resolve-name="onlineClientName"
          :resolve-email="onlineClientEmail"
          :resolve-session-duration="onlineClientSessionDuration"
          :get-initials="getInitials"
          @open-client="handleClientNavigate" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import DashboardOnlinePopover from "./DashboardOnlinePopover.vue";
  import DashboardSummaryCard from "./DashboardSummaryCard.vue";
  import type {
    DashboardSummaryGridEmits,
    DashboardSummaryGridProps,
  } from "~/composables/admin/dashboard/components/DashboardSummaryGrid";
  import { useDashboardSummaryGridSetup } from "~/composables/admin/dashboard/components/DashboardSummaryGrid/setup";

  defineProps<DashboardSummaryGridProps>();
  const emit = defineEmits<DashboardSummaryGridEmits>();

  const { handleClientNavigate, handleNavigate, isOnlineCard } = useDashboardSummaryGridSetup(emit);
</script>
