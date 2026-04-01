<template>
  <UiContainer>
    <div class="admin-profile-page">
      <div class="admin-profile-page__header">
        <div>
          <UiTextH4 class="text-[var(--ui-text-main)]">
            {{ resolveText("admin.profile.title", "Admin profile") }}
          </UiTextH4>
          <UiTextSmall class="admin-profile-page__subtitle">
            {{ resolveText("admin.profile.subtitle", "Manage your administrator account, security, and activity.") }}
          </UiTextSmall>
        </div>

        <UiButtonDefault
          state="info--outline"
          :isLoading="isLoading"
          @click="loadProfile">
          {{ resolveText("admin.profile.actions.refresh", "Refresh") }}
        </UiButtonDefault>
      </div>

      <PanelDefault class="admin-profile-page__summary">
        <div class="admin-profile-page__summary-hero">
          <div class="admin-profile-page__summary-avatar">
            <UiImage
              v-if="profile?.photo_url"
              class="admin-profile-page__summary-image"
              :src="profile.photo_url" />
            <div
              v-else
              class="admin-profile-page__summary-placeholder">
              {{ profile?.initials || "AD" }}
            </div>
          </div>

          <div class="admin-profile-page__summary-main">
            <div class="admin-profile-page__summary-top">
              <div>
                <UiTextH5 class="admin-profile-page__summary-name">
                  {{ profile?.name || profile?.nickname || profile?.email || "—" }}
                </UiTextH5>
                <UiTextSmall class="admin-profile-page__subtitle">
                  {{ profile?.email || "—" }}
                </UiTextSmall>
              </div>

              <UiBadge
                :state="profile?.is_online ? 'success' : 'warning'"
                outline
                class="!px-3">
                {{
                  profile?.is_online
                    ? resolveText("admin.profile.status.online", "Online")
                    : resolveText("admin.profile.status.offline", "Offline")
                }}
              </UiBadge>
            </div>

            <div
              v-if="roleNames.length > 0"
              class="admin-profile-page__summary-roles">
              <span class="admin-profile-page__summary-label">{{
                resolveText("admin.profile.summary.roles", "Roles")
              }}</span>
              <span
                v-for="roleName in roleNames"
                :key="roleName"
                class="admin-profile-page__role-pill">
                {{ roleName }}
              </span>
            </div>
          </div>
        </div>

        <div class="admin-profile-page__summary-stats">
          <div class="admin-profile-page__summary-stat">
            <span class="admin-profile-page__summary-stat-label">
              {{ resolveText("admin.profile.summary.nickname", "Nickname") }}
            </span>
            <strong class="admin-profile-page__summary-stat-value">{{ profile?.nickname || "—" }}</strong>
          </div>

          <div class="admin-profile-page__summary-stat">
            <span class="admin-profile-page__summary-stat-label">
              {{ resolveText("admin.profile.summary.twoFactor", "2FA") }}
            </span>
            <strong class="admin-profile-page__summary-stat-value">
              {{
                profile?.two_factor_enabled
                  ? resolveText("admin.profile.security.twoFactor.enabled", "Enabled")
                  : resolveText("admin.profile.security.twoFactor.disabled", "Disabled")
              }}
            </strong>
          </div>

          <div class="admin-profile-page__summary-stat">
            <span class="admin-profile-page__summary-stat-label">
              {{ resolveText("admin.profile.summary.lastSeen", "Last seen") }}
            </span>
            <strong class="admin-profile-page__summary-stat-value">
              {{ formatDateTime(profile?.last_seen_at) }}
            </strong>
          </div>
        </div>
      </PanelDefault>

      <PanelDefault class="admin-profile-page__workspace">
        <div class="admin-profile-page__layout">
          <div class="admin-profile-page__tabs">
            <TabsAsList
              :tabsList="tabsList"
              :activeTabIndex="activeTabIndex"
              @selectTab="handleActiveTab" />
          </div>

          <div class="admin-profile-page__content">
            <div class="admin-profile-page__content-header">
              {{ tabsList[activeTabIndex]?.label }}
            </div>

            <div class="admin-profile-page__content-body">
              <component
                :is="tabsList[activeTabIndex]?.component"
                :key="tabsList[activeTabIndex]?.key"
                :profileData="profile"
                :isLoading="isLoading"
                @profile-updated="handleProfileUpdated"
                @profile-refresh="loadProfile" />
            </div>
          </div>
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import { definePageMeta } from "~/.nuxt/imports";

  import UiBadge from "~/components/ui/UiBadge.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiImage from "~/components/ui/UiImage.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import TabsAsList from "~/components/block/tabs/TabsAsList.vue";
  import useAppCore from "~/composables/useAppCore";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import TabActivity from "~/pages/admin/profile/components/TabActivity.vue";
  import TabGeneral from "~/pages/admin/profile/components/TabGeneral.vue";
  import TabSecurity from "~/pages/admin/profile/components/TabSecurity.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const STORAGE_KEY = "adminProfileActiveTab";

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();
  const authStore = useAdminAuthStore();

  const activeTabIndex = ref(0);
  const isLoading = ref(false);
  const profile = ref<any>(null);

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const tabsList = computed(() => [
    { key: "general", label: resolveText("admin.profile.tabs.general", "General"), component: TabGeneral },
    { key: "security", label: resolveText("admin.profile.tabs.security", "Security"), component: TabSecurity },
    { key: "activity", label: resolveText("admin.profile.tabs.activity", "Activity"), component: TabActivity },
  ]);

  const roleNames = computed(() =>
    Array.isArray(profile.value?.roles)
      ? profile.value.roles.map((role: any) => String(role?.name ?? "")).filter(Boolean)
      : []
  );

  const applyProfile = (payload: any) => {
    if (!payload || typeof payload !== "object") {
      profile.value = null;
      return;
    }

    profile.value = payload;
    authStore.setUser({
      ...(authStore.user ?? {}),
      ...payload,
    });

    if (typeof payload.photo_url === "string") {
      authStore.setPhotoUrl(payload.photo_url);
    }
  };

  const loadProfile = async () => {
    isLoading.value = true;

    try {
      const response = await appCore.adminModules.profile.getMe();
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

  const handleActiveTab = (tabIndex: number) => {
    activeTabIndex.value = tabIndex;
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  };

  onMounted(async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null && !Number.isNaN(Number(saved))) {
      activeTabIndex.value = Number(saved);
    }

    await loadProfile();
  });

  watch(activeTabIndex, value => {
    localStorage.setItem(STORAGE_KEY, String(value));
  });
