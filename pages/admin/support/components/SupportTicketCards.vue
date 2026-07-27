<template>
  <div class="relative">
    <div
      class="absolute inset-0 backdrop-blur-sm rounded-lg flex items-center justify-center"
      v-if="isLoading">
      <UiIconSpinnerDefault />
    </div>

    <div
      v-if="!hasTickets"
      class="w-full h-[50vh] flex items-center justify-center">
      <UiTextSmall>{{ supportListText.noTickets }}</UiTextSmall>
    </div>

    <div
      v-else
      class="grid gap-3"
      :class="ticketGridClass">
      <div
        v-for="ticket in filtered"
        :key="ticket.id"
        :class="getTicketCardClass(ticket)"
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
                  v-if="isAdminPopoverVisible(ticket, admin)"
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
                :class="getTicketStatusDotClass(ticket)" />
              {{ getTicketStatusLabel(ticket) }}
            </span>

            <div class="ticket-card__actions">
              <button
                class="ticket-card__icon-btn ticket-card__chat-btn"
                @click.stop="handleChatIconClick(ticket)"
                :aria-label="supportListText.chat">
                <span
                  v-if="hasTicketUnreadMessages(ticket)"
                  class="ticket-card__chat-badge">
                  {{ ticket.unread_messages_count }}
                </span>
                <UiIconChat class="!h-[20px] !w-[20px]" />
              </button>
              <button
                type="button"
                class="ticket-complete-action"
                :title="supportListText.complete"
                :disabled="isCompleteActionDisabled(ticket)"
                @click.stop="handleCompleteTicket(ticket)">
                <UiIconCheck class="ticket-complete-action__icon" />
                <span>{{ supportListText.complete }}</span>
              </button>
              <button
                v-if="canDeleteSupport && !showArchived"
                type="button"
                class="ticket-card__icon-btn ticket-card__archive-btn"
                :aria-label="supportListText.archive"
                :title="supportListText.archive"
                :disabled="isTicketActionLoading(ticket)"
                @click.stop="handleArchiveTicket(ticket)">
                <UiIconTrash />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import UiIconCheck from "~/components/ui/UiIconCheck.vue";
  import UiIconChat from "~/components/ui/UiIconChat.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconTrash from "~/components/ui/UiIconTrash.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import type { SupportTicketCardsProps } from "~/composables/admin/support/components/SupportTicketCards";
  import { useSupportTicketCardsSetup } from "~/composables/admin/support/components/SupportTicketCards/setup";

  const props = defineProps<SupportTicketCardsProps>();

  const {
    canDeleteSupport,
    clearActiveAdminPopoverKey,
    filtered,
    getAdminParticipantAvatarUrl,
    getAdminParticipantEmail,
    getAdminParticipantId,
    getAdminParticipantInitials,
    getAdminParticipantKey,
    getAdminParticipantName,
    getTicketAdminParticipants,
    getTicketCardClass,
    getTicketChannelBadgeClass,
    getTicketChannelLabel,
    getTicketClientAvatarUrl,
    getTicketClientEmail,
    getTicketClientInitials,
    getTicketClientName,
    getTicketCreatedLabel,
    getTicketPreview,
    getTicketSourceBadgeClass,
    getTicketSourceKey,
    getTicketSourceLabel,
    getTicketStatusDotClass,
    getTicketStatusLabel,
    handleArchiveTicket,
    handleCompleteTicket,
    handleChatIconClick,
    handleClickRow,
    hasTicketUnreadMessages,
    hasTickets,
    isAdminPopoverVisible,
    isCompleteActionDisabled,
    isLoading,
    isTicketActionLoading,
    openAdminProfile,
    openTicketClient,
    setActiveAdminPopoverKey,
    showArchived,
    supportListText,
    ticketGridClass,
    toggleAdminPopover,
  } = useSupportTicketCardsSetup(props);
</script>
