<template>
  <header class="header">
    <nav>
      <div class="header__menu">
        <div class="header__menu-left">
          <button
            class="header__burger"
            type="button"
            aria-label="Open menu"
            @click="emit('toggle-sidebar')">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div class="header__breadcrumbs">
            <UiBreadcrumb
              v-if="props.showBreadcrumbs && props.breadcrumbs.length"
              :list="props.breadcrumbs" />
          </div>
        </div>

        <div class="header__menu-right">
          <div class="mr-5 flex justify-end items-center gap-2">
            <LanguageSwitcher
              isSidebar
              :isInvert="isThemeLight"
              class="icon" />

            <div
              ref="notificationsRef"
              class="relative flex items-center justify-center">
              <button
                class="relative"
                @click="handleClickNotifications"
                :aria-label="t('cabinet.header.notifications')">
                <UiIconBell />
                <span
                  v-if="unreadCount > 0"
                  class="absolute -top-2 -right-2 h-5 w-5 text-[10px] font-bold rounded-full bg-[var(--color-warning)] text-[var(--ui-text-main)] flex items-center justify-center">
                  {{ unreadBadgeLabel }}
                </span>
              </button>

              <div
                v-if="isOpen"
                class="fixed sm:absolute top-[80px] sm:top-9 left-5 right-5 sm:left-auto sm:right-0 z-50 sm:w-[320px] md:w-[360px] lg:w-[400px] max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] rounded-xl !bg-[var(--ui-background)] border border-[var(--color-stroke-ui-light)] flex flex-col">
                <div class="flex items-center justify-between p-3 sm:p-4 lg:p-5 flex-shrink-0">
                  <span class="text-[var(--ui-text-main)]">{{ t("cabinet.header.notifications") }}</span>
                  <UiTextSmall
                    state="info--outline--small"
                    class="cursor-pointer"
                    @click="markAllRead">
                    {{ t("cabinet.header.markAllRead") }}
                  </UiTextSmall>
                </div>

                <UiSpacer :heightNone="true" />

                <div class="p-3 sm:p-4 lg:p-5 overflow-y-auto flex-1">
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    :class="[
                      'relative mb-2.5 p-2 sm:p-3 rounded-xl bg-[var(--color-stroke-ui-light)] border border-[var(--color-stroke-ui-light)] cursor-pointer',
                      notification.tone === 'info' ? 'text-[var(--ui-text-main)]' : '',
                      notification.tone === 'success' ? 'text-[var(--color-success)]' : '',
                      notification.tone === 'warning' ? 'text-[var(--color-warning)]' : '',
                      notification.tone === 'danger' ? 'text-[var(--color-danger)]' : '',
                      notification.wasRead ? 'opacity-30 hover:opacity-100' : '',
                    ]"
                    @click="handleNotificationClick(notification)">
                    <UiIconSuccessFull
                      v-if="notification.tone === 'success'"
                      class="absolute top-2 left-2 sm:top-3 sm:left-3" />
                    <UiIconWarningFull
                      v-if="notification.tone === 'warning'"
                      class="absolute top-2 left-2 sm:top-3 sm:left-3" />
                    <UiIconDangerFull
                      v-if="notification.tone === 'danger'"
                      class="absolute top-2 left-2 sm:top-3 sm:left-3" />
                    <UiIconInfoFull
                      v-if="notification.tone === 'info'"
                      class="absolute top-2 left-2 sm:top-3 sm:left-3" />
                    <div class="ml-8 sm:ml-10">
                      <div>{{ notification.title }}</div>
                      <div>{{ notification.message }}</div>
                      <div
                        v-if="notification.createdAt"
                        class="text-[11px] opacity-60 mt-1">
                        {{ formatNotificationTime(notification.createdAt) }}
                      </div>
                    </div>
                    <UiIconDelete
                      class="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-50 hover:opacity-100"
                      @click="handleNotificationActionClick(notification, $event)" />
                  </div>

                  <div
                    v-if="!isLoading && notifications.length === 0"
                    class="h-[150px] sm:h-[200px] rounded-xl flex flex-col items-center justify-center gap-4">
                    <UiIconBell />
                    <span>{{ t("cabinet.header.emptyNotifications") }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            ref="profileContainerRef"
            class="flex justify-end items-center gap-3 relative cursor-pointer"
            @click="handleClickProfileMenu">
            <div
              class="mx-auto h-[32px] w-[32px] rounded-full flex items-center justify-center overflow-hidden ring-2 ring-[var(--ui-text-main)]">
              <img
                v-if="adminAuthStore.photoUrl"
                :src="adminAuthStore.photoUrl"
                alt="Admin Photo"
                class="h-[32px] w-[32px] object-cover rounded-full" />
              <UiImageCircle
                v-else
                class="!h-[32px] !w-[32px]"
                :class="{ 'svg-invert': isThemeLight }" />
            </div>
            <UiTextParagraph>{{ currentAdminDisplayName }}</UiTextParagraph>
            <UiIconArrowDown :rotate180="profileMenuIsOpen" />

            <div
              ref="profileMenuRef"
              class="fixed sm:absolute top-[80px] sm:top-9 left-5 right-5 sm:left-auto sm:right-0 sm:w-fit bg-[var(--ui-background)] border border-[var(--color-stroke-ui-light)] rounded-md z-10"
              v-if="profileMenuIsOpen"
              @click.stop>
              <NuxtLink
                v-if="canViewProfile"
                :to="localePath('/profile')"
                aria-label="Profile">
                <div class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md">
                  <UiIconSetting />
                  <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.accountSettings") }}</UiTextSmall>
                </div>
              </NuxtLink>

              <div
                aria-label="Toggle theme"
                @click.stop="handleToggleTheme"
                class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md cursor-pointer">
                <transition
                  name="fade"
                  mode="out-in">
                  <UiIconSun
                    v-if="themeStore.currentTheme === 'dark'"
                    :key="'sun'" />
                  <UiIconMoon
                    v-else
                    :key="'moon'" />
                </transition>
                <UiTextSmall class="w-full whitespace-nowrap">
                  {{
                    themeStore.currentTheme === "dark"
                      ? t("cabinet.header.switchToLight")
                      : t("cabinet.header.switchToDark")
                  }}
                </UiTextSmall>
                <div
                  class="shrink-0"
                  @click.stop>
                  <UiSwitchToggle
                    :model-value="isThemeLight"
                    @update:modelValue="handleToggleTheme" />
                </div>
              </div>

              <UiSpacer :heightNone="true" />

              <NuxtLink
                v-if="canViewSupport"
                :to="localePath('/support')"
                aria-label="Help Center">
                <div class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md">
                  <UiIconSupport />
                  <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.helpCenter") }}</UiTextSmall>
                </div>
              </NuxtLink>

              <UiSpacer :heightNone="true" />

              <button
                type="button"
                class="w-full flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md"
                @click="handleClickLogout">
                <UiIconLogout />
                <UiTextSmall class="w-full whitespace-nowrap text-left">{{ t("cabinet.header.logout") }}</UiTextSmall>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
  import type Echo from "laravel-echo";
  import { useRoute } from "vue-router";
  import { navigateTo, useNuxtApp } from "nuxt/app";
  import { computed, onMounted, onUnmounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import UiIconMoon from "~/components/ui/UiIconMoon.vue";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import UiIconSun from "~/components/ui/UiIconSun.vue";
  import LanguageSwitcher from "~/components/block/LandingHeader/components/LanguageSwitcher.vue";
  import { useThemeStore } from "~/stores/themeStore";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";
  import UiIconBell from "~/components/ui/UiIconBell.vue";
  import UiIconDelete from "~/components/ui/UiIconDelete.vue";
  import UiIconSetting from "~/components/ui/UiIconSetting.vue";
  import UiIconSupport from "~/components/ui/UiIconSupport.vue";
  import UiIconLogout from "~/components/ui/UiIconLogout.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import UiSpacer from "~/components/ui/UiSpacer.vue";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
  import UiBreadcrumb from "~/components/ui/UiBreadcrumb.vue";
  import UiIconSuccessFull from "~/components/ui/UiIconSuccessFull.vue";
  import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
  import UiIconDangerFull from "~/components/ui/UiIconDangerFull.vue";
  import UiIconInfoFull from "~/components/ui/UiIconInfoFull.vue";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import { useAdminNotificationsStore } from "~/stores/adminNotificationsStore";
  import { useUiStore } from "~/stores/uiStore";
  import { useLocalePath } from "~/.nuxt/imports";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";

  type BreadcrumbItem = {
    name: string;
    to?: string;
    icon?: any;
  };

  type NotificationTone = "info" | "success" | "warning" | "danger";
  type AdminNotificationItem = {
    id: string;
    type: string;
    title: string;
    message: string;
    payload: Record<string, any> | null;
    wasRead: boolean;
    createdAt: string | null;
    route: string | null;
    tone: NotificationTone;
  };

  const NOTIFICATIONS_POLL_MS = 10000;
  const NOTIFICATIONS_REALTIME_RETRY_MS = 5000;
  const NOTIFICATION_EVENT_NAMES = [
    ".AdminNotificationCreated",
    "AdminNotificationCreated",
    ".App\\Events\\AdminNotificationCreated",
    "App\\Events\\AdminNotificationCreated",
  ];

  const props = withDefaults(
    defineProps<{
      breadcrumbs?: BreadcrumbItem[];
      showBreadcrumbs?: boolean;
    }>(),
    {
      breadcrumbs: () => [],
      showBreadcrumbs: false,
    }
  );

  const emit = defineEmits(["toggle-sidebar"]);
  const route = useRoute();
  const appCore = useAppCore();
  const toast = useToast();
  const { $echo } = useNuxtApp() as { $echo?: Echo<any> };
  const { t, locale } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const themeStore = useThemeStore();
  const uiStore = useUiStore();
  const adminAuthStore = useAdminAuthStore();
  const adminNotificationsStore = useAdminNotificationsStore();
  const ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT = "admin-notifications-marked-by-types";

  const isOpen = computed({
    get: () => uiStore.notificationsOpen,
    set: value => {
      uiStore.notificationsOpen = value;
    },
  });

  const isLoading = ref(false);
  const isMarkAllInProgress = ref(false);
  const notificationsLoaded = ref(false);
  const notifications = ref<AdminNotificationItem[]>([]);
  const knownNotificationIds = ref<Set<string>>(new Set());
  const notificationsRef = ref<any>(null);
  const profileMenuIsOpen = ref(false);
  const profileMenuRef = ref(null);
  const profileContainerRef = ref(null);
  const activeNotificationsChannel = ref<any>(null);
  const currentNotificationsChannelName = ref("");
  let notificationsSocketStateHandler: ((states: any) => void) | null = null;
  let notificationsRealtimeRetryTimer: ReturnType<typeof setInterval> | null = null;
  let notificationsPollTimer: ReturnType<typeof setInterval> | null = null;

  const isThemeLight = computed(() => themeStore.currentTheme !== "dark");
  const canViewProfile = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-profile"));
  const canViewSupport = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-support"));
  const unreadCount = computed(() => adminNotificationsStore.unreadCount);
  const unreadBadgeLabel = computed(() => (unreadCount.value > 99 ? "99+" : String(unreadCount.value)));
  const currentAdminDisplayName = computed(() => {
    const name = String(
      adminAuthStore.user?.name || adminAuthStore.user?.nickname || adminAuthStore.user?.email || ""
    ).trim();

    return name !== "" ? name : "Admin";
  });

  const resolveText = (key: string, fallback: string, params?: Record<string, unknown>): string => {
    const value = t(key, params ?? {});
    return value === key ? fallback : value;
  };

  const hasAccessToken = () => Boolean(String(adminAuthStore.accessToken ?? "").trim());
  const isWithdrawalRequestsRoute = computed(() => String(route.path ?? "").includes("/withdrawal-requests"));

  const handleClickNotifications = () => uiStore.toggleNotifications();
  const handleClickProfileMenu = () => {
    profileMenuIsOpen.value = !profileMenuIsOpen.value;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (profileContainerRef.value && !profileContainerRef.value.contains(event.target as Node)) {
      profileMenuIsOpen.value = false;
    }

    if (notificationsRef.value && !notificationsRef.value.contains(event.target as Node)) {
      uiStore.closeNotifications();
    }
  };

  const handleToggleTheme = () => {
    themeStore.toggleTheme();
  };

  const handleClickLogout = async () => {
    await adminAuthStore.authLogout();
  };

  const resolveEchoClient = () => {
    if ($echo && typeof ($echo as any).private === "function") {
      return $echo as any;
    }

    if (typeof window !== "undefined") {
      const fallbackEcho = (window as any).Echo;
      if (fallbackEcho && typeof fallbackEcho.private === "function") {
        return fallbackEcho;
      }
    }

    return null;
  };

  const resolveNotificationTone = (raw: any): NotificationTone => {
    const source = `${raw?.type ?? ""} ${raw?.title ?? ""} ${raw?.message ?? ""}`.toLowerCase();
    if (source.includes("success")) return "success";
    if (source.includes("warning")) return "warning";
    if (source.includes("error") || source.includes("danger") || source.includes("failed")) return "danger";
    return "info";
  };

  const buildWithdrawalCreatedNotification = (
    raw: any,
    payload: Record<string, any> | null
  ): { title: string; message: string } => {
    const clientName = String(payload?.owner_name || payload?.owner_email || "").trim();
    const amount = Number(payload?.amount ?? 0);
    const currency = String(payload?.currency || "USD").trim();
    const accountNumber = String(payload?.account_number || "").trim();

    const defaultTitle = String(raw?.title ?? "").trim() || "New withdrawal request";
    const defaultMessage = String(raw?.message ?? "").trim();

    const title = resolveText(
      "cabinet.header.notificationTemplates.withdrawalRequestCreated.title",
      defaultTitle
    );

    const fallbackMessage = defaultMessage !== "" ? defaultMessage : `${clientName} • ${amount} ${currency}`;
    const message = resolveText(
      "cabinet.header.notificationTemplates.withdrawalRequestCreated.message",
      fallbackMessage,
      {
        client: clientName || "-",
        amount: amount.toFixed(2),
        currency,
        account: accountNumber || "-",
      }
    );

    return { title, message };
  };

  const normalizeNotification = (raw: any): AdminNotificationItem | null => {
    const id = String(raw?.id ?? "").trim();
    if (id === "") return null;

    const readAt = raw?.read_at ? String(raw.read_at) : null;
    const isUnread = raw?.is_unread ?? raw?.unread ?? readAt === null;
    const payload = raw?.payload && typeof raw.payload === "object" ? raw.payload : null;
    const type = String(raw?.type ?? "system").trim() || "system";

    let title = String(raw?.title ?? "").trim();
    let message = String(raw?.message ?? "").trim();

    if (type === "payments.withdrawal.created") {
      const localized = buildWithdrawalCreatedNotification(raw, payload);
      title = localized.title;
      message = localized.message;
    }

    if (title === "") {
      title = t("cabinet.header.notifications");
    }

    if (message === "") {
      message = t("cabinet.header.emptyNotifications");
    }

    return {
      id,
      type,
      title,
      message,
      payload,
      wasRead: !isUnread,
      createdAt: raw?.created_at ? String(raw.created_at) : null,
      route: typeof payload?.route === "string" && payload.route.trim() !== "" ? payload.route.trim() : null,
      tone: resolveNotificationTone({ ...raw, title, message, type }),
    };
  };

  const upsertNotification = (notification: AdminNotificationItem, prepend = true) => {
    const idx = notifications.value.findIndex(item => item.id === notification.id);
    if (idx === -1) {
      if (prepend) {
        notifications.value.unshift(notification);
      } else {
        notifications.value.push(notification);
      }
      return;
    }

    notifications.value.splice(idx, 1, notification);
  };

  const rememberNotifications = (items: AdminNotificationItem[]) => {
    const next = new Set(knownNotificationIds.value);
    items.forEach(item => next.add(item.id));
    knownNotificationIds.value = next;
  };

  const setAllLocalRead = () => {
    notifications.value = notifications.value.map(item => ({
      ...item,
      wasRead: true,
    }));
  };

  const loadNotifications = async (options: { showToastsForNew?: boolean } = {}): Promise<AdminNotificationItem[]> => {
    if (!hasAccessToken()) {
      notifications.value = [];
      notificationsLoaded.value = false;
      adminNotificationsStore.reset();
      knownNotificationIds.value = new Set();
      return [];
    }

    isLoading.value = true;
    try {
      const response = await appCore.adminModules.notifications.get({ page: 1, perPage: 30 });
      const payload = response?.data?.data ?? {};
      const incomingItems = Array.isArray(payload?.data) ? payload.data : [];
      const previousKnownIds = new Set(knownNotificationIds.value);
      const normalizedItems = incomingItems
        .map(normalizeNotification)
        .filter((item: AdminNotificationItem | null): item is AdminNotificationItem => Boolean(item));
      const newUnreadItems = normalizedItems.filter(item => !item.wasRead && !previousKnownIds.has(item.id));

      notifications.value = normalizedItems;
      rememberNotifications(normalizedItems);

      adminNotificationsStore.applySummary(payload);
      notificationsLoaded.value = true;

      if (options.showToastsForNew) {
        newUnreadItems
          .slice()
          .reverse()
          .forEach(showNotificationToast);
      }

      return newUnreadItems;
    } catch {
      notificationsLoaded.value = false;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const loadUnreadSummary = async () => {
    if (!hasAccessToken()) {
      adminNotificationsStore.reset();
      return;
    }

    try {
      const response = await appCore.adminModules.notifications.getUnreadSummary();
      adminNotificationsStore.applySummary(response?.data?.data ?? {});
    } catch {
      adminNotificationsStore.reset();
    }
  };

  const markAllRead = async () => {
    if (isMarkAllInProgress.value || unreadCount.value <= 0) return;

    isMarkAllInProgress.value = true;
    const snapshot = [...notifications.value];
    setAllLocalRead();
    adminNotificationsStore.applySummary({
      unread_count: 0,
      unread_withdrawal_requests_count: 0,
    });

    try {
      const response = await appCore.adminModules.notifications.markAllRead();
      adminNotificationsStore.applySummary(response?.data?.data ?? {});
    } catch {
      notifications.value = snapshot;
      await loadUnreadSummary();
    } finally {
      isMarkAllInProgress.value = false;
    }
  };

  const markNotificationRead = async (notificationId: string, syncWithApi = true) => {
    const index = notifications.value.findIndex(item => item.id === notificationId);
    if (index === -1 || notifications.value[index].wasRead) return;

    const prevItem = notifications.value[index];
    notifications.value.splice(index, 1, { ...prevItem, wasRead: true });
    adminNotificationsStore.decrementForNotification(prevItem.type);

    if (!syncWithApi) return;

    try {
      const response = await appCore.adminModules.notifications.markRead(notificationId);
      adminNotificationsStore.applySummary(response?.data?.data ?? {});
    } catch {
      notifications.value.splice(index, 1, prevItem);
      adminNotificationsStore.incrementForNotification(prevItem.type);
    }
  };

  const markNotificationsByTypes = async (types: string[]) => {
    const normalizedTypes = types.map(item => String(item ?? "").trim()).filter(Boolean);
    if (normalizedTypes.length === 0) return;

    const response = await appCore.adminModules.notifications.markReadByTypes(normalizedTypes);
    const summary = response?.data?.data ?? {};
    adminNotificationsStore.applySummary(summary);
    useEventBus.emit(ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, {
      types: normalizedTypes,
      summary,
    });
  };

  const showNotificationToast = (notification: AdminNotificationItem) => {
    const content =
      notification.message && notification.message !== notification.title
        ? `${notification.title}: ${notification.message}`
        : notification.title;

    if (notification.tone === "success") {
      toast.success(content);
      return;
    }

    if (notification.tone === "warning") {
      toast.warning(content);
      return;
    }

    if (notification.tone === "danger") {
      toast.error(content);
      return;
    }

    toast.info(content);
  };

  const reconnectNotificationsSocketTransport = () => {
    const echoClient = resolveEchoClient();
    const pusher = echoClient?.connector?.pusher;
    const state = String(pusher?.connection?.state ?? "");
    if (!pusher) return;

    if (state === "disconnected" || state === "failed" || state === "unavailable") {
      try {
        pusher.connect();
      } catch {
        // no-op
      }
    }
  };

  const handleRealtimeNotification = async (payload: any) => {
    const normalized = normalizeNotification(payload?.notification ?? null);
    if (!normalized) return;

    const wasKnown = knownNotificationIds.value.has(normalized.id);
    upsertNotification(normalized, true);
    rememberNotifications([normalized]);

    if (!normalized.wasRead && !wasKnown) {
      adminNotificationsStore.incrementForNotification(normalized.type);
      showNotificationToast(normalized);
    }

    if (isWithdrawalRequestsRoute.value && normalized.type === "payments.withdrawal.created") {
      await markNotificationRead(normalized.id, true);
    }
  };

  const handleNotificationActionClick = async (notification: AdminNotificationItem, event?: MouseEvent) => {
    event?.stopPropagation();
    await markNotificationRead(notification.id, true);
  };

  const handleNotificationClick = async (notification: AdminNotificationItem) => {
    if (!notification.wasRead) {
      await markNotificationRead(notification.id, true);
    }

    if (!notification.route) return;
    uiStore.closeNotifications();
    await navigateTo(localePath(notification.route));
  };

  const subscribeToNotifications = (adminId: string) => {
    const normalizedAdminId = String(adminId || "").trim();
    if (normalizedAdminId === "") return;

    const channelName = `notifications.admin.${normalizedAdminId}`;
    if (currentNotificationsChannelName.value === channelName && activeNotificationsChannel.value) {
      return;
    }

    unsubscribeFromNotifications();
    const echoClient = resolveEchoClient();
    if (!echoClient) return;

    reconnectNotificationsSocketTransport();
    currentNotificationsChannelName.value = channelName;
    activeNotificationsChannel.value = echoClient.private(channelName);
    NOTIFICATION_EVENT_NAMES.forEach(eventName => {
      activeNotificationsChannel.value.stopListening(eventName, handleRealtimeNotification);
      activeNotificationsChannel.value.listen(eventName, handleRealtimeNotification);
    });
  };

  const unsubscribeFromNotifications = () => {
    const channelName = currentNotificationsChannelName.value;
    currentNotificationsChannelName.value = "";
    activeNotificationsChannel.value = null;

    if (channelName === "") return;
    const echoClient = resolveEchoClient();
    if (!echoClient) return;

    try {
      echoClient.leave(channelName);
    } catch {
      // no-op
    }
  };

  const bindNotificationsSocketStateListener = () => {
    if (notificationsSocketStateHandler) return;

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (!connection || typeof connection.bind !== "function") return;

    notificationsSocketStateHandler = (states: any) => {
      const currentState = String(states?.current ?? connection?.state ?? "");
      if (currentState === "connected") {
        const adminId = String(adminAuthStore.user?.id ?? "").trim();
        if (adminId !== "") {
          subscribeToNotifications(adminId);
        }
        return;
      }

      if (currentState === "failed" || currentState === "unavailable" || currentState === "disconnected") {
        reconnectNotificationsSocketTransport();
      }
    };

    connection.bind("state_change", notificationsSocketStateHandler);
  };

  const unbindNotificationsSocketStateListener = () => {
    if (!notificationsSocketStateHandler) return;

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (connection && typeof connection.unbind === "function") {
      connection.unbind("state_change", notificationsSocketStateHandler);
    }

    notificationsSocketStateHandler = null;
  };

  const startNotificationsRealtimeRetry = () => {
    if (notificationsRealtimeRetryTimer) return;

    notificationsRealtimeRetryTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      reconnectNotificationsSocketTransport();
      const adminId = String(adminAuthStore.user?.id ?? "").trim();
      if (adminId !== "") {
        subscribeToNotifications(adminId);
      }
    }, NOTIFICATIONS_REALTIME_RETRY_MS);
  };

  const stopNotificationsRealtimeRetry = () => {
    if (!notificationsRealtimeRetryTimer) return;

    clearInterval(notificationsRealtimeRetryTimer);
    notificationsRealtimeRetryTimer = null;
  };

  const startNotificationsPolling = () => {
    if (notificationsPollTimer) return;

    notificationsPollTimer = setInterval(async () => {
      if (!hasAccessToken()) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      const newUnreadItems = await loadNotifications({ showToastsForNew: true });
      if (
        isWithdrawalRequestsRoute.value &&
        newUnreadItems.some(item => item.type === "payments.withdrawal.created" && !item.wasRead)
      ) {
        await markNotificationsByTypes(["payments.withdrawal.created"]);
      }
    }, NOTIFICATIONS_POLL_MS);
  };

  const stopNotificationsPolling = () => {
    if (!notificationsPollTimer) return;

    clearInterval(notificationsPollTimer);
    notificationsPollTimer = null;
  };

  const formatNotificationTime = (value: string | null): string => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(locale.value, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  watch(
    () => isOpen.value,
    async opened => {
      if (!opened || notificationsLoaded.value) return;
      await loadNotifications();
    }
  );

  const handleMarkedByTypes = (payload?: { types?: string[]; summary?: Record<string, unknown> }) => {
    const types = Array.isArray(payload?.types) ? payload?.types.map(item => String(item ?? "").trim()).filter(Boolean) : [];
    if (types.length > 0) {
      notifications.value = notifications.value.map(item =>
        types.includes(item.type) ? { ...item, wasRead: true } : item
      );
    }

    adminNotificationsStore.applySummary(payload?.summary ?? {});
  };

  watch(
    () => adminAuthStore.user?.id,
    userId => {
      const normalized = String(userId || "").trim();
      if (normalized === "") {
        unsubscribeFromNotifications();
        adminNotificationsStore.reset();
        notifications.value = [];
        knownNotificationIds.value = new Set();
        stopNotificationsPolling();
        return;
      }

      subscribeToNotifications(normalized);
      startNotificationsRealtimeRetry();
      startNotificationsPolling();
    }
  );

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    useEventBus.on(ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, handleMarkedByTypes);

    void (async () => {
      if (!hasAccessToken()) return;

      try {
        await adminAuthStore.initAuth();
      } catch {
        return;
      }

      await loadNotifications();
      await loadUnreadSummary();
      const adminId = String(adminAuthStore.user?.id ?? "").trim();
      if (adminId !== "") {
        subscribeToNotifications(adminId);
      }
      bindNotificationsSocketStateListener();
      startNotificationsRealtimeRetry();
      startNotificationsPolling();
    })();
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    useEventBus.off(ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, handleMarkedByTypes);
    unsubscribeFromNotifications();
    unbindNotificationsSocketStateListener();
    stopNotificationsRealtimeRetry();
    stopNotificationsPolling();
  });
</script>

<style scoped lang="scss">
  .router-link-exact-active {
    opacity: 0.5;
  }

  .header {
    width: 100%;

    nav {
      height: 60px;
      display: flex;
      padding: 0 24px;
      align-items: center;
      border-bottom: 1px solid var(--color-stroke-ui-light);
      justify-content: space-between;
    }

    &__menu {
      width: 100%;
      display: flex;
      justify-content: flex-start;

      &-left {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      &-right {
        display: flex;
        align-items: center;
        margin-left: auto;
      }
    }

    &__breadcrumbs {
      min-width: 0;
      flex: 1;
    }

    &__burger {
      display: none;
      width: 36px;
      height: 36px;
      border: 1px solid var(--color-stroke-ui-light);
      border-radius: 10px;
      background: transparent;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 4px;
      padding: 0;
      flex-shrink: 0;

      span {
        display: block;
        width: 16px;
        height: 2px;
        border-radius: 999px;
        background: var(--ui-text-main);
      }
    }
  }

  @media (max-width: 1023px) {
    .header {
      nav {
        padding: 0 20px;
      }

      &__burger {
        display: inline-flex;
      }
    }
  }
</style>