</script>

<style scoped lang="scss">
  .admin-profile-page {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .admin-profile-page__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .admin-profile-page__subtitle {
    color: var(--ui-text-secondary);
    line-height: 1.5;
  }

  .admin-profile-page__summary {
    position: relative;
    overflow: hidden;
    padding: 28px;
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.9fr);
    gap: 20px;
    background:
      radial-gradient(circle at top left, rgba(113, 158, 223, 0.22), transparent 38%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01));
  }

  .admin-profile-page__summary::after {
    content: "";
    position: absolute;
    inset: auto -20% -45% auto;
    width: 340px;
    height: 340px;
    background: radial-gradient(circle, rgba(113, 223, 173, 0.09), transparent 68%);
    pointer-events: none;
  }

  .admin-profile-page__summary-hero,
  .admin-profile-page__summary-stats {
    position: relative;
    z-index: 1;
  }

  .admin-profile-page__summary-hero {
    display: flex;
    align-items: center;
    gap: 22px;
  }

  .admin-profile-page__summary-avatar {
    flex-shrink: 0;
  }

  .admin-profile-page__summary-image,
  .admin-profile-page__summary-placeholder {
    width: 128px;
    height: 128px;
    border-radius: 24px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
  }

  .admin-profile-page__summary-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(50, 110, 255, 0.26), rgba(113, 158, 223, 0.45));
    color: var(--ui-text-main);
    font-size: 36px;
    font-weight: 700;
  }

  .admin-profile-page__summary-main {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .admin-profile-page__summary-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .admin-profile-page__summary-name {
    color: var(--ui-text-main);
    font-size: 28px;
    line-height: 1.1;
  }

  .admin-profile-page__summary-roles {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    color: var(--ui-text-secondary);
  }

  .admin-profile-page__summary-label {
    color: var(--ui-text-main);
    font-weight: 600;
  }

  .admin-profile-page__role-pill {
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid rgba(113, 158, 223, 0.28);
    background: rgba(113, 158, 223, 0.11);
    color: var(--ui-text-main);
    backdrop-filter: blur(6px);
  }

  .admin-profile-page__summary-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    align-self: stretch;
  }

  .admin-profile-page__summary-stat {
    min-width: 0;
    border-radius: 20px;
    padding: 18px;
    background: rgba(6, 15, 40, 0.4);
    border: 1px solid rgba(113, 158, 223, 0.14);
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: space-between;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .admin-profile-page__summary-stat-label {
    color: var(--ui-text-secondary);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .admin-profile-page__summary-stat-value {
    color: var(--ui-text-main);
    font-size: 15px;
    line-height: 1.45;
    word-break: break-word;
  }

  .admin-profile-page__workspace {
    overflow: hidden;
  }

  .admin-profile-page__layout {
    display: flex;
    min-height: 720px;
  }

  .admin-profile-page__tabs {
    width: 240px;
    border-right: 1px solid rgba(113, 158, 223, 0.26);
    padding: 18px 14px;
    flex-shrink: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.01)), rgba(7, 18, 53, 0.45);
  }

  .admin-profile-page__content {
    flex: 1;
    min-width: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0));
  }

  .admin-profile-page__content-header {
    height: 66px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid rgba(113, 158, 223, 0.2);
    color: var(--ui-text-main);
    font-weight: 600;
    letter-spacing: 0.02em;
    background: rgba(255, 255, 255, 0.015);
  }

  .admin-profile-page__content-body {
    padding: 24px;
  }

  .admin-profile-page__tabs :deep(.tabs) {
    gap: 10px;
  }

  .admin-profile-page__tabs :deep(.tab) {
    border: 1px solid transparent;
    background: rgba(255, 255, 255, 0.025);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
  }

  .admin-profile-page__tabs :deep(.tab:hover) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(113, 158, 223, 0.14);
    transform: translateX(2px);
  }

  .admin-profile-page__tabs :deep(.tab.active) {
    background: linear-gradient(135deg, rgba(62, 110, 241, 0.92), rgba(113, 158, 223, 0.86));
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 12px 26px rgba(30, 64, 175, 0.28);
  }

  .admin-profile-page__tabs :deep(.tab__icon) {
    opacity: 0.9;
  }

  @media (max-width: 1100px) {
    .admin-profile-page__summary {
      grid-template-columns: 1fr;
    }

    .admin-profile-page__layout {
      flex-direction: column;
    }

    .admin-profile-page__tabs {
      width: 100%;
      border-right: 0;
      border-bottom: 1px solid rgba(113, 158, 223, 0.22);
    }

    .admin-profile-page__summary-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .admin-profile-page__tabs :deep(.tab:hover) {
      transform: none;
    }
  }

  @media (max-width: 640px) {
    .admin-profile-page__header,
    .admin-profile-page__summary-top,
    .admin-profile-page__summary-hero {
      flex-direction: column;
    }

    .admin-profile-page__summary {
      padding: 22px 18px;
    }

    .admin-profile-page__summary-stats {
      grid-template-columns: 1fr;
    }

    .admin-profile-page__content-body {
      padding: 18px;
    }
  }
</style>
