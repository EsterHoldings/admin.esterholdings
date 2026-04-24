<template>
  <div class="admin-detail">
    <div class="admin-detail__header">
      <div class="admin-detail__hero">
        <div class="admin-detail__identity">
          <div class="admin-detail__avatar">
            <img
              v-if="profile?.photo_url"
              :src="profile.photo_url"
              :alt="profileDisplayName"
            />
            <span v-else>{{ profile?.initials || "AD" }}</span>
          </div>

          <div class="admin-detail__heading">
            <h1 class="admin-detail__title">{{ profileDisplayName }}</h1>
            <p class="admin-detail__subtitle">{{ profile?.email || "—" }}</p>

            <div
              v-if="roleNames.length > 0"
              class="admin-detail__roles"
            >
              <span
                v-for="roleName in roleNames"
                :key="roleName"
                class="admin-detail__role-pill"
              >
                {{ roleName }}
              </span>
            </div>
          </div>
        </div>

        <div class="admin-detail__header-side">
          <div
            class="admin-detail__status"
            :class="profile?.is_online ? 'is-online' : 'is-offline'"
          >
            <span class="admin-detail__status-dot" />
            <span>{{ presenceLabel }}</span>
          </div>

          <PrimeButton
            class="admin-detail__refresh"
            icon="pi pi-refresh"
            :label="resolveText('admin.profile.actions.refresh', 'Refresh')"
            outlined
            :loading="isLoading"
            @click="loadProfile"
          />
        </div>
      </div>

      <div class="admin-detail__summary-strip">
        <div class="admin-detail__summary-item">
          <span class="admin-detail__summary-label">
            {{ resolveText("admin.profile.summary.nickname", "Nickname") }}
          </span>
          <strong class="admin-detail__summary-value">{{ profile?.nickname || "—" }}</strong>
        </div>

        <div class="admin-detail__summary-item">
          <span class="admin-detail__summary-label">
            {{ resolveText("admin.profile.summary.twoFactor", "2FA") }}
          </span>
          <strong class="admin-detail__summary-value">
            {{
              profile?.two_factor_enabled
                ? resolveText("admin.profile.security.twoFactor.enabled", "Enabled")
                : resolveText("admin.profile.security.twoFactor.disabled", "Disabled")
            }}
          </strong>
        </div>

        <div class="admin-detail__summary-item">
          <span class="admin-detail__summary-label">
            {{ resolveText("admin.profile.summary.lastSeen", "Last seen") }}
          </span>
          <strong class="admin-detail__summary-value">{{ presenceMeta }}</strong>
        </div>
      </div>
    </div>

    <section class="admin-detail-card">
      <div class="admin-detail__layout">
        <aside class="admin-detail__nav">
          <PrimeButton
            v-for="tab in tabsList"
            :key="tab.id"
            type="button"
            class="admin-detail__nav-button"
            :class="{ 'is-active': activeTabKey === tab.id }"
            :icon="tab.icon"
            :label="tab.label"
            text
            @click="handleActiveTab(tab.id)"
          />
        </aside>

        <main class="admin-detail__content">
          <div class="admin-detail__content-header">
            <div>
              <h2>{{ activeTab?.label }}</h2>
              <p>{{ activeTab?.description }}</p>
            </div>
          </div>

          <Transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
            mode="out-in"
          >
            <component
              :is="activeTab?.component"
              :key="activeTab?.id || activeTabKey"
              :profileData="profile"
              :isLoading="isLoading"
              :profileScope="profileScope"
              @profile-updated="handleProfileUpdated"
              @profile-refresh="loadProfile"
            />
          </Transition>
        </main>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import { definePageMeta, useRoute } from "~/.nuxt/imports";

  import useAppCore from "~/composables/useAppCore";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import TabActivity from "~/pages/admin/profile/components/TabActivity.vue";
  import TabGeneral from "~/pages/admin/profile/components/TabGeneral.vue";
  import TabLogs from "~/pages/admin/profile/components/TabLogs.vue";
  import TabSecurity from "~/pages/admin/profile/components/TabSecurity.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const route = useRoute();
  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();
  const authStore = useAdminAuthStore();

  const profile = ref<any>(null);
  const isLoading = ref(false);
  const activeTabKey = ref("general");

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const canViewAdmins = computed(
    () => authStore.hasRole("super-admin") || authStore.hasPermission("view-admins")
  );

  const currentAdminId = computed(() => String(authStore.user?.id ?? "").trim());
  const requestedAdminId = computed(() => String(route.query?.adminId ?? "").trim());

  const profileScope = computed<"self" | "admin">(() => {
    if (!requestedAdminId.value || !canViewAdmins.value) {
      return "self";
    }

    if (!currentAdminId.value || requestedAdminId.value !== currentAdminId.value) {
      return "admin";
    }

    return "self";
  });

  const storageKey = computed(() =>
    profileScope.value === "self" ? "adminProfileActiveTab:self" : "adminProfileActiveTab:view"
  );

  const tabsList = computed(() => {
    const tabs = [
      {
        id: "general",
        label: resolveText("admin.profile.tabs.general", "General"),
        description: resolveText(
          "admin.profile.tabsDescription.general",
          "Profile details, contact fields and photo history."
        ),
        icon: "pi pi-user",
        component: TabGeneral,
      },
      {
        id: "activity",
        label: resolveText("admin.profile.tabs.activity", "Activity"),
        description: resolveText(
          "admin.profile.tabsDescription.activity",
          "Presence analytics, online sessions and environment breakdown."
        ),
        icon: "pi pi-chart-line",
        component: TabActivity,
      },
      {
        id: "logs",
        label: resolveText("admin.profile.tabs.logs", "Actions & chats"),
        description: resolveText(
          "admin.profile.tabsDescription.logs",
          "Administrative actions and support chat connection history."
        ),
        icon: "pi pi-clock",
        component: TabLogs,
      },
    ];

    if (profileScope.value === "self") {
      tabs.splice(1, 0, {
        id: "security",
        label: resolveText("admin.profile.tabs.security", "Security"),
        description: resolveText(
          "admin.profile.tabsDescription.security",
          "Password recovery and two-factor authentication settings."
        ),
        icon: "pi pi-shield",
        component: TabSecurity,
      });
    }

    return tabs;
  });

  const activeTab = computed(() => tabsList.value.find(tab => tab.id === activeTabKey.value) ?? tabsList.value[0] ?? null);

  const roleNames = computed(() =>
    Array.isArray(profile.value?.roles)
      ? profile.value.roles.map((role: any) => String(role?.name ?? "")).filter(Boolean)
      : []
  );

  const profileDisplayName = computed(
    () => profile.value?.name || profile.value?.nickname || profile.value?.email || "—"
  );

  const presenceLabel = computed(() =>
    profile.value?.is_online
      ? resolveText("admin.profile.status.online", "Online")
      : resolveText("admin.profile.status.offline", "Offline")
  );

  const presenceMeta = computed(() => {
    if (profile.value?.is_online) {
      return resolveText("admin.profile.status.onlineNow", "Active now");
    }

    return formatRelativeDateTime(profile.value?.last_seen_at) || "—";
  });

  const applyProfile = (payload: any) => {
    profile.value = payload ?? null;

    if (profileScope.value === "self" && payload) {
      authStore.setUser({
        ...(authStore.user ?? {}),
        ...payload,
      });

      if (typeof payload.photo_url === "string") {
        authStore.setPhotoUrl(payload.photo_url);
      }
    }
  };

  const loadProfile = async () => {
    isLoading.value = true;

    try {
      const response =
        profileScope.value === "self"
          ? await appCore.adminModules.profile.getMe()
          : await appCore.admins.getById(requestedAdminId.value);

      applyProfile(response?.data?.data ?? response?.data ?? null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? resolveText("admin.profile.errors.load", "Failed to load admin profile.")
      );
    } finally {
      isLoading.value = false;
    }
  };

  const handleProfileUpdated = (payload: any) => {
    applyProfile(payload);
  };

  const handleActiveTab = (tabId: string) => {
    activeTabKey.value = tabId;
  };

  const readStoredTab = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(storageKey.value);
  };

  const writeStoredTab = (value: string) => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(storageKey.value, value);
  };

  const resolveTabKey = (value: unknown) => {
    const normalized = String(value ?? "").trim().toLowerCase();
    if (!normalized) return null;

    return tabsList.value.some(tab => tab.id === normalized) ? normalized : null;
  };

  const syncActiveTab = () => {
    const queryTab = resolveTabKey(route.query?.tab);
    if (queryTab) {
      activeTabKey.value = queryTab;
      writeStoredTab(queryTab);
      return;
    }

    const saved = resolveTabKey(readStoredTab());
    activeTabKey.value = saved ?? tabsList.value[0]?.id ?? "general";
  };

  const formatRelativeDateTime = (value?: string | null) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const diffMs = date.getTime() - Date.now();
    const absDiffMs = Math.abs(diffMs);
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (absDiffMs < hour) {
      return formatter.format(Math.round(diffMs / minute), "minute");
    }

    if (absDiffMs < day) {
      return formatter.format(Math.round(diffMs / hour), "hour");
    }

    return formatter.format(Math.round(diffMs / day), "day");
  };

  watch(
    [profileScope, requestedAdminId],
    async () => {
      syncActiveTab();
      await loadProfile();
    },
    { immediate: true }
  );

  watch(
    () => route.query?.tab,
    () => {
      const resolved = resolveTabKey(route.query?.tab);
      if (resolved) {
        activeTabKey.value = resolved;
      }
    }
  );

  watch(tabsList, value => {
    if (!value.some(tab => tab.id === activeTabKey.value)) {
      activeTabKey.value = value[0]?.id ?? "general";
    }
  });

  watch(activeTabKey, value => {
    writeStoredTab(value);
  });
