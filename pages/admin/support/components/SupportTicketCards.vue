<template>
  <div class="relative">
    <div
      class="absolute inset-0 backdrop-blur-sm rounded-lg flex items-center justify-center"
      v-if="isLoading">
      <UiIconSpinnerDefault />
    </div>

    <div
      v-if="tickets.length === 0"
      class="w-full h-[50vh] flex items-center justify-center">
      <UiTextSmall>{{ supportListText.noTickets }}</UiTextSmall>
    </div>

    <div
      v-else
      class="grid gap-3"
      :class="viewMode === 'full' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'">
      <div
        v-for="ticket in filtered"
        :key="ticket.id"
        :class="[
          'ticket-card cursor-pointer rounded-xl border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background-panel)] p-4 transition hover:bg-[var(--color-stroke-ui-dark)]',
          viewMode === 'full' ? 'ticket-card--full-row' : '',
        ]"
        @click="handleClickRow(ticket.id)">
        <div class="ticket-card__header">
          <div
            class="ticket-client-cell"
            role="button"
            tabindex="0"
            @click.stop="openTicketClient(ticket)"
            @keydown.enter.stop.prevent="openTicketClient(ticket)"
            @keydown.space.stop.prevent="openTicketClient(ticket)">
            <button
              class="ticket-card__icon-btn"
              @click.stop
              :aria-label="supportListText.copyId">
              <UiIconCopy :text="String(ticket.id)" />
            </button>
            <div class="ticket-client-avatar">
              <img
                v-if="getTicketClientAvatarUrl(ticket)"
                :src="getTicketClientAvatarUrl(ticket)"
                :alt="getTicketClientName(ticket)"
                class="h-full w-full object-cover" />
              <span v-else>{{ getTicketClientInitials(ticket) }}</span>
              <i :class="ticket.counterparty_online ? 'is-online' : 'is-offline'" />
            </div>
            <div class="ticket-client-cell__text">
              <strong>{{ getTicketClientName(ticket) }}</strong>
              <span>{{ getTicketClientEmail(ticket) || "-" }}</span>
            </div>
          </div>
        </div>

        <div class="ticket-card__meta-row">
          <div class="ticket-card__counterparty-col">
            <div class="ticket-subject-cell">
              <div class="ticket-subject-cell__title">
                <span class="truncate">{{ ticket.subject }}</span>
                <span
                  class="ticket-channel-badge"
                  :class="getTicketChannelBadgeClass(ticket.channel, ticket.reply_email)">
                  {{ getTicketChannelLabel(ticket.channel, ticket.reply_email) }}
                </span>
                <span
                  v-if="getTicketSourceKey(ticket) !== 'cabinet'"
                  class="ticket-source-badge"
                  :class="getTicketSourceBadgeClass(ticket)">
                  {{ getTicketSourceLabel(ticket) }}
                </span>
              </div>
              <div class="ticket-subject-cell__preview">
                {{ getTicketPreview(ticket) || supportListText.noMessages }}
              </div>
            </div>
            <div class="ticket-time-cell">
              <strong>{{ ticket.last_message_at || "-" }}</strong>
              <span>{{ getTicketCreatedLabel(ticket) }}</span>
            </div>
            <div class="ticket-admins ticket-admins--card">
              <span
                v-if="getTicketAdminParticipants(ticket).length === 0"
                class="ticket-admins__empty">
                {{ supportListText.noAdmins }}
              </span>
              <div
                v-for="admin in getTicketAdminParticipants(ticket)"
                :key="getAdminParticipantKey(ticket, admin)"
                class="ticket-admins__item"
                @mouseenter="setActiveAdminPopoverKey(getAdminParticipantKey(ticket, admin))"
                @mouseleave="clearActiveAdminPopoverKey"
                @click.stop>
                <button
                  type="button"
                  class="ticket-admin-avatar"
                  :title="getAdminParticipantName(admin)"
                  @click.stop="toggleAdminPopover(ticket, admin)">
                  <img
                    v-if="getAdminParticipantAvatarUrl(admin)"
                    :src="getAdminParticipantAvatarUrl(admin)"
                    :alt="getAdminParticipantName(admin)"
                    class="h-full w-full object-cover" />
                  <span v-else>{{ getAdminParticipantInitials(admin) }}</span>
                </button>
                <div
                  v-if="activeAdminPopoverKey === getAdminParticipantKey(ticket, admin)"
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
          </div>

          <div class="ticket-card__actions-col">
            <span class="ticket-card__status">
              <span
                class="ticket-card__status-dot"
                :class="getTicketStatusDotClass(ticket.status)" />
              {{ getTicketStatusLabel(ticket.status) }}
            </span>

            <div class="ticket-card__actions">
              <button
                class="ticket-card__icon-btn ticket-card__chat-btn"
                @click.stop="handleChatIconClick(ticket)"
                :aria-label="supportListText.chat">
                <span
                  v-if="ticket.unread_messages_count > 0"
                  class="ticket-card__chat-badge">
                  {{ ticket.unread_messages_count }}
                </span>
                <UiIconChat class="!h-[20px] !w-[20px]" />
              </button>
              <div class="ticket-status-actions">
                <button
                  v-for="action in ticketStatusActions"
                  :key="`${ticket.id}-${action.status}`"
                  type="button"
                  class="ticket-status-action"
                  :class="[
                    getTicketStatusActionClass(action.status),
                    { 'is-active': isTicketStatusActive(ticket, action.status) },
                  ]"
                  :title="supportListText.setStatusTitle.replace('{status}', action.label)"
                  :disabled="
                    !canUpdateSupport || isTicketStatusActive(ticket, action.status) || isTicketActionLoading(ticket)
                  "
                  @click.stop="handleChangeTicketStatus(ticket, action.status)">
                  <component
                    :is="action.icon"
                    class="ticket-status-action__icon" />
                </button>
              </div>
              <button
                class="ticket-card__icon-btn"
                :aria-label="supportListText.more"
                @click.stop="toggleTicketActionMenu(ticket.id)">
                <UiIconDotsVertical />
              </button>
              <div
                v-if="openTicketActionMenuId === String(ticket.id)"
                class="ticket-action-menu__dropdown"
                @click.stop>
                <button
                  v-if="canDeleteSupport"
                  type="button"
                  class="ticket-action-menu__item ticket-action-menu__item--danger"
                  :disabled="isTicketActionLoading(ticket)"
                  @click.stop="handleArchiveTicket(ticket)">
                  <UiIconTrash />
                  <span>{{ supportListText.archive }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import UiIconChat from "~/components/ui/UiIconChat.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconTrash from "~/components/ui/UiIconTrash.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import type { SupportTicketCardsProps } from "~/composables/admin/support/components/SupportTicketCards";
  import { useSupportTicketCardsSetup } from "~/composables/admin/support/components/SupportTicketCards/setup";

  const props = defineProps<SupportTicketCardsProps>();

  useSupportTicketCardsSetup(props);
</script>
