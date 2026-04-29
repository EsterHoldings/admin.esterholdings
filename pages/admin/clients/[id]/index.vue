<template>
  <div class="client-detail">
    <div class="client-detail__header">
      <div class="client-detail__identity">
        <div class="client-detail__avatar">
          <img
            v-if="userData.photo_url"
            :src="userData.photo_url"
            :alt="clientName" />
          <span v-else>{{ clientInitials }}</span>
        </div>

        <div class="client-detail__heading">
          <h1 class="client-detail__title">{{ clientName }}</h1>
          <p class="client-detail__subtitle">{{ userData.email || "-" }}</p>
        </div>
      </div>

      <div class="client-detail__status">
        <span
          class="client-detail__status-dot"
          :class="userData.is_blocked ? 'is-danger' : 'is-success'" />
        <span>
          {{
            userData.is_blocked
              ? resolveText("admin.clients.status.blocked", "Blocked")
              : resolveText("admin.clients.status.active", "Active")
          }}
        </span>
      </div>
    </div>

    <PrimeCard class="client-detail-card">
      <template #content>
        <div class="client-detail__layout">
          <aside class="client-detail__nav">
            <PrimeButton
              v-for="(tab, index) in tabsList"
              :key="tab.id"
              type="button"
              class="client-detail__nav-button"
              :class="{ 'is-active': activeTabIndex === index }"
              :icon="tab.icon"
              :label="tab.label"
              text
              @click="handleActiveTab(index)" />
          </aside>

          <main class="client-detail__content">
            <div class="client-detail__content-header">
              <div>
                <h2>{{ tabsList[activeTabIndex]?.label }}</h2>
                <p>{{ tabsList[activeTabIndex]?.description }}</p>
              </div>
            </div>

            <Transition
              enter-active-class="transition ease-out duration-150"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-100"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
              mode="out-in">
              <component
                :is="tabsList[activeTabIndex]?.component"
                :key="activeTabIndex"
                :clientId="clientId"
                :userData="userData"
                @refresh-client="loadData" />
            </Transition>
          </main>
        </div>
      </template>
    </PrimeCard>
  </div>
</template>

