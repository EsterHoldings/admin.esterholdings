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
  import { useI18n } from "vue-i18n";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  interface AdminClientCardItem {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    birthdate?: string;
    created_at?: string;
    photo_url?: string;
    is_online?: boolean;
  }

  const emit = defineEmits<{
    (e: "click", id: string): void;
  }>();

  const props = withDefaults(
    defineProps<{
      data: AdminClientCardItem[];
      viewMode: string;
    }>(),
    {
      data: () => [],
      viewMode: "cards",
    }
  );

  const { t } = useI18n({ useScope: "global" });
  const handleOpenClientPage = (id: string) => emit("click", id);

  const getTwoCharsByFullName = (firstName: string, lastName: string): string => {
    const firstInitial = String(firstName ?? "").charAt(0);
    const lastInitial = String(lastName ?? "").charAt(0);
    return `${firstInitial}${lastInitial}`;
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toLocaleString();
  };
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
    padding: 10px 14px;
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
    padding-right: 14px;
  }
</style>
