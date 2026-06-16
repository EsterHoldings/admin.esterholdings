<template>
  <UiContainer>
    <div class="space-y-5">
      <div class="flex items-center justify-between w-full text-[var(--ui-text-main)]">
        <UiTextH4>{{ titleLabel }}</UiTextH4>
      </div>

      <SupportToolbar v-bind="supportChildProps" />

      <SupportTicketTable
        v-if="isTableMode"
        v-bind="supportChildProps" />
      <SupportTicketCards
        v-else
        v-bind="supportChildProps" />

      <SupportPagination v-bind="supportChildProps" />

      <ChatDefault
        :admin-chat="true"
        v-if="isChatOpen"
        :ticket-id="currentTicketIdForChat"
        :currentUser="currentUser"
        :can-reply="canUpdateSupport"
        :admin-joined="isCurrentAdminJoined"
        @close="handleCloseChat"
        @admin-joined="handleFloatingChatJoined"
        class="fixed inset-0 z-[12000]" />
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import ChatDefault from "~/components/block/chats/ChatDefault.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import type { SupportPanelProps } from "~/composables/admin/support/components/SupportPanel";
  import { useSupportPanelSetup } from "~/composables/admin/support/components/SupportPanel/setup";
  import SupportPagination from "~/pages/admin/support/components/SupportPagination.vue";
  import SupportTicketCards from "~/pages/admin/support/components/SupportTicketCards.vue";
  import SupportTicketTable from "~/pages/admin/support/components/SupportTicketTable.vue";
  import SupportToolbar from "~/pages/admin/support/components/SupportToolbar.vue";

  const props = defineProps<SupportPanelProps>();

  const {
    canUpdateSupport,
    currentTicketIdForChat,
    currentUser,
    handleCloseChat,
    handleFloatingChatJoined,
    isChatOpen,
    isCurrentAdminJoined,
    isTableMode,
    supportChildProps,
    titleLabel,
  } = useSupportPanelSetup(props);
</script>

