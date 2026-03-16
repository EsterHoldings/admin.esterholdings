<template>
  <div class="admin-dashboard">
    <div class="admin-dashboard__header">
      <div class="admin-dashboard__header-row">
        <UiTextH4 class="admin-dashboard__title text-[var(--ui-text-main)]">{{ t("admin.dashboard.title") }}</UiTextH4>
      </div>
      <UiTextParagraph class="text-[var(--ui-text-secondary)]">{{ t("admin.dashboard.subtitle") }}</UiTextParagraph>
    </div>

    <div class="admin-dashboard__grid admin-dashboard__grid--priority">
      <button
        v-for="card in priorityCards"
        :key="card.id"
        type="button"
        class="stat-card-link"
        @click="handleNavigate(card.to)"
      >
        <PanelDefault class="stat-card stat-card--priority">
          <div class="flex items-center justify-between">
            <div>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ card.label }}</UiTextSmall>
              <UiTextH5 class="text-[var(--ui-text-main)]">{{ card.value }}</UiTextH5>
            </div>
            <div class="rounded-full bg-[var(--ui-primary-main)]/20 p-2 text-[var(--ui-primary-accent)]">
              <component :is="card.icon" class="!h-5 !w-5" />
            </div>
          </div>
        </PanelDefault>
      </button>
    </div>

    <div class="admin-dashboard__grid">
      <button
        v-for="card in statCards"
        :key="card.id"
        type="button"
        class="stat-card-link"
        @click="handleNavigate(card.to)"
      >
        <PanelDefault class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ card.label }}</UiTextSmall>
              <UiTextH5 class="text-[var(--ui-text-main)]">{{ card.value }}</UiTextH5>
            </div>
            <div class="rounded-full bg-[var(--color-stroke-ui-dark)] p-2 text-[var(--ui-text-main)]">
              <component :is="card.icon" class="!h-5 !w-5" />
            </div>
          </div>
          <UiTextSmall class="mt-2 text-[var(--ui-text-secondary)]">{{ card.delta }}</UiTextSmall>
        </PanelDefault>
      </button>
    </div>

    <div class="admin-dashboard__panels">
      <PanelDefault class="dashboard-panel-card min-w-0">
        <div class="flex flex-col gap-3 p-4">
          <UiTextH5 class="text-[var(--ui-text-main)]">{{ t("admin.dashboard.recentUsers") }}</UiTextH5>
          <div class="space-y-2">
            <div
              v-for="user in recentUsers"
              :key="user.id"
              class="dashboard-row-link flex items-center justify-between rounded-xl bg-[var(--color-stroke-ui-dark)] px-3 py-2"
              @click="handleNavigate(user.to)"
            >
              <div>
                <UiTextSmall class="text-[var(--ui-text-main)]">{{ user.name }}</UiTextSmall>
                <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ user.email }}</UiTextSmall>
              </div>
              <UiBadge :state="user.status === 'active' ? 'success' : 'warning'" outline class="!px-3">
                {{ user.status }}
              </UiBadge>
            </div>
          </div>
        </div>
      </PanelDefault>

      <PanelDefault class="dashboard-panel-card min-w-0">
        <div class="flex flex-col gap-3 p-4">
          <UiTextH5 class="text-[var(--ui-text-main)]">{{ t("admin.dashboard.recentPayments") }}</UiTextH5>
          <div class="space-y-2">
            <div
              v-for="payment in recentPayments"
              :key="payment.id"
              class="dashboard-row-link flex items-center justify-between rounded-xl bg-[var(--color-stroke-ui-dark)] px-3 py-2"
              @click="handleNavigate(payment.to)"
            >
              <div>
                <UiTextSmall class="text-[var(--ui-text-main)]">
                  {{ payment.amount }} {{ payment.currency }}
                </UiTextSmall>
                <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ payment.account }}</UiTextSmall>
              </div>
              <UiBadge :state="payment.status === 'success' ? 'success' : 'warning'" outline class="!px-3">
                {{ payment.status }}
              </UiBadge>
            </div>
          </div>
        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { navigateTo } from "nuxt/app";
