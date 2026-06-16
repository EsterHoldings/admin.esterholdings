<template>
  <div
    class="clients-panel__content"
    :class="viewMode">
    <div
      v-for="item in props.data"
      :key="item.id"
      class="client-card card-with-action"
      :class="viewMode === 'full' ? 'client-card--full' : ''"
      @click="handleOpenClientPage(item.id)">
      <div
        class="client-card__actions"
        @click.stop>
        <button
          type="button"
          class="client-card__actions-button"
          :aria-label="resolveText('admin.clients.actions.openMenu', 'Open menu')"
          @click.stop="toggleActionMenu(item.id)">
          <UiIconDotsVertical class="!h-4 !w-4" />
        </button>
        <div
          v-if="activeMenuId === item.id"
          class="client-card__actions-menu">
          <button
            type="button"
            class="client-card__actions-item is-danger"
            @click.stop="handleFullDelete(item)">
            {{ resolveText("admin.clients.actions.fullDelete", "Full deletion") }}
          </button>
        </div>
      </div>
      <div
        class="client-card__body"
        :class="viewMode === 'full' ? 'client-card__body--row' : ''">
        <div class="client-card__user">
          <div class="client-card__user-row">
            <button
              v-if="item.id"
              class="client-card__copy client-card__copy--leading"
              aria-label="Copy id"
              @click.stop>
              <UiIconCopy :text="item.id" />
            </button>
            <div
              class="user-photo"
              @click="handleOpenClientPage(item.id)">
              <UiImageCircle
                :twoChars="getTwoCharsByFullName(item.first_name, item.last_name)"
                :src="item.photo_url" />
            </div>
            <div class="client-card__user-text">
              <div class="client-card__name-row">
                <div class="truncate font-semibold">{{ item.first_name }} {{ item.last_name }}</div>
              </div>
              <div class="client-card__badges">
                <span
                  class="client-card__badge"
                  :class="`is-source-${normalizeBadgeValue(item.acquisition_source)}`">
                  {{ acquisitionSourceLabel(item) }}
                </span>
                <span
                  class="client-card__badge"
                  :class="`is-registration-${normalizeBadgeValue(item.registration_method)}`">
                  {{ registrationMethodLabel(item) }}
                </span>
              </div>
              <div class="client-card__online-row">
                <span
                  class="client-card__online-dot"
                  :class="item.is_online ? 'is-online' : 'is-offline'" />
                <span>{{
                  item.is_online
                    ? t("admin.clients.online.onlineNow", "Online")
                    : t("admin.clients.online.offlineNow", "Offline")
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("admin.accounts.components.accounts-panel.columns.email") }}
          </UiTextSmall>
          <div class="truncate">{{ item.email || "-" }}</div>
        </div>

        <div>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("admin.accounts.components.accounts-panel.columns.phone") }}
          </UiTextSmall>
          <div class="truncate">{{ item.phone || "-" }}</div>
        </div>

        <div>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("admin.clients.columns.birthdate", "Birthdate") }}
          </UiTextSmall>
          <div class="truncate">{{ item.birthdate || "-" }}</div>
        </div>

        <div>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("admin.accounts.components.accounts-panel.columns.created_at") }}
          </UiTextSmall>
          <div class="client-card__meta">{{ formatDate(item.created_at) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import type { ClientsContentEmit, ClientsContentProps } from "~/composables/admin/clients/components/ClientsContent";
  import { useClientsContentSetup } from "~/composables/admin/clients/components/ClientsContent/setup";

  const props = withDefaults(defineProps<ClientsContentProps>(), {
    data: () => [],
    viewMode: "cards",
  });
  const emit = defineEmits<ClientsContentEmit>();

  const {
    t,
    activeMenuId,
    handleOpenClientPage,
    toggleActionMenu,
    handleFullDelete,
    resolveText,
    getTwoCharsByFullName,
    formatDate,
    normalizeBadgeValue,
    acquisitionSourceLabel,
    registrationMethodLabel,
  } = useClientsContentSetup(props, emit);
</script>

<style scoped lang="scss">
  .clients-panel__content {
    color: var(--ui-text-main);

    &.cards {
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr;
    }

    &.full {
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 768px) {
    .clients-panel__content.cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1280px) {
    .clients-panel__content.cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .client-card {
    position: relative;
    background: var(--ui-background-panel);
    border-bottom: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    padding: 10px 44px 10px 14px;
    transition:
      background-color 0.2s ease,
      opacity 0.2s ease;
  }

  .client-card--full {
    padding: 6px 40px 6px 14px;
  }

  .client-card:hover {
    opacity: 0.6;
  }

  .client-card__body {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    color: var(--ui-text-main);
  }

  .client-card__body > div {
    flex: 1 1 140px;
    min-width: 140px;
  }

  .client-card__body--row {
    flex-wrap: nowrap;
    gap: 4px 10px;
    align-items: center;
  }

  .client-card__user {
    min-width: 180px;
  }

  .client-card__user-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .client-card__user-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .client-card__name-row {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .client-card__online-row {
    margin-top: 2px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--ui-text-secondary);
  }

  .client-card__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }

  .client-card__badge {
    display: inline-flex;
    align-items: center;
    min-height: 19px;
    max-width: 100%;
    border-radius: 999px;
    padding: 2px 7px;
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    color: var(--ui-text-main);
    font-size: 10px;
    font-weight: 760;
    line-height: 1.2;
    white-space: nowrap;
  }

  .client-card__badge.is-source-referral {
    background: color-mix(in srgb, var(--ui-success-main, #26c281) 13%, transparent);
    color: var(--ui-success-main, #26c281);
  }

  .client-card__badge.is-registration-social {
    background: color-mix(in srgb, var(--ui-primary-main) 14%, transparent);
    color: var(--ui-primary-main);
  }

  .client-card__online-dot {
    width: 7px;
    height: 7px;
    border-radius: 9999px;
    background: var(--ui-text-secondary);
  }

  .client-card__online-dot.is-online {
    background: var(--ui-sticker-success);
  }

  .client-card__online-dot.is-offline {
    background: var(--ui-text-secondary);
  }

  .client-card__copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-secondary);
  }

  .client-card__copy:hover {
    color: var(--ui-text-main);
  }

  .client-card__copy--leading {
    flex-shrink: 0;
  }

  .client-card__meta {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 1024px) {
    .client-card__body--row {
      flex-wrap: wrap;
    }
  }

  .card-with-action {
    padding-right: 44px;
  }

  .client-card__actions {
    position: absolute;
    right: 8px;
    top: 8px;
    z-index: 3;
  }

  .client-card__actions-button {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 8px;
    background: var(--ui-background-panel);
    color: var(--ui-text-secondary);
    transition:
      border-color 0.18s ease,
      color 0.18s ease,
      background 0.18s ease;
  }

  .client-card__actions-button:hover {
    border-color: color-mix(in srgb, var(--ui-primary-main) 38%, transparent);
    color: var(--ui-text-main);
    background: var(--color-stroke-ui-dark);
  }

  .client-card__actions-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    min-width: 178px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 8px;
    background: var(--ui-background-panel);
    box-shadow: 0 16px 36px color-mix(in srgb, var(--ui-background) 82%, transparent);
    padding: 5px;
  }

  .client-card__actions-item {
    width: 100%;
    min-height: 34px;
    border-radius: 6px;
    padding: 0 10px;
    text-align: left;
    font-size: 13px;
    font-weight: 650;
    color: var(--ui-text-main);
  }

  .client-card__actions-item:hover {
    background: var(--color-stroke-ui-dark);
  }

  .client-card__actions-item.is-danger {
    color: var(--ui-danger-main, #ff5f73);
  }
</style>