<style>
  .ticket-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ticket-card__header {
    min-width: 0;
  }

  .ticket-card__subject {
    color: var(--ui-text-main);
    font-size: 16px;
    line-height: 1.25;
    font-weight: 700;
  }

  .ticket-card__subject-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .ticket-channel-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid transparent;
  }

  .ticket-channel-badge--chat {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
    border-color: color-mix(in srgb, var(--ui-primary-main) 50%, transparent);
  }

  .ticket-channel-badge--email {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-sticker-warning) 22%, transparent);
    border-color: color-mix(in srgb, var(--ui-sticker-warning) 55%, transparent);
  }

  .ticket-source-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 700;
    white-space: nowrap;
    border: 1px solid transparent;
  }

  .ticket-source-badge--landing {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-sticker-success) 20%, transparent);
    border-color: color-mix(in srgb, var(--ui-sticker-success) 56%, transparent);
  }

  .ticket-source-badge--admin {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 14%, transparent);
    border-color: color-mix(in srgb, var(--ui-primary-main) 46%, transparent);
  }

  .support-archive-filter {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 999px;
    color: var(--ui-text-secondary);
    background: color-mix(in srgb, var(--ui-background-panel) 82%, transparent);
    font-size: 12px;
    font-weight: 700;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .support-archive-filter.is-active {
    color: var(--ui-text-main);
    border-color: color-mix(in srgb, var(--ui-sticker-warning) 54%, transparent);
    background: color-mix(in srgb, var(--ui-sticker-warning) 15%, transparent);
  }

  .support-archive-filter__dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--ui-sticker-success);
  }

  .support-archive-filter.is-active .support-archive-filter__dot {
    background: var(--ui-sticker-warning);
  }

  .ticket-client-cell {
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr);
    align-items: center;
    gap: 9px;
    min-width: 0;
  }

  .ticket-client-avatar {
    position: relative;
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    overflow: hidden;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 999px;
    background: var(--ui-background);
    color: var(--ui-text-main);
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .ticket-client-avatar i {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 9px;
    height: 9px;
    border: 2px solid var(--ui-background-panel);
    border-radius: 999px;
    background: var(--ui-text-secondary);
  }

  .ticket-client-avatar i.is-online {
    background: var(--ui-sticker-success);
  }

  .ticket-client-cell__text {
    display: grid;
    gap: 1px;
    min-width: 0;
  }

  .ticket-client-cell__text strong,
  .ticket-client-cell__text span,
  .ticket-subject-cell__preview,
  .ticket-time-cell strong,
  .ticket-time-cell span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ticket-client-cell__text strong {
    color: var(--ui-text-main);
    font-size: 13px;
    font-weight: 800;
    line-height: 1.2;
  }

  .ticket-client-cell__text span {
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.2;
  }

  .ticket-subject-cell {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .ticket-subject-cell__title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: var(--ui-text-main);
    font-weight: 800;
  }

  .ticket-subject-cell__preview {
    max-width: 520px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.35;
  }

  .ticket-time-cell {
    display: grid;
    gap: 2px;
    min-width: 130px;
  }

  .ticket-time-cell strong {
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 780;
  }

  .ticket-time-cell span {
    color: var(--ui-text-secondary);
    font-size: 11px;
  }

  .ticket-card__id-row {
    margin-top: 2px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.2;
  }

  .ticket-card__meta-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
  }

  .ticket-card__counterparty-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    min-width: 0;
  }

  .ticket-card__avatar {
    height: 34px;
    width: 34px;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background);
    color: var(--ui-text-main);
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  .ticket-card__presence {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ui-text-main);
    font-size: 12px;
    line-height: 1.2;
    font-weight: 500;
    white-space: nowrap;
  }

  .ticket-card__presence-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
  }

  .ticket-card__updated {
    color: var(--ui-text-secondary);
    font-size: 11px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .ticket-card__actions-col {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ticket-card__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ui-text-main);
    font-size: 12px;
    line-height: 1.2;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .ticket-card__status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
  }

  .ticket-card__actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .ticket-card__icon-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid transparent;
    color: var(--ui-text-secondary);
    background: transparent;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .ticket-card__icon-btn:hover {
    color: var(--ui-text-main);
    border-color: var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--color-stroke-ui-light) 40%, transparent);
  }

  .ticket-card__chat-badge {
    position: absolute;
    top: 1px;
    right: 1px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--ui-sticker-danger);
    color: #fff;
    font-size: 10px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ticket-status-actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    background: color-mix(in srgb, var(--ui-background) 74%, transparent);
  }

  .ticket-status-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--ui-text-secondary);
    background: transparent;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease,
      opacity 0.2s ease;
  }

  .ticket-status-action:not(:disabled):hover {
    color: var(--ui-text-main);
    border-color: var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--color-stroke-ui-light) 42%, transparent);
  }

  .ticket-status-action:disabled {
    cursor: default;
    opacity: 0.48;
  }

  .ticket-status-action.is-active {
    opacity: 1;
    color: var(--ui-text-main);
    border-color: color-mix(in srgb, var(--ui-primary-main) 56%, transparent);
    background: color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
  }

  .ticket-status-action--pending.is-active {
    border-color: color-mix(in srgb, var(--ui-sticker-warning) 60%, transparent);
    background: color-mix(in srgb, var(--ui-sticker-warning) 18%, transparent);
  }

  .ticket-status-action--closed.is-active {
    border-color: color-mix(in srgb, var(--ui-sticker-success) 60%, transparent);
    background: color-mix(in srgb, var(--ui-sticker-success) 18%, transparent);
  }

  .ticket-status-action__icon {
    width: 16px;
    height: 16px;
  }

  .ticket-action-menu__dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    z-index: 60;
    min-width: 150px;
    padding: 6px;
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 10px;
    background: var(--ui-background-panel);
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.18);
  }

  .ticket-action-menu__item {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border-radius: 8px;
    color: var(--ui-text-main);
    font-size: 13px;
    line-height: 1.2;
    text-align: left;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;
  }

  .ticket-action-menu__item:not(:disabled):hover {
    background: color-mix(in srgb, var(--color-stroke-ui-light) 42%, transparent);
  }

  .ticket-action-menu__item:disabled {
    opacity: 0.5;
  }

  .ticket-action-menu__item--danger {
    color: var(--ui-sticker-danger);
  }

  .ticket-admins {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding-left: 6px;
  }

  .ticket-admins--card {
    padding-left: 0;
  }

  .ticket-admins__empty {
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .ticket-admins__item {
    position: relative;
    margin-left: -6px;
  }

  .ticket-admins__item:first-of-type {
    margin-left: 0;
  }

  .ticket-admin-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    overflow: hidden;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 999px;
    background: var(--ui-background);
    color: var(--ui-text-main);
    font-size: 10px;
    font-weight: 800;
    line-height: 1;
    text-transform: uppercase;
    box-shadow: 0 0 0 2px var(--ui-background-panel);
  }

  .ticket-admin-popover {
    position: absolute;
    left: 0;
    top: calc(100% + 8px);
    z-index: 70;
    width: max-content;
    min-width: 190px;
    max-width: 260px;
    padding: 10px;
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 10px;
    background: var(--ui-background-panel);
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.18);
  }

  .ticket-admin-popover__name {
    color: var(--ui-text-main);
    font-size: 13px;
    font-weight: 800;
    line-height: 1.25;
  }

  .ticket-admin-popover__email {
    margin-top: 3px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.3;
    word-break: break-word;
  }

  .ticket-admin-popover__link {
    margin-top: 8px;
    color: var(--ui-primary-main);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;
  }

  .ticket-card--full-row {
    display: grid;
    grid-template-columns: minmax(260px, 1.2fr) minmax(0, 1fr);
    align-items: center;
    column-gap: 16px;
    row-gap: 8px;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  @media (max-width: 1024px) {
    .ticket-card--full-row {
      grid-template-columns: 1fr;
      row-gap: 10px;
    }
  }

  @media (max-width: 640px) {
    .ticket-card__meta-row {
      grid-template-columns: 1fr;
      align-items: flex-start;
    }

    .ticket-card__actions-col {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
