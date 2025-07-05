<template>
  <UiContainer>
    <div class="dashboard">
      <div class="dashboard__title">
        <UiTextH4>{{ t("cabinet.dashboard.title") }}</UiTextH4>
      </div>
      <div class="dashboard__grid">
        <!-- Account Verification -->
        <PanelDefault>
          <div class="card">
            <div class="card__header">
              <div>
                <div class="card__title">
                  {{ t("cabinet.dashboard.accountVerification.title") }}
                </div>
                <div class="card__subtitle">
                  {{ t("cabinet.dashboard.accountVerification.subtitle") }}
                </div>
              </div>

              <NuxtLink to="/profile">
                <UiButtonDefault state="primary">{{ t("cabinet.dashboard.accountVerification.profileButton") }}</UiButtonDefault>
              </NuxtLink>
            </div>
            <ul class="card__list">
              <li>
                <span></span>
                <UiIconFailed />
                <span>{{t("cabinet.dashboard.accountVerification.addressFailed") }}</span>
              </li>

              <li>
                <span>Документы</span>
                <UiIconSuccess />
                <span>{{t("cabinet.dashboard.accountVerification.documentVerified") }}</span>
              </li>

              <li>
                <span>1-й Депозит</span>
                <UiIconWarning />
                <span>{{t("cabinet.dashboard.accountVerification.paymentInProgress") }}</span>
              </li>

              <li>
                <span>Профиль</span>
                <UiIconWarning />
                <span>{{t("cabinet.dashboard.accountVerification.profileInProgress") }}</span>
              </li>
            </ul>
          </div>
        </PanelDefault>

        <!-- Deposit & Withdraw -->
        <PanelDefault>
          <div class="card">
            <div class="card__actions">
              <NuxtLink to="/payments/create">
                <UiButtonDefault state="success">{{t("cabinet.dashboard.actions.newDeposit")}}</UiButtonDefault>
              </NuxtLink>

              <NuxtLink to="/payments/create">
                <UiButtonDefault state="primary">{{t("cabinet.dashboard.actions.newWithdrawal") }}</UiButtonDefault>
              </NuxtLink>
            </div>

            <div class="chart-placeholder">
              {{ t("cabinet.dashboard.actions.chartPlaceholder") }}
            </div>
          </div>
        </PanelDefault>

        <!-- MT4 Accounts -->
        <PanelDefault>
          <div class="card card--wide">
            <div class="card__top">
              <div class="card__title">
                {{ t("cabinet.dashboard.mt4.title") }}
              </div>

              <div class="card__options">
                <NuxtLink to="/accounts">
                  <UiButtonDefault state="primary">{{t("cabinet.dashboard.mt4.openNewAccount") }}</UiButtonDefault>
                </NuxtLink>
              </div>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>{{ t("cabinet.dashboard.mt4.table.account") }}</th>
                  <th>{{ t("cabinet.dashboard.mt4.table.type") }}</th>
                  <th>{{ t("cabinet.dashboard.mt4.table.balance") }}</th>
                  <th>{{ t("cabinet.dashboard.mt4.table.status") }}</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>123456</td>
                  <td>Real</td>
                  <td>$5,000.00</td>
                  <td>
                    <span class="status status--active">{{t("cabinet.dashboard.mt4.table.active") }}</span>
                  </td>
                </tr>
                <tr>
                  <td>234567</td>
                  <td>Real</td>
                  <td>$5,000.00</td>
                  <td>
                    <span class="status status--active">{{t("cabinet.dashboard.mt4.table.active") }}</span>
                  </td>
                </tr>
                <tr>
                  <td>345678</td>
                  <td>Demo</td>
                  <td>$10,000.00</td>
                  <td>
                    <span class="status status--inactive">{{ t("cabinet.dashboard.mt4.table.inactive") }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </PanelDefault>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import { definePageMeta } from "~/.nuxt/imports";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

import { useI18n } from "vue-i18n";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
const { locale, t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped>
.dashboard {
  color: #ffffff;
  padding-bottom: 40px;

  &__title {
    margin-bottom: 24px;

    h4 {
      color: var(--ui-text-main);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
  }
}

.card {
  padding: 1.6rem;
  border-radius: 16px;

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &--wide {
    grid-column: span 2;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__icon {
    background: #ff9c27;
    padding: 8px;
    border-radius: 50%;
    margin-right: 16px;
    color: white;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--ui-text-main);
  }

  &__options {
  }

  &__subtitle {
    font-size: 14px;
    color: var(--ui-text-secondary);
  }

  &__list {
    list-style: none;
    padding-left: 0;
    margin-top: 12px;
    font-size: 14px;
    color: var(--ui-text-secondary);
    margin-bottom: 20px;

    li {
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      span {
        margin-left: 20px;
      }
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}

.chart-placeholder {
  height: 160px;
  background-color: var(--ui-background-sidebar-link);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: var(--ui-text-main);
  font-size: 14px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #ffffff;

  th {
    text-align: left;
    padding-bottom: 8px;
    color: var(--ui-text-secondary);
  }

  td {
    padding: 8px 0;
    border-top: 1px solid #2e335a;
    color: var(--ui-text-secondary);
  }
}

.status {
  &--active {
    color: #1cbf73;
    font-weight: 500;
  }

  &--inactive {
    color: #a3aed0;
    font-weight: 500;
  }
}
</style>
