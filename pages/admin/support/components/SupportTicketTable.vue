<template>
  <PanelDefault class="relative rounded-2xl border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background)]">
    <div
      class="absolute top-0 left-0 right-0 bottom-0 rounded-lg flex items-center justify-center bg-[var(--ui-background)]/40 backdrop-blur-sm"
      v-if="isLoading">
      <UiIconSpinnerDefault />
    </div>

    <div class="overflow-scroll no-scrollbar rounded-lg">
      <table class="w-full text-sm">
        <thead class="bg-[var(--color-stroke-ui-light)] h-[46px]">
          <tr class="text-left">
            <th class="px-4 font-semibold">
              <UiTextSmall class="!text-[var(--ui-text-main)]">{{ supportListText.client }}</UiTextSmall>
            </th>
            <th class="px-4 font-semibold">
              <UiTextSmall class="!text-[var(--ui-text-main)]">{{ supportListText.ticket }}</UiTextSmall>
            </th>
            <th class="px-4 font-semibold">
              <div class="flex items-center justify-start gap-2">
                <UiTextSmall
                  @click="handleOrderByAndDirection('last_message_at')"
                  class="!text-[var(--ui-text-main)]">
                  {{ supportListText.lastUpdate }}
                </UiTextSmall>
                <UiIconSort
                  class="!text-[var(--ui-text-main)]"
                  :active="orderBy === 'last_message_at'"
                  :direction="orderDirection"
                  @click="handleOrderByAndDirection('last_message_at')" />
              </div>
            </th>
            <th class="px-4 font-semibold">
              <UiTextSmall class="!text-[var(--ui-text-main)] whitespace-nowrap">{{
                supportListText.admins
              }}</UiTextSmall>
            </th>
            <th class="px-4 font-semibold">
              <div class="flex items-center justify-start gap-2">
                <UiTextSmall
                  @click="handleOrderByAndDirection('status')"
                  class="!text-[var(--ui-text-main)]">
                  {{ supportListText.status }}
                </UiTextSmall>
                <UiIconSort
                  class="!text-[var(--ui-text-main)]"
                  :active="orderBy === 'status'"
                  :direction="orderDirection"
                  @click="handleOrderByAndDirection('status')" />
              </div>
            </th>
            <th class="px-2 font-semibold !text-[var(--ui-text-main)]">...</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--color-stroke-ui-dark)]">
          <tr
            v-for="t in filtered"
            :key="t.id"
            class="bg-[var(--ui-background-panel)] hover:bg-[var(--color-stroke-ui-dark)] h-[60px] cursor-pointer"
            @click="handleClickRow(t.id)">
            <td class="px-4">
              <div
                class="ticket-client-cell"
                role="button"
                tabindex="0"
                @click.stop="openTicketClient(t)"
                @keydown.enter.stop.prevent="openTicketClient(t)"
                @keydown.space.stop.prevent="openTicketClient(t)">
                <button
                  class="ticket-card__icon-btn"
                  :aria-label="supportListText.copyId"
                  @click.stop>
                  <UiIconCopy :text="String(t.id)" />
                </button>
                <div class="ticket-client-avatar">
                  <img
                    v-if="getTicketClientAvatarUrl(t)"
                    :src="getTicketClientAvatarUrl(t)"
                    :alt="getTicketClientName(t)"
                    class="h-full w-full object-cover" />
                  <span v-else>{{ getTicketClientInitials(t) }}</span>
                  <i :class="t.counterparty_online ? 'is-online' : 'is-offline'" />
                </div>
                <div class="ticket-client-cell__text">
                  <strong>{{ getTicketClientName(t) }}</strong>
                  <span>{{ getTicketClientEmail(t) || "-" }}</span>
                </div>
              </div>
            </td>

            <td class="px-4">
              <div class="ticket-subject-cell">
                <div class="ticket-subject-cell__title">
                  <span class="truncate">{{ t.subject }}</span>
                  <span
                    class="ticket-channel-badge"
                    :class="getTicketChannelBadgeClass(t.channel, t.reply_email)">
                    {{ getTicketChannelLabel(t.channel, t.reply_email) }}
                  </span>
                  <span
                    v-if="getTicketSourceKey(t) !== 'cabinet'"
                    class="ticket-source-badge"
                    :class="getTicketSourceBadgeClass(t)">
                    {{ getTicketSourceLabel(t) }}
                  </span>
                </div>
                <div class="ticket-subject-cell__preview">
                  {{ getTicketPreview(t) || supportListText.noMessages }}
                </div>
              </div>
            </td>

            <td class="px-4 whitespace-nowrap">
              <div class="ticket-time-cell">
                <strong>{{ t.last_message_at || "-" }}</strong>
                <span>{{ getTicketCreatedLabel(t) }}</span>
              </div>
            </td>

            <td class="px-4">
              <div
                class="ticket-admins"
                @click.stop>
                <span
                  v-if="getTicketAdminParticipants(t).length === 0"
                  class="ticket-admins__empty">
                  {{ supportListText.none }}
                </span>
                <div
                  v-for="admin in getTicketAdminParticipants(t)"
                  :key="getAdminParticipantKey(t, admin)"
                  class="ticket-admins__item"
                  @mouseenter="setActiveAdminPopoverKey(getAdminParticipantKey(t, admin))"
                  @mouseleave="clearActiveAdminPopoverKey">
                  <button
                    type="button"
                    class="ticket-admin-avatar"
                    :title="getAdminParticipantName(admin)"
                    @click.stop="toggleAdminPopover(t, admin)">
                    <img
                      v-if="getAdminParticipantAvatarUrl(admin)"
                      :src="getAdminParticipantAvatarUrl(admin)"
                      :alt="getAdminParticipantName(admin)"
                      class="h-full w-full object-cover" />
                    <span v-else>{{ getAdminParticipantInitials(admin) }}</span>
                  </button>
                  <div
                    v-if="activeAdminPopoverKey === getAdminParticipantKey(t, admin)"
                    class="ticket-admin-popover"
                    @click.stop>
                    <div class="ticket-admin-popover__name">{{ getAdminParticipantName(admin) }}</div>
                    <div
                      v-if="getAdminParticipantEmail(admin)"
                      class="ticket-admin-popover__email">
                      {{ getAdminParticipantEmail(admin) }}
                    </div>
                    <button
                      v-if="getAdminParticipantId(admin)"
                      type="button"
                      class="ticket-admin-popover__link"
                      @click.stop="openAdminProfile(admin)">
                      {{ supportListText.openProfile }}
                    </button>
                  </div>
                </div>
              </div>
            </td>

            <td class="px-4">
              <span class="inline-flex items-center gap-1.5 text-xs text-[var(--ui-text-secondary)] whitespace-nowrap">
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="getTicketStatusDotClass(t.status)" />
                {{ getTicketStatusLabel(t.status) }}
              </span>
            </td>

            <td class="px-2 text-right">
              <div class="flex items-center justify-end gap-2 relative">
                <span
                  @click.stop="handleChatIconClick(t)"
                  class="relative h-[42px] w-[42px] flex items-center justify-center active:bg-[var(--color-stroke-ui-dark)] rounded-full hover:bg-[var(--color-stroke-ui-light)]">
                  <div
                    class="absolute top-1 right-1 bg-[--ui-sticker-danger] w-[16px] h-[16px] rounded-full border-none flex items-center justify-center"
                    v-if="t.unread_messages_count > 0">
                    {{ t.unread_messages_count }}
                  </div>
                  <UiIconChat class="!h-[24px] !w-[24px]" />
                </span>
                <div
                  class="ticket-status-actions"
                  @click.stop>
                  <button
                    v-for="action in ticketStatusActions"
                    :key="`${t.id}-${action.status}`"
                    type="button"
                    class="ticket-status-action"
                    :class="[
                      getTicketStatusActionClass(action.status),
                      { 'is-active': isTicketStatusActive(t, action.status) },
                    ]"
                    :title="supportListText.setStatusTitle.replace('{status}', action.label)"
                    :disabled="!canUpdateSupport || isTicketStatusActive(t, action.status) || isTicketActionLoading(t)"
                    @click.stop="handleChangeTicketStatus(t, action.status)">
                    <component
                      :is="action.icon"
                      class="ticket-status-action__icon" />
                  </button>
                </div>
                <button
                  class="ticket-card__icon-btn"
                  :aria-label="supportListText.more"
                  @click.stop="toggleTicketActionMenu(t.id)">
                  <UiIconDotsVertical />
                </button>
                <div
                  v-if="openTicketActionMenuId === String(t.id)"
                  class="ticket-action-menu__dropdown"
                  @click.stop>
                  <button
                    v-if="canDeleteSupport"
                    type="button"
                    class="ticket-action-menu__item ticket-action-menu__item--danger"
                    :disabled="isTicketActionLoading(t)"
                    @click.stop="handleArchiveTicket(t)">
                    <UiIconTrash />
                    <span>{{ supportListText.archive }}</span>
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelDefault>
</template>

<script lang="ts" setup>
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiIconChat from "~/components/ui/UiIconChat.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import UiIconSort from "~/components/ui/UiIconSort.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconTrash from "~/components/ui/UiIconTrash.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import type { SupportTicketTableProps } from "~/composables/admin/support/components/SupportTicketTable";
  import { useSupportTicketTableSetup } from "~/composables/admin/support/components/SupportTicketTable/setup";

  const props = defineProps<SupportTicketTableProps>();

  useSupportTicketTableSetup(props);
</script>
