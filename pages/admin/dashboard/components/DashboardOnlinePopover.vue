<template>
  <div
    class="pointer-events-none absolute left-0 top-[calc(100%+6px)] z-20 flex w-[min(360px,calc(100vw-32px))] -translate-y-1 flex-col gap-2 rounded-lg border border-[color-mix(in_srgb,var(--ui-primary-main)_20%,var(--color-stroke-ui-light))] bg-[color-mix(in_srgb,var(--ui-background-panel)_96%,transparent)] p-2.5 text-[var(--ui-text-main)] opacity-0 shadow-[0_18px_42px_color-mix(in_srgb,#000_16%,transparent)] transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100"
    role="group"
    :aria-label="clientsLabel">
    <div
      class="flex items-center justify-between gap-2 border-b border-[color-mix(in_srgb,var(--color-stroke-ui-light)_72%,transparent)] px-0.5 pb-1 text-xs font-[820]">
      <span>{{ title }}</span>
      <strong class="text-[var(--color-success)]">{{ count }}</strong>
    </div>

    <div
      v-if="rawCount === 0"
      class="px-2 py-2.5 text-[11px] font-semibold leading-snug text-[var(--ui-text-secondary)]">
      {{ emptyText }}
    </div>

    <div
      v-else-if="clients.length === 0"
      class="px-2 py-2.5 text-[11px] font-semibold leading-snug text-[var(--ui-text-secondary)]">
      {{ loadingText }}
    </div>

    <div
      v-else
      class="flex max-h-[372px] flex-col gap-1.5 overflow-auto">
      <button
        v-for="client in clients"
        :key="client.id"
        type="button"
        class="grid min-h-[46px] w-full grid-cols-[34px_minmax(0,1fr)] items-center gap-2 rounded-lg border border-transparent bg-transparent p-1.5 text-left text-inherit transition hover:border-[color-mix(in_srgb,var(--ui-primary-main)_26%,var(--color-stroke-ui-light))] hover:bg-[color-mix(in_srgb,var(--ui-primary-main)_7%,transparent)] focus-visible:border-[color-mix(in_srgb,var(--ui-primary-main)_26%,var(--color-stroke-ui-light))] focus-visible:bg-[color-mix(in_srgb,var(--ui-primary-main)_7%,transparent)] focus-visible:outline-none"
        @click.stop="$emit('open-client', client.id)">
        <span
          class="inline-flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[var(--ui-primary-main)] to-[var(--ui-primary-accent)] text-[11px] font-[850] tracking-normal text-[var(--ui-text-invert)]">
          <img
            v-if="client.photo_url"
            :src="client.photo_url"
            :alt="resolveName(client)"
            class="h-full w-full object-cover"
            loading="lazy" />
          <span v-else>{{ client.initials || getInitials(resolveName(client) || resolveEmail(client)) }}</span>
        </span>
        <span class="flex min-w-0 flex-col gap-0.5">
          <span class="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-[820] leading-tight">
            {{ resolveName(client) }}
          </span>
          <span
            class="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold leading-snug text-[var(--ui-text-secondary)]">
            {{ resolveEmail(client) }}
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { DashboardOnlineClient } from "../types";

  defineProps<{
    clients: DashboardOnlineClient[];
    rawCount: number;
    count: string;
    title: string;
    clientsLabel: string;
    emptyText: string;
    loadingText: string;
    resolveName: (client: DashboardOnlineClient) => string;
    resolveEmail: (client: DashboardOnlineClient) => string;
    getInitials: (value?: string | null) => string;
  }>();

  defineEmits<{
    "open-client": [id: string];
  }>();
</script>
