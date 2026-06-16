<template>
  <div class="grid grid-cols-4 gap-2.5 max-[820px]:grid-cols-2 max-[640px]:grid-cols-1">
    <div
      v-for="card in cards"
      :key="card.id"
      class="relative min-w-0"
      :class="{ group: card.id === 'online_now' }">
      <DashboardSummaryCard
        :card="card"
        @open="$emit('navigate', $event)" />

      <template v-if="card.id === 'online_now'">
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
          :get-initials="getInitials"
          @open-client="$emit('navigate', `/clients/${$event}`)" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import DashboardOnlinePopover from "./DashboardOnlinePopover.vue";
  import DashboardSummaryCard from "./DashboardSummaryCard.vue";
  import type { DashboardOnlineClient, DashboardSummaryCard as SummaryCard } from "../types";

  defineProps<{
    cards: SummaryCard[];
    onlineClients: DashboardOnlineClient[];
    onlineCount: number;
    formattedOnlineCount: string;
    onlineTitle: string;
    onlineClientsLabel: string;
    onlineEmptyText: string;
    onlineLoadingText: string;
    onlineClientName: (client: DashboardOnlineClient) => string;
    onlineClientEmail: (client: DashboardOnlineClient) => string;
    getInitials: (value?: string | null) => string;
  }>();

  defineEmits<{
    navigate: [to: string];
  }>();
</script>
