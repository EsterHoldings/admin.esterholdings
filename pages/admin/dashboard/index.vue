<template>
  <div class="admin-dashboard">
    <div class="admin-dashboard__header">
      <div>
        <UiTextH4 class="text-[var(--ui-text-main)]">{{ t("admin.dashboard.title") }}</UiTextH4>
        <UiTextParagraph class="text-[var(--ui-text-secondary)]">{{ t("admin.dashboard.subtitle") }}</UiTextParagraph>
      </div>
    </div>

    <div class="admin-dashboard__grid admin-dashboard__grid--priority">
      <PanelDefault v-for="card in priorityCards" :key="card.id" class="stat-card stat-card--priority">
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
    </div>

    <div class="admin-dashboard__grid">
      <PanelDefault v-for="card in statCards" :key="card.id" class="stat-card">
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
    </div>

    <div class="admin-dashboard__panels">
      <PanelDefault class="min-w-0">
        <div class="flex flex-col gap-3 p-4">
          <UiTextH5 class="text-[var(--ui-text-main)]">{{ t("admin.dashboard.recentUsers") }}</UiTextH5>
          <div class="space-y-2">
            <div
              v-for="user in recentUsers"
              :key="user.id"
              class="flex items-center justify-between rounded-xl bg-[var(--color-stroke-ui-dark)] px-3 py-2"
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

      <PanelDefault class="min-w-0">
        <div class="flex flex-col gap-3 p-4">
          <UiTextH5 class="text-[var(--ui-text-main)]">{{ t("admin.dashboard.recentPayments") }}</UiTextH5>
          <div class="space-y-2">
            <div
              v-for="payment in recentPayments"
              :key="payment.id"
              class="flex items-center justify-between rounded-xl bg-[var(--color-stroke-ui-dark)] px-3 py-2"
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

const { t } = useI18n({ useScope: "global" });

const priorityCards = computed(() => [
  {
    id: "processing_transactions",
    label: t("admin.dashboard.processingTransactions", "Transactions in processing"),
    value: 14,
    icon: UiIconPayment,
  },
  {
    id: "processing_requisites",
    label: t("admin.dashboard.processingRequisites", "Requisites in processing"),
    value: 6,
    icon: UiIconSetting,
  },
  {
    id: "processing_verifications",
    label: t("admin.dashboard.processingVerifications", "Verifications in processing"),
    value: 9,
    icon: UiIconWarningFull,
  },
]);

const statCards = computed(() => [
  {
    id: "users",
    label: t("admin.dashboard.users"),
    value: "12,340",
    delta: "+3.2% vs prev week",
    icon: UiIconUsers,
  },
  {
    id: "deposits",
    label: t("admin.dashboard.deposits"),
    value: "$182,500",
    delta: "+1.8% vs prev week",
    icon: UiIconPayment,
  },
  {
    id: "withdrawals",
    label: t("admin.dashboard.withdrawals"),
    value: "$96,200",
    delta: "-0.7% vs prev week",
    icon: UiIconWithdraw,
  },
]);

const recentUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", status: "active" },
  { id: 2, name: "Mark Lee", email: "mark@example.com", status: "pending" },
  { id: 3, name: "Sara Kim", email: "sara@example.com", status: "active" },
];

const recentPayments = [
  { id: 1, amount: "$1,250", currency: "USD", status: "success", account: "MT4-123456" },
  { id: 2, amount: "$980", currency: "USD", status: "pending", account: "MT4-234567" },
  { id: 3, amount: "$2,400", currency: "USD", status: "success", account: "MT4-345678" },
];
</script>

<style lang="scss" scoped>
.admin-dashboard {
  padding: 20px;
  color: var(--ui-text-main);
  display: flex;
  flex-direction: column;
  gap: 16px;
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
}

.stat-card--priority {
  border: 1px solid var(--ui-primary-accent);
  background: color-mix(in srgb, var(--ui-primary-main) 12%, var(--ui-background-panel));
}
</style>
