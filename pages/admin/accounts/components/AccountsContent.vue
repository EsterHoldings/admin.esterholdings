<template>
  <div
    class="accounts-cards"
    :class="viewModeClass">
    <PrimeMenu
      ref="actionMenu"
      :model="actionMenuItems"
      popup />

    <PrimeCard
      v-for="item in props.data"
      :key="item.id"
      class="account-card"
      :class="{ 'account-card--full': props.viewMode === 'full' }"
      @click="handleOpenAccountPage(item)">
      <template #content>
        <div class="account-card__content">
          <div class="account-card__owner">
            <button
              v-if="item.id"
              type="button"
              class="account-card__copy"
              :aria-label="text('admin.accounts.actions.copyId', 'Copy ID')"
              @click.stop>
              <UiIconCopy :text="item.id" />
            </button>

            <div class="account-card__avatar">
              <UiImageCircle
                :twoChars="getTwoCharsByFullName(item.owner_name)"
                :src="item.owner_photo_path" />
            </div>

            <div class="account-card__owner-text">
              <strong>{{ item.owner_name || "-" }}</strong>
              <span>{{ item.owner_email || "-" }}</span>
            </div>
          </div>

          <div class="account-card__data">
            <div class="account-data-item account-data-item--number">
              <span>{{ text("admin.accounts.columns.number", "Account number") }}</span>
              <strong>{{ item.number || "-" }}</strong>
            </div>

            <div class="account-data-item">
              <span>{{ text("admin.accounts.columns.balance", "Balance") }}</span>
              <strong class="account-card__value-row">
                {{ formatMoney(item.balance, item.currency) }}
                <PrimeButton
                  v-if="canRefresh"
                  rounded
                  text
                  size="small"
                  icon="pi pi-refresh"
                  class="account-card__refresh"
                  :loading="refreshingAccountId === item.id"
                  :disabled="refreshingAccountId === item.id"
                  :aria-label="text('admin.accounts.actions.refreshBalance', 'Refresh balance')"
                  @click.stop="emitRefresh(item)" />
              </strong>
            </div>

            <div class="account-data-item">
              <span>{{ text("admin.accounts.columns.type", "Type") }}</span>
              <strong>{{ item.type_name || item.type_id || "-" }}</strong>
            </div>

            <div class="account-data-item">
              <span>{{ text("admin.accounts.columns.leverage", "Leverage") }}</span>
              <strong>{{ item.leverage_display || item.leverage_id || "-" }}</strong>
            </div>

            <div class="account-data-item">
              <span>{{ text("admin.accounts.components.accounts-panel.columns.created_at", "Created at") }}</span>
              <strong>{{ formatDate(item.created_at) }}</strong>
            </div>
          </div>

          <PrimeButton
            v-if="showActionMenu"
            rounded
            text
            size="small"
            icon="pi pi-ellipsis-v"
            class="account-card__menu-toggle"
            :aria-label="text('admin.accounts.actions.openActions', 'Open actions')"
            @click.stop="toggleMenu($event, item)" />
        </div>
      </template>
    </PrimeCard>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";

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
      refreshingAccountId?: string | null;
    }>(),
    {
      data: () => [],
      viewMode: "cards",
      canEdit: false,
      canRefresh: false,
      canDelete: false,
      refreshingAccountId: null,
    }
  );

  const { t, locale } = useI18n({ useScope: "global" });
  const actionMenu = ref<any | null>(null);
  const activeAccount = ref<AdminAccountCardItem | null>(null);

  const text = (key: string, fallback: string): string => {
    const value = t(key);
    return value === key ? fallback : String(value);
  };

  const showActionMenu = computed(() => props.canEdit || props.canRefresh || props.canDelete);
  const viewModeClass = computed(() => (props.viewMode === "full" ? "accounts-cards--full" : "accounts-cards--grid"));

  const actionMenuItems = computed(() => {
    const account = activeAccount.value;
    if (!account) return [];

    return [
      props.canEdit
        ? {
            label: text("admin.accounts.actions.edit", "Edit"),
            icon: "pi pi-pencil",
            command: () => emit("edit", account),
          }
        : null,
      props.canRefresh
        ? {
            label: text("admin.accounts.actions.refreshBalance", "Refresh balance"),
            icon: "pi pi-refresh",
            command: () => emit("refresh", account),
          }
        : null,
      props.canDelete
        ? {
            label: text("admin.accounts.actions.archive", "Archive"),
            icon: "pi pi-archive",
            class: "account-action-danger",
            command: () => emit("delete", account),
          }
        : null,
    ].filter(Boolean);
  });

  const handleOpenAccountPage = (account: AdminAccountCardItem) => emit("click", account);

  const toggleMenu = (event: MouseEvent, account: AdminAccountCardItem) => {
    activeAccount.value = account;
    actionMenu.value?.toggle(event);
  };

  const emitRefresh = (account: AdminAccountCardItem) => {
    activeAccount.value = account;
    emit("refresh", account);
  };

  const getTwoCharsByFullName = (fullName?: string): string => {
    const segments = String(fullName ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return `${segments[0]?.charAt(0) ?? ""}${segments[1]?.charAt(0) ?? ""}`;
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
</script>

<style scoped lang="scss">
  .accounts-cards {
    display: grid;
    gap: 10px;
  }

  .accounts-cards--grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .accounts-cards--full {
    grid-template-columns: 1fr;
  }

  @media (min-width: 860px) {
    .accounts-cards--grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1440px) {
    .accounts-cards--grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .account-card {
    overflow: hidden;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 12px;
    background: var(--ui-background-panel);
    color: var(--ui-text-main);
    cursor: pointer;
    transition:
      border-color 0.18s ease,
      background-color 0.18s ease;
  }

  .account-card:hover {
    border-color: color-mix(in srgb, var(--ui-primary-main) 40%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-primary-main) 8%, var(--ui-background-panel));
  }

  .account-card :deep(.p-card-body),
  .account-card :deep(.p-card-content) {
    height: 100%;
    padding: 0;
  }

  .account-card__content {
    position: relative;
    display: grid;
    gap: 16px;
    min-height: 100%;
    padding: 14px;
  }

  .account-card--full .account-card__content {
    grid-template-columns: minmax(260px, 1.1fr) minmax(0, 2.4fr) auto;
    align-items: center;
  }

  .account-card__owner {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .account-card__copy {
    flex: 0 0 auto;
    color: var(--ui-text-secondary);
  }

  .account-card__avatar {
    width: 54px;
    height: 54px;
    flex: 0 0 auto;
  }

  .account-card__owner-text {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .account-card__owner-text strong,
  .account-card__owner-text span,
  .account-data-item strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-card__owner-text span,
  .account-data-item span {
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.25;
  }

  .account-card__owner-text strong,
  .account-data-item strong {
    color: var(--ui-text-main);
    font-size: 14px;
    font-weight: 800;
    line-height: 1.25;
  }

  .account-card__data {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
    min-width: 0;
  }

  .account-card--full .account-card__data {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .account-data-item {
    min-width: 0;
    display: grid;
    gap: 3px;
  }

  .account-card__value-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .account-card__refresh {
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    color: var(--ui-primary-main);
  }

  .account-card__menu-toggle {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    color: var(--ui-text-main);
  }

  .account-card--full .account-card__menu-toggle {
    position: static;
  }

  @media (max-width: 1100px) {
    .account-card--full .account-card__content {
      grid-template-columns: 1fr auto;
    }

    .account-card--full .account-card__data {
      grid-column: 1 / -1;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 620px) {
    .account-card__content,
    .account-card--full .account-card__content {
      grid-template-columns: 1fr;
      padding: 12px;
    }

    .account-card__data,
    .account-card--full .account-card__data {
      grid-template-columns: 1fr;
    }

    .account-card--full .account-card__menu-toggle,
    .account-card__menu-toggle {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }
</style>