import { definePageMeta } from "~/.nuxt/imports";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconUsers from "~/components/ui/UiIconClients.vue";
import UiIconPayment from "~/components/ui/UiIconPayment.vue";
import UiIconWithdraw from "~/components/ui/UiIconWithdraw.vue";
import UiIconSetting from "~/components/ui/UiIconSetting.vue";
import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { canAccessAdminPath } from "~/constants/adminPagePermissions";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t } = useI18n({ useScope: "global" });
const adminAuthStore = useAdminAuthStore();

const canAccessPath = (path: string) =>
  canAccessAdminPath(path, {
    hasPermission: permission => adminAuthStore.hasPermission(permission),
    hasRole: role => adminAuthStore.hasRole(role),
  });

const priorityCards = computed(() => [
  {
    id: "processing_transactions",
    label: t("admin.dashboard.processingTransactions", "Transactions in processing"),
    value: 14,
    icon: UiIconPayment,
    to: "/payments",
  },
  {
    id: "processing_requisites",
    label: t("admin.dashboard.processingRequisites", "Requisites in processing"),
    value: 6,
    icon: UiIconSetting,
    to: "/payments",
  },
  {
    id: "processing_verifications",
    label: t("admin.dashboard.processingVerifications", "Verifications in processing"),
    value: 9,
    icon: UiIconWarningFull,
    to: "/verifications",
  },
].filter(card => canAccessPath(card.to)));

const statCards = computed(() => [
  {
    id: "users",
    label: t("admin.dashboard.users"),
    value: "12,340",
    delta: "+3.2% vs prev week",
    icon: UiIconUsers,
    to: "/clients",
  },
  {
    id: "deposits",
    label: t("admin.dashboard.deposits"),
    value: "$182,500",
    delta: "+1.8% vs prev week",
    icon: UiIconPayment,
    to: "/payments",
  },
  {
    id: "withdrawals",
    label: t("admin.dashboard.withdrawals"),
    value: "$96,200",
    delta: "-0.7% vs prev week",
    icon: UiIconWithdraw,
    to: "/payments",
  },
].filter(card => canAccessPath(card.to)));

const recentUsers = computed(() => [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", status: "active", to: "/clients/1" },
  { id: 2, name: "Mark Lee", email: "mark@example.com", status: "pending", to: "/clients/2" },
  { id: 3, name: "Sara Kim", email: "sara@example.com", status: "active", to: "/clients/3" },
].filter(user => canAccessPath(user.to)));

const recentPayments = computed(() => [
  { id: 1, amount: "$1,250", currency: "USD", status: "success", account: "MT4-123456", to: "/payments" },
  { id: 2, amount: "$980", currency: "USD", status: "pending", account: "MT4-234567", to: "/payments" },
  { id: 3, amount: "$2,400", currency: "USD", status: "success", account: "MT4-345678", to: "/payments" },
].filter(payment => canAccessPath(payment.to)));

const handleNavigate = (to?: string) => {
  if (!to) return;
  navigateTo(to);
};
</script>

<style lang="scss" scoped>
.admin-dashboard {
  padding: 20px;
  color: var(--ui-text-main);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-dashboard__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: 8px;
}

.admin-dashboard__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-dashboard__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.admin-dashboard__grid--priority {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.admin-dashboard__panels {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.stat-card {
  padding: 14px;
  border: none !important;
  background:
    linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 10%, transparent) 0%, transparent 70.44%),
    var(--ui-background-card) !important;
}

.stat-card--priority {
  background:
    linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-accent) 18%, transparent) 0%, transparent 70.44%),
    var(--ui-background-card) !important;
}

.stat-card-link {
  border: none;
  padding: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.stat-card-link :deep(.stat-card) {
  transition:
    background-color 0.2s ease,
    transform 0.1s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
}

.stat-card-link:hover :deep(.stat-card) {
  opacity: 0.95;
}

.stat-card-link:focus-visible {
  outline: 2px solid var(--ui-primary-accent);
  border-radius: 12px;
}

.dashboard-row-link {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dashboard-row-link:hover {
  background: var(--color-stroke-ui-light);
}

.dashboard-panel-card {
  border: none !important;
  background:
    linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 10%, transparent) 0%, transparent 70.44%),
    var(--ui-background-card) !important;
}
</style>
