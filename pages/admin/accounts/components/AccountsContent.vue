<template>
  <div
    class="accounts-panel__content"
    :class="viewMode"
  >
    <div
      v-for="item in props.data"
      :key="item.id"
      class="account-card card-with-action"
      :class="viewMode === 'full' ? 'account-card--full' : ''"
      @click="handleOpenAccountPage(item)"
    >
      <div class="account-card__actions-wrap">
        <button
          v-if="showActionMenu"
          type="button"
          class="account-card__menu-toggle"
          @click.stop="toggleMenu(item.id)"
        >
          <UiIconDotsVertical />
        </button>

        <div
          v-if="showActionMenu && activeMenuId === item.id"
          class="account-card__menu"
          @click.stop
        >
          <button
            v-if="canEdit"
            type="button"
            class="account-card__menu-item"
            @click="emitEdit(item)"
          >
            {{ t("admin.accounts.actions.edit", "Edit") }}
          </button>
          <button
            v-if="canRefresh"
            type="button"
            class="account-card__menu-item"
            @click="emitRefresh(item)"
          >
            {{ t("admin.accounts.actions.refreshBalance", "Refresh balance") }}
          </button>
          <button
            v-if="canDelete"
            type="button"
            class="account-card__menu-item danger"
            @click="emitDelete(item)"
          >
            {{ t("admin.accounts.actions.archive", "Archive") }}
          </button>
        </div>
      </div>

      <div
        class="account-card__body"
        :class="viewMode === 'full' ? 'account-card__body--row' : ''"
      >
        <div class="account-card__owner">
          <div class="account-card__owner-row">
            <button
              v-if="item.id"
              class="account-card__copy account-card__copy--leading"
              aria-label="Copy id"
              @click.stop
            >
              <UiIconCopy :text="item.id" />
            </button>

            <div class="owner-photo">
              <UiImageCircle
                :twoChars="getTwoCharsByFullName(item.owner_name)"
                :src="item.owner_photo_path"
              />
            </div>

            <div class="account-card__owner-text">
              <div class="truncate font-semibold">
                {{ item.owner_name || "-" }}
              </div>
              <div class="account-card__owner-meta truncate">
                {{ item.owner_email || "-" }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("admin.accounts.columns.number", "Account number") }}
          </UiTextSmall>
          <div class="truncate font-semibold">
            {{ item.number || "-" }}
          </div>
        </div>

        <div>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("admin.accounts.columns.balance", "Balance") }}
          </UiTextSmall>
          <div class="truncate">{{ formatMoney(item.balance, item.currency) }}</div>
        </div>

        <div>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("admin.accounts.columns.type", "Type") }}
          </UiTextSmall>
          <div class="truncate">{{ item.type_name || item.type_id || "-" }}</div>
        </div>

        <div>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("admin.accounts.columns.leverage", "Leverage") }}
          </UiTextSmall>
          <div class="truncate">{{ item.leverage_display || item.leverage_id || "-" }}</div>
        </div>

        <div>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("admin.accounts.components.accounts-panel.columns.created_at") }}
          </UiTextSmall>
          <div class="account-card__meta">{{ formatDate(item.created_at) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  interface AdminAccountCardItem {
    id: string;
    owner_name?: string;
    owner_email?: string;
    owner_photo_path?: string;
    user_id?: string;
    number?: string;
    balance?: number;
    currency?: string;
    type_name?: string;
    type_id?: string;
    leverage_display?: string;
    leverage_id?: string;
    created_at?: string;
  }

  const emit = defineEmits<{
    (e: "click", account: AdminAccountCardItem): void;
    (e: "edit", account: AdminAccountCardItem): void;
    (e: "refresh", account: AdminAccountCardItem): void;
    (e: "delete", account: AdminAccountCardItem): void;
  }>();

  const props = withDefaults(
    defineProps<{
      data: AdminAccountCardItem[];
      viewMode: string;
      canEdit?: boolean;
      canRefresh?: boolean;
      canDelete?: boolean;
    }>(),
    {
      data: () => [],
      viewMode: "cards",
      canEdit: false,
      canRefresh: false,
      canDelete: false,
    }
  );

  const { t, locale } = useI18n({ useScope: "global" });
  const activeMenuId = ref<string | null>(null);
  const showActionMenu = computed(() => props.canEdit || props.canRefresh || props.canDelete);

  const handleOpenAccountPage = (account: AdminAccountCardItem) => emit("click", account);

  const toggleMenu = (id: string) => {
    activeMenuId.value = activeMenuId.value === id ? null : id;
  };

  const emitEdit = (account: AdminAccountCardItem) => {
    activeMenuId.value = null;
    emit("edit", account);
  };

  const emitRefresh = (account: AdminAccountCardItem) => {
    activeMenuId.value = null;
    emit("refresh", account);
  };

  const emitDelete = (account: AdminAccountCardItem) => {
    activeMenuId.value = null;
    emit("delete", account);
  };

  const handleDocumentClick = () => {
    activeMenuId.value = null;
  };

  const getTwoCharsByFullName = (fullName?: string): string => {
    const segments = String(fullName ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const first = segments[0]?.charAt(0) ?? "";
    const second = segments[1]?.charAt(0) ?? "";
    return `${first}${second}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toLocaleString(locale.value || undefined);
  };

  const formatMoney = (balance?: number, currency?: string) => {
    const value = Number(balance ?? 0);
    const code = String(currency || "USD");

    try {
      return new Intl.NumberFormat(locale.value || undefined, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${code} ${value.toFixed(2)}`;
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleDocumentClick);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", handleDocumentClick);
  });
</script>

<style scoped lang="scss">
  .accounts-panel__content {
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
    .accounts-panel__content.cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1280px) {
    .accounts-panel__content.cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .account-card {
    position: relative;
    background: var(--ui-background-panel);
    border-bottom: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    padding: 10px 14px;
    transition:
      background-color 0.2s ease,
      opacity 0.2s ease;
  }

  .account-card--full {
    padding: 6px 48px 6px 14px;
  }

  .account-card:hover {
    opacity: 0.9;
  }

  .account-card__actions-wrap {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 3;
  }

  .account-card__menu-toggle {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--color-stroke-ui-dark);
    color: var(--ui-text-main);
  }

  .account-card__menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 180px;
    padding: 6px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  }

  .account-card__menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--ui-text-main);
    text-align: left;
    font-size: 13px;
  }

  .account-card__menu-item:hover {
    background: var(--color-stroke-ui-dark);
  }

  .account-card__menu-item.danger {
    color: var(--ui-sticker-danger);
  }

  .account-card__body {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    color: var(--ui-text-main);
  }

  .account-card__body > div {
    flex: 1 1 140px;
    min-width: 140px;
  }

  .account-card__body--row {
    flex-wrap: nowrap;
    gap: 4px 10px;
    align-items: center;
  }

  .account-card__owner {
    min-width: 180px;
  }

  .account-card__owner-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .account-card__owner-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .account-card__owner-meta {
    margin-top: 2px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--ui-text-secondary);
  }

  .account-card__copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-secondary);
  }
</style>