</script>

<style lang="scss" scoped>
  .admin-detail {
    --admin-glass-bg: color-mix(in srgb, var(--ui-background-card) 76%, transparent);
    --admin-glass-bg-strong: color-mix(in srgb, var(--ui-background-panel) 88%, transparent);
    --admin-glass-border: color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
    --admin-glass-shadow: 0 18px 56px color-mix(in srgb, #000000 18%, transparent);

    width: 100%;
    max-width: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(12px, 1.35vw, 22px);
    color: var(--ui-text-main);
  }

  .admin-detail__header {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .admin-detail__hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .admin-detail__identity {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .admin-detail__avatar {
    width: 56px;
    height: 56px;
    flex: 0 0 56px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 18px;
    color: var(--ui-text-invert);
    background: linear-gradient(
      135deg,
      var(--ui-primary-main),
      color-mix(in srgb, var(--ui-primary-main) 45%, var(--ui-primary-accent))
    );
    font-size: 15px;
    font-weight: 880;
    letter-spacing: 0.04em;
    box-shadow: 0 12px 30px color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
  }

  .admin-detail__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .admin-detail__heading {
    min-width: 0;
  }

  .admin-detail__title {
    margin: 0;
    color: var(--ui-text-main);
    font-size: clamp(24px, 2.1vw, 36px);
    font-weight: 850;
    line-height: 1.02;
    letter-spacing: -0.035em;
  }

  .admin-detail__subtitle {
    margin: 6px 0 0;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  .admin-detail__roles {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .admin-detail__role-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 0.78rem;
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, transparent);
  }

  .admin-detail__header-side {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .admin-detail__status {
    --status-color: var(--ui-text-secondary);

    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--status-color);
    font-size: 12px;
    font-weight: 780;
    white-space: nowrap;
  }

  .admin-detail__status.is-online {
    --status-color: var(--color-success);
  }

  .admin-detail__status-dot {
    width: 8px;
    height: 8px;
    flex: 0 0 8px;
    border-radius: 999px;
    background: var(--status-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-color) 15%, transparent);
  }

  .admin-detail__summary-strip {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    padding-left: 72px;
  }

  .admin-detail__summary-item {
    min-width: 0;
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
  }

  .admin-detail__summary-label {
    display: block;
    color: var(--ui-text-secondary);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.25;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .admin-detail__summary-value {
    display: block;
    color: var(--ui-text-main);
    font-size: 13px;
    line-height: 1.45;
    word-break: break-word;
  }

  .admin-detail__refresh {
    min-width: 134px;
  }

  .admin-detail-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 12%, var(--color-stroke-ui-light));
    border-radius: 20px;
    background:
      radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--ui-primary-main) 8%, transparent), transparent 38%),
      linear-gradient(145deg, var(--admin-glass-bg), var(--admin-glass-bg-strong));
    box-shadow: 0 14px 38px color-mix(in srgb, #000000 12%, transparent);
    backdrop-filter: blur(18px) saturate(128%);
    -webkit-backdrop-filter: blur(18px) saturate(128%);
  }

  .admin-detail-card::after {
    content: "";
    position: absolute;
    inset: -30% auto -30% -52%;
    z-index: 0;
    width: 46%;
    pointer-events: none;
    background: linear-gradient(110deg, transparent, color-mix(in srgb, #ffffff 6%, transparent), transparent);
    opacity: 0;
    transform: rotate(12deg) translateX(-35%);
  }

  .admin-detail-card:hover::after {
    animation: admin-detail-glint 1.1s ease both;
  }

  .admin-detail__layout {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    min-height: 560px;
  }

  .admin-detail__nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 8px 8px 10px;
    border-right: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
  }

  .admin-detail__nav-button {
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

  .admin-detail__nav-button:hover,
  .admin-detail__nav-button.is-active {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 11%, transparent);
    transform: translateX(2px);
  }

  .admin-detail__nav-button.is-active {
    box-shadow: inset 2px 0 0 var(--ui-primary-main);
  }

  .admin-detail__content {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .admin-detail__content-header {
    min-height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 12px 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
  }

  .admin-detail__content-header h2 {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 18px;
    font-weight: 840;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .admin-detail__content-header p {
    max-width: 820px;
    margin: 5px 0 0;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.45;
  }

  .admin-detail__content :deep(*) {
    min-width: 0;
  }

  .admin-detail__content :deep(.admin-profile-tab-space) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  @media (max-width: 1200px) {
    .admin-detail__hero {
      flex-direction: column;
      align-items: flex-start;
    }

    .admin-detail__header-side {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .admin-detail__summary-strip {
      padding-left: 0;
    }
  }

  @media (max-width: 960px) {
    .admin-detail__layout {
      grid-template-columns: 1fr;
    }

    .admin-detail__nav {
      border-right: 0;
      border-bottom: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
    }

    .admin-detail__nav-button:hover,
    .admin-detail__nav-button.is-active {
      transform: none;
    }
  }

  @media (max-width: 720px) {
    .admin-detail {
      padding: 12px;
    }

    .admin-detail__identity,
    .admin-detail__header-side {
      align-items: flex-start;
    }

    .admin-detail__hero {
      gap: 12px;
    }

    .admin-detail__summary-strip {
      gap: 12px;
      padding-left: 0;
    }
  }

  @keyframes admin-detail-glint {
    0% {
      opacity: 0;
      transform: rotate(12deg) translateX(-35%);
    }

    20% {
      opacity: 0.58;
    }

    100% {
      opacity: 0;
      transform: rotate(12deg) translateX(245%);
    }
  }
</style>
