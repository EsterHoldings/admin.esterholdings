<template>
  <article
    class="grid items-center gap-4 rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-3.5 min-[1181px]:grid-cols-[minmax(260px,1.1fr)_minmax(170px,0.45fr)_minmax(320px,1.35fr)]">
    <div class="flex min-w-0 items-center gap-3">
      <NuxtLink
        class="h-[54px] w-[54px] shrink-0 rounded-full"
        :to="clientTo">
        <img
          v-if="item.photo_url"
          :src="item.photo_url"
          :alt="item.full_name"
          class="h-[54px] w-[54px] rounded-full border-2 border-[var(--color-stroke-ui-light)] object-cover" />
        <span
          v-else
          class="flex h-[54px] w-[54px] items-center justify-center rounded-full border-2 border-[var(--color-stroke-ui-light)] bg-[color-mix(in_srgb,var(--ui-primary-main)_14%,var(--ui-background-panel))] font-extrabold text-[var(--ui-text-main)]">
          {{ avatarText }}
        </span>
      </NuxtLink>

      <div class="min-w-0">
        <NuxtLink
          class="block truncate text-base font-extrabold text-[var(--ui-text-main)] no-underline"
          :to="clientTo">
          {{ item.full_name || "-" }}
        </NuxtLink>
        <NuxtLink
          class="mt-1 block truncate text-[13px] text-[var(--ui-text-secondary)] no-underline"
          :to="clientTo">
          {{ item.email || "-" }}
        </NuxtLink>
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="text-lg font-extrabold text-[var(--ui-text-main)]">{{ formatDayMonth(item.birthday_on) }}</div>
      <div class="flex flex-wrap gap-1.5 text-xs text-[var(--ui-text-secondary)]">
        <span class="inline-flex min-h-[22px] items-center rounded-full bg-[var(--color-stroke-ui-light)] px-2">
          {{ ageLabel(item.age) }}
        </span>
        <span class="inline-flex min-h-[22px] items-center rounded-full bg-[var(--color-stroke-ui-light)] px-2">
          {{ daysLabel(item.days_until) }}
        </span>
      </div>
    </div>

    <div class="min-w-0">
      <div class="mb-2 text-xs font-extrabold uppercase text-[var(--ui-text-secondary)]">{{ labels.history }}</div>

      <div
        v-if="item.notifications.length === 0"
        class="text-[13px] text-[var(--ui-text-secondary)]">
        {{ labels.noEmails }}
      </div>

      <div
        v-else
        class="grid gap-1.5">
        <div
          v-for="notification in item.notifications"
          :key="notification.id"
          class="grid min-w-0 items-center gap-2 text-xs text-[var(--ui-text-secondary)] min-[1181px]:grid-cols-[auto_minmax(120px,0.9fr)_minmax(140px,1fr)_minmax(140px,1fr)_auto] max-[1180px]:grid-cols-[auto_minmax(120px,1fr)] max-[640px]:grid-cols-1 max-[640px]:items-start">
          <span
            class="inline-flex min-h-[22px] items-center rounded-full px-2 font-extrabold"
            :class="statusClass(notification.status)">
            {{ statusLabel(notification.status) }}
          </span>
          <span class="truncate">
            {{ recipientLabel(notification.recipient_type) }} · {{ typeLabel(notification.notification_type) }}
          </span>
          <span class="truncate">{{ notification.subject || "-" }}</span>
          <span class="truncate">{{ notification.recipient_email }}</span>
          <span class="truncate">
            {{ notificationTime(notification.sent_at || notification.queued_at || notification.created_at) }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
  import type { BirthdayCardProps } from "~/composables/admin/birthdays/components/BirthdayCard";
  import { useBirthdayCardSetup } from "~/composables/admin/birthdays/components/BirthdayCard/setup";

  const props = defineProps<BirthdayCardProps>();
  const { avatarText, clientTo, notificationTime, statusClass } = useBirthdayCardSetup(props);
</script>