<script setup lang="ts">
  import useAppCore from "~/composables/useAppCore";
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import { definePageMeta } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useRoute } from "vue-router";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

  import TabAccounts from "~/pages/admin/clients/[id]/components/TabAccounts.vue";
  import TabEmails from "~/pages/admin/clients/[id]/components/TabEmails.vue";
  import TabKYC from "~/pages/admin/clients/[id]/components/TabKYC.vue";
  import TabMetrics from "~/pages/admin/clients/[id]/components/TabMetrics.vue";
  import TabPaymentDetails from "~/pages/admin/clients/[id]/components/TabPaymentDetails.vue";
  import TabReferrals from "~/pages/admin/clients/[id]/components/TabReferrals.vue";
  import TabSecurity from "~/pages/admin/clients/[id]/components/TabSecurity.vue";
  import TabSettings from "~/pages/admin/clients/[id]/components/TabSettings.vue";
  import TabVerification from "~/pages/admin/clients/[id]/components/TabVerification.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { t } = useI18n({ useScope: "global" });
  const route = useRoute();
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();

  const clientId = ref(route.params.id as string);

  let userData = reactive({
    address: null,
    birthdate: null,
    city: null,
    country: null,
    created_at: null,
    email: null,
    email_verified_at: null,
    first_name: null,
    id: null,
    last_name: null,
    mid_name: null,
    phone: null,
    photo_path: null,
    photo_url: null,
    postal_code: null,
    state: null,
    support_mode: "simple",
    two_factor_enabled: false,
    is_blocked: false,
    blocked_at: null,
    updated_at: null,
  });

  const loadData = async () => {
    const resp = await appCore.adminModules.clients.getById(clientId.value);
    Object.assign(userData, resp.data.data);
  };

  const STORAGE_KEY = "adminClientDetailActiveTab";
  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const canViewClientVerification = computed(
    () =>
      adminAuthStore.hasRole("super-admin") ||
      adminAuthStore.hasPermission("view-verifications") ||
      adminAuthStore.hasPermission("update-verifications") ||
      adminAuthStore.hasPermission("view-client-payment-details") ||
      adminAuthStore.hasPermission("update-client-payment-details") ||
      adminAuthStore.hasPermission("delete-client-payment-details")
  );
  const canViewClientAccounts = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-accounts")
  );
  const canViewClientPaymentDetails = computed(
    () =>
      adminAuthStore.hasRole("super-admin") ||
      adminAuthStore.hasPermission("view-client-payment-details") ||
      adminAuthStore.hasPermission("update-client-payment-details") ||
      adminAuthStore.hasPermission("delete-client-payment-details")
  );
  const canViewClientReferrals = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-referrals")
  );
  const canManageClientSettings = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-client-support-mode")
  );
  const canManageClientSecurity = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-clients")
  );

  const clientName = computed(() => {
    const name = [userData.first_name, userData.last_name, userData.mid_name]
      .map(value => String(value ?? "").trim())
      .filter(Boolean)
      .join(" ");

    return name || userData.email || resolveText("admin.clients.detail.unknownClient", "Unknown client");
  });

  const clientInitials = computed(() => {
    const parts = clientName.value.split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map(part => part[0]).join("");

    return initials.toUpperCase() || "CL";
  });

  const tabsList = computed(() => [
    {
      id: "kyc",
      label: resolveText("admin.clients.tabs.kyc", "KYC"),
      description: resolveText("admin.clients.tabsDescription.kyc", "Client identity, access and visit history."),
      icon: "pi pi-id-card",
      component: TabKYC,
    },
    {
      id: "metrics",
      label: resolveText("admin.clients.tabs.metrics", "Metrics"),
      description: resolveText("admin.clients.tabsDescription.metrics", "Online activity, sessions and device analytics."),
      icon: "pi pi-chart-line",
      component: TabMetrics,
    },
    ...(canViewClientVerification.value
      ? [{
          id: "verification",
          label: resolveText("admin.clients.tabs.verification", "Verification"),
          description: resolveText("admin.clients.tabsDescription.verification", "Moderation timeline for profile, documents and payment details."),
          icon: "pi pi-verified",
          component: TabVerification,
        }]
      : []),
    ...(canViewClientAccounts.value
      ? [{
          id: "accounts",
          label: resolveText("admin.clients.tabs.accounts", "Accounts"),
          description: resolveText("admin.clients.tabsDescription.accounts", "MT accounts owned by this client."),
          icon: "pi pi-wallet",
          component: TabAccounts,
        }]
      : []),
    ...(canViewClientPaymentDetails.value
      ? [{
          id: "payment-details",
          label: resolveText("admin.clients.tabs.paymentDetails", "Payment details"),
          description: resolveText("admin.clients.tabsDescription.paymentDetails", "Withdrawal requisites and their moderation state."),
          icon: "pi pi-credit-card",
          component: TabPaymentDetails,
        }]
      : []),
    {
      id: "emails",
      label: resolveText("admin.clients.tabs.emails", "Emails"),
      description: resolveText("admin.clients.tabsDescription.emails", "Transactional email history sent to this client."),
      icon: "pi pi-envelope",
      component: TabEmails,
    },
    ...(canViewClientReferrals.value
      ? [{
          id: "referrals",
          label: resolveText("admin.clients.tabs.referrals", "Referrals"),
          description: resolveText("admin.clients.tabsDescription.referrals", "Referral network and rewards for this client."),
          icon: "pi pi-share-alt",
          component: TabReferrals,
        }]
      : []),
    ...(canManageClientSettings.value
      ? [{
          id: "settings",
          label: resolveText("admin.clients.tabs.settings", "Settings"),
          description: resolveText("admin.clients.tabsDescription.settings", "Client support and cabinet configuration."),
          icon: "pi pi-cog",
          component: TabSettings,
        }]
      : []),
    ...(canManageClientSecurity.value
      ? [{
          id: "security",
          label: resolveText("admin.clients.tabs.security", "Security"),
          description: resolveText("admin.clients.tabsDescription.security", "Password and two-factor authentication controls."),
          icon: "pi pi-shield",
          component: TabSecurity,
        }]
      : []),
  ]);

  const activeTabIndex = ref(0);

  // При монтуванні – читаємо ?tab і записуємо в activeTabIndex
  onMounted(async () => {
    await loadData();

    const q = Number(route.query.tab);
    if (!isNaN(q) && q >= 0 && q < tabsList.value.length) {
      activeTabIndex.value = q;
    } else {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      if (!isNaN(saved) && saved >= 0 && saved < tabsList.value.length) {
        activeTabIndex.value = saved;
      }
    }

    // Ініціально в URL зробимо ?tab=…
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTabIndex.value.toString());
    window.history.replaceState(null, "", url.toString());
  });

  watch(activeTabIndex, newIndex => {
    localStorage.setItem(STORAGE_KEY, newIndex.toString());

    const url = new URL(window.location.href);
    url.searchParams.set("tab", newIndex.toString());
    window.history.replaceState(null, "", url.toString());
  });

  watch(
    () => route.query.tab,
    nextTab => {
      const q = Number(nextTab);
      if (!isNaN(q) && q >= 0 && q < tabsList.value.length && q !== activeTabIndex.value) {
        activeTabIndex.value = q;
      }
    }
  );

  const handleActiveTab = (i: number) => {
    activeTabIndex.value = i;
  };
</script>

<style lang="scss" scoped>
  .client-detail {
    --client-glass-bg: color-mix(in srgb, var(--ui-background-card) 74%, transparent);
    --client-glass-bg-strong: color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
    --client-glass-border: color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
    --client-glass-shadow: 0 18px 56px color-mix(in srgb, #000000 20%, transparent);

    width: 100%;
    max-width: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(12px, 1.35vw, 22px);
    color: var(--ui-text-main);
    animation: client-detail-enter 0.32s ease both;
  }

  .client-detail__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .client-detail__identity {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .client-detail__avatar {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 17px;
    color: var(--ui-text-invert);
    background: linear-gradient(
      135deg,
      var(--ui-primary-main),
      color-mix(in srgb, var(--ui-primary-main) 45%, var(--ui-primary-accent))
    );
    font-size: 14px;
    font-weight: 880;
    letter-spacing: 0.04em;
    box-shadow: 0 12px 30px color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
  }

  .client-detail__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .client-detail__heading {
    min-width: 0;
  }

  .client-detail__title {
    margin: 0;
    color: var(--ui-text-main);
    font-size: clamp(24px, 2.1vw, 36px);
    font-weight: 850;
    line-height: 1.02;
    letter-spacing: -0.035em;
  }

  .client-detail__subtitle {
    margin: 6px 0 0;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  .client-detail__status {
    --status-color: var(--color-success);

    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--status-color);
    font-size: 12px;
    font-weight: 780;
    white-space: nowrap;
  }

  .client-detail__status-dot {
    width: 8px;
    height: 8px;
    flex: 0 0 8px;
    border-radius: 999px;
    background: var(--status-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-color) 15%, transparent);
  }

  .client-detail__status-dot.is-danger {
    --status-color: var(--color-danger);
  }

  .client-detail-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid var(--client-glass-border);
    border-radius: 22px;
    background:
      radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--ui-primary-main) 10%, transparent), transparent 38%),
      linear-gradient(145deg, var(--client-glass-bg), var(--client-glass-bg-strong));
    box-shadow: var(--client-glass-shadow);
    backdrop-filter: blur(22px) saturate(135%);
    -webkit-backdrop-filter: blur(22px) saturate(135%);
  }

  .client-detail-card :deep(.p-card-body),
  .client-detail-card :deep(.p-card-content) {
    padding: 0;
  }

  .client-detail-card::after {
    content: "";
    position: absolute;
    inset: -30% auto -30% -52%;
    z-index: 0;
    width: 46%;
    pointer-events: none;
    background: linear-gradient(110deg, transparent, color-mix(in srgb, #ffffff 13%, transparent), transparent);
    opacity: 0;
    transform: rotate(12deg) translateX(-35%);
  }

  .client-detail-card:hover::after {
    animation: client-detail-glint 1.1s ease both;
  }

  .client-detail__layout {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    min-height: 620px;
  }

  .client-detail__nav {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 10px;
    border-right: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
  }

  .client-detail__nav-button {
    justify-content: flex-start;
    min-height: 42px;
    border-radius: 14px;
    color: var(--ui-text-secondary);
    background: transparent;
    transition:
      color 0.18s ease,
      background-color 0.18s ease,
      transform 0.18s ease;
  }

  .client-detail__nav-button:hover,
  .client-detail__nav-button.is-active {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 11%, transparent);
    transform: translateX(2px);
  }

  .client-detail__nav-button.is-active {
    box-shadow: inset 2px 0 0 var(--ui-primary-main);
  }

  .client-detail__content {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .client-detail__content-header {
    min-height: 74px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
  }

  .client-detail__content-header h2 {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 18px;
    font-weight: 840;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .client-detail__content-header p {
    max-width: 820px;
    margin: 5px 0 0;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.45;
  }

  .client-detail__content > :deep(*) {
    min-width: 0;
  }

  .client-detail__content :deep(.client-tab-space) {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
  }

  .client-detail__content :deep(.client-tab-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
    gap: 14px;
  }

  .client-detail__content :deep(.client-tab-card) {
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light));
    border-radius: 20px;
    background:
      radial-gradient(circle at 14% 0%, color-mix(in srgb, var(--ui-primary-main) 8%, transparent), transparent 36%),
      color-mix(in srgb, var(--ui-background-panel) 84%, transparent);
    box-shadow: 0 14px 34px color-mix(in srgb, #000000 10%, transparent);
    backdrop-filter: blur(18px) saturate(130%);
    -webkit-backdrop-filter: blur(18px) saturate(130%);
  }

  .client-detail__content :deep(.client-tab-card .p-card-body),
  .client-detail__content :deep(.client-tab-card .p-card-content) {
    padding: 0;
  }

  .client-detail__content :deep(.client-card-body) {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
  }

  .client-detail__content :deep(.client-card-header) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .client-detail__content :deep(.client-card-title) {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 16px;
    font-weight: 840;
    line-height: 1.2;
    letter-spacing: -0.015em;
  }

  .client-detail__content :deep(.client-card-subtitle) {
    margin: 4px 0 0;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.45;
  }

  .client-detail__content :deep(.client-inline-status) {
    --status-color: var(--ui-text-secondary);

    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--status-color);
    font-size: 12px;
    font-weight: 760;
    white-space: nowrap;
  }

  .client-detail__content :deep(.client-inline-status::before) {
    content: "";
    width: 8px;
    height: 8px;
    flex: 0 0 8px;
    border-radius: 999px;
    background: var(--status-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-color) 15%, transparent);
  }

  .client-detail__content :deep(.client-inline-status--success) {
    --status-color: var(--color-success);
  }

  .client-detail__content :deep(.client-inline-status--warning) {
    --status-color: var(--color-ui-warning);
  }

  .client-detail__content :deep(.client-inline-status--danger) {
    --status-color: var(--color-danger);
  }

  .client-detail__content :deep(.client-data-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
  }

  .client-detail__content :deep(.client-data-item) {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 4px;
    border-radius: 14px;
    padding: 11px 12px;
    background: color-mix(in srgb, var(--ui-background-card) 58%, transparent);
  }

  .client-detail__content :deep(.client-data-item__label) {
    color: var(--ui-text-secondary);
    font-size: 11px;
    font-weight: 720;
    letter-spacing: 0.01em;
  }

  .client-detail__content :deep(.client-data-item__value) {
    min-width: 0;
    color: var(--ui-text-main);
    font-size: 13px;
    font-weight: 760;
    word-break: break-word;
  }

  .client-detail__content :deep(.client-muted) {
    color: var(--ui-text-secondary);
  }

  .client-detail__content > :deep(.v-enter-active),
  .client-detail__content > :deep(.v-leave-active) {
    transition: opacity 0.16s ease, transform 0.16s ease;
  }

  .client-detail__content > :deep(.v-enter-from),
  .client-detail__content > :deep(.v-leave-to) {
    opacity: 0;
    transform: translateY(6px);
  }

  @keyframes client-detail-enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes client-detail-glint {
    0% {
      opacity: 0;
      transform: rotate(12deg) translateX(-45%);
    }
    35% {
      opacity: 0.8;
    }
    100% {
      opacity: 0;
      transform: rotate(12deg) translateX(330%);
    }
  }

  @media (max-width: 980px) {
    .client-detail__layout {
      grid-template-columns: 1fr;
    }

    .client-detail__nav {
      flex-direction: row;
      overflow-x: auto;
      border-right: 0;
      border-bottom: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
    }

    .client-detail__nav-button {
      flex: 0 0 auto;
    }

    .client-detail__nav-button:hover,
    .client-detail__nav-button.is-active {
      transform: translateY(-1px);
    }

    .client-detail__nav-button.is-active {
      box-shadow: inset 0 -2px 0 var(--ui-primary-main);
    }
  }

  @media (max-width: 640px) {
    .client-detail {
      padding: 12px;
    }

    .client-detail__header {
      align-items: flex-start;
      flex-direction: column;
    }

    .client-detail__content-header {
      min-height: auto;
      padding: 12px;
    }
  }
</style>
