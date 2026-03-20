<template>
  <header class="side-bar-cabinet">
    <div class="side-bar-cabinet__top">
      <div class="side-bar-cabinet__top__logo">
        <NuxtLink :to="localePath('/')">
          <UiIconLogo
            :class="{
              'svg-invert': isThemeLight,
            }" />
        </NuxtLink>
      </div>
      <button
        class="side-bar-cabinet__close"
        type="button"
        aria-label="Close menu"
        @click="emit('close')">
        ×
      </button>
    </div>

    <div class="side-bar-cabinet__content">
      <AdminSidebarMenu
        :supportUnreadCount="supportUnreadCount"
        :withdrawalRequestsUnreadCount="adminNotificationsStore.unreadWithdrawalRequestsCount" />
    </div>

    <div class="side-bar-cabinet__logout">
      <UiIconLogout
        @click="handleClickLogout"
        :class="{
          'svg-invert': isThemeLight,
        }" />
    </div>
  </header>
</template>

<script lang="ts" setup>
  import { computed, h, onBeforeUnmount, onMounted, ref } from "vue";
  import { navigateTo, useNuxtApp } from "nuxt/app";
  import { useRoute } from "vue-router";
  import { useToast } from "vue-toastification";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import { useAdminNotificationsStore } from "~/stores/adminNotificationsStore";
  import { useThemeStore } from "~/stores/themeStore.js";
  import { useLocalePath } from "~/.nuxt/imports";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";

  import AdminSidebarMenu from "~/components/block/AdminSidebarMenu.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconLogout from "~/components/ui/UiIconLogout.vue";

  const emit = defineEmits(["close"]);

  const adminAuthStore = useAdminAuthStore();
  const adminNotificationsStore = useAdminNotificationsStore();
  const appCore = useAppCore();
  const localePath = useLocalePath();
  const themeStore = useThemeStore();
  const supportUnreadCount = ref(0);
  const SUPPORT_BADGE_REFRESH_MS = 3000;
  const SUPPORT_REALTIME_RETRY_MS = 5000;
  const SUPPORT_UNREAD_UPDATED_EVENT = "support-unread-updated";
  const SUPPORT_ACTIVE_TICKET_CHANGED_EVENT = "support-active-ticket-changed";
  const route = useRoute();
  const toast = useToast();
  const { $echo } = useNuxtApp() as { $echo?: any };
  const activeSupportTicketId = ref("");
  const isSupportChatOpen = ref(false);
  const currentAdminId = ref("");
  const lastUnreadPreviewMessageId = ref("");
  const unreadSnapshotInitialized = ref(false);
  const canReadSupportUnread = computed(
    () => adminAuthStore.hasPermission("view-support-unread") || adminAuthStore.hasPermission("view-support")
  );
  let supportBadgeTimer: ReturnType<typeof setInterval> | null = null;
  let supportUnreadRafId: number | null = null;
  let supportRealtimeChannel: any = null;
  let supportRealtimeRetryTimer: ReturnType<typeof setInterval> | null = null;
  let supportSocketStateHandler: ((states: any) => void) | null = null;
  let supportResumeListenersAttached = false;

  const handleClickLogout = async () => {
    await adminAuthStore.authLogout();
  };

  const isThemeLight = computed(() => {
    return themeStore.currentTheme !== "dark";
  });

  const loadSupportUnreadCount = async () => {
    if (!canReadSupportUnread.value) {
      supportUnreadCount.value = 0;
      return;
    }

    try {
      const response = await appCore.adminModules.tickets.getUnreadSummary();
      const responseData = response?.data?.data ?? response?.data ?? {};
      const count = Number(responseData?.unread_messages_count ?? 0);
      const latestUnreadMessage = responseData?.latest_unread_message ?? null;
      const latestUnreadMessageId = normalizeText(latestUnreadMessage?.id);
      supportUnreadCount.value = Number.isFinite(count) ? Math.max(0, count) : 0;

      if (!unreadSnapshotInitialized.value) {
        unreadSnapshotInitialized.value = true;
        lastUnreadPreviewMessageId.value = latestUnreadMessageId;
        return;
      }

      if (latestUnreadMessageId && latestUnreadMessageId !== lastUnreadPreviewMessageId.value) {
        handleSupportMessageToast(latestUnreadMessage);
      }

      lastUnreadPreviewMessageId.value = latestUnreadMessageId;
    } catch {}
  };

  const startSupportBadgeRefresh = () => {
    if (!canReadSupportUnread.value) return;
    if (supportBadgeTimer) return;

    supportBadgeTimer = setInterval(() => {
      loadSupportUnreadCount().catch(() => {});
    }, SUPPORT_BADGE_REFRESH_MS);
  };

  const stopSupportBadgeRefresh = () => {
    if (!supportBadgeTimer) return;

    clearInterval(supportBadgeTimer);
    supportBadgeTimer = null;
  };

  const handleSupportUnreadUpdated = () => {
    if (supportUnreadRafId !== null) return;

    supportUnreadRafId = window.requestAnimationFrame(() => {
      supportUnreadRafId = null;
      loadSupportUnreadCount().catch(() => {});
    });
  };

  const normalizeText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

  const parseJsonObject = (value: unknown): Record<string, any> | null => {
    if (typeof value !== "string") return null;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : null;
    } catch {
      return null;
    }
  };

  const unwrapSupportMessagePayload = (payload?: any) => {
    if (!payload) return payload;

    const parsedPayload =
      typeof payload === "string" ? parseJsonObject(payload) : payload && typeof payload === "object" ? payload : null;
    if (!parsedPayload) return payload;

    const parsedDataLayer =
      parsedPayload?.data && typeof parsedPayload.data === "object"
        ? parsedPayload.data
        : (parseJsonObject(parsedPayload?.data) ?? parsedPayload);
    const parsedMessageLayer =
      parsedDataLayer?.message && typeof parsedDataLayer.message === "object"
        ? parsedDataLayer.message
        : parseJsonObject(parsedDataLayer?.message);

    if (!parsedMessageLayer) {
      return {
        ...parsedDataLayer,
        ticket_id:
          parsedDataLayer?.ticket_id ??
          parsedDataLayer?.ticketId ??
          parsedDataLayer?.meta?.ticket_id ??
          parsedDataLayer?.meta?.ticketId,
        ticketId:
          parsedDataLayer?.ticketId ??
          parsedDataLayer?.ticket_id ??
          parsedDataLayer?.meta?.ticketId ??
          parsedDataLayer?.meta?.ticket_id,
      };
    }

    return {
      ...parsedMessageLayer,
      ticket_id:
        parsedMessageLayer?.ticket_id ??
        parsedMessageLayer?.ticketId ??
        parsedDataLayer?.ticket_id ??
        parsedDataLayer?.ticketId ??
        parsedMessageLayer?.meta?.ticket_id ??
        parsedMessageLayer?.meta?.ticketId,
      ticketId:
        parsedMessageLayer?.ticketId ??
        parsedMessageLayer?.ticket_id ??
        parsedDataLayer?.ticketId ??
        parsedDataLayer?.ticket_id ??
        parsedMessageLayer?.meta?.ticketId ??
        parsedMessageLayer?.meta?.ticket_id,
    };
  };

  const getRouteSupportTicketId = (): string => {
    const match = String(route.path ?? "").match(/\/support\/([^/?#]+)/);
    return normalizeText(match?.[1] ?? "");
  };

  const resolveSenderName = (payload: any): string => {
    const firstName = normalizeText(payload?.author_first_name);
    const lastName = normalizeText(payload?.author_last_name);
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;

    const author = normalizeText(payload?.author);
    if (author) return author;

    const email = normalizeText(payload?.author_email);
    if (email) return email;

    return "Support";
  };

  const resolveAvatarFallback = (senderName: string, payload: any): string => {
    const initials = normalizeText(payload?.author_initials)
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 2)
      .toUpperCase();
    if (initials.length === 2) return initials;

    const nameParts = senderName.split(/\s+/).filter(Boolean);
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    if (nameParts.length === 1) {
      return nameParts[0].slice(0, 2).toUpperCase();
    }

    const email = normalizeText(payload?.author_email);
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }

    return "SU";
  };

  const truncate = (text: string, max = 120): string => {
    if (text.length <= max) return text;
    return `${text.slice(0, max)}...`;
  };

  const handleSupportActiveTicketChanged = (payload?: any) => {
    const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    const ticketId = normalizeText(data?.ticketId ?? data?.ticket_id);
    activeSupportTicketId.value = ticketId;
    const isOpenState = typeof data?.isOpen === "boolean" ? data.isOpen : Boolean(ticketId);
    isSupportChatOpen.value = isOpenState && Boolean(ticketId);
  };

  const handleSupportMessageToast = (payload?: any) => {
    const messagePayload = unwrapSupportMessagePayload(payload);
    const messageId = normalizeText(messagePayload?.id);
    if (messageId) {
      lastUnreadPreviewMessageId.value = messageId;
    }

    const ticketId = normalizeText(messagePayload?.ticket_id ?? messagePayload?.ticketId);
    if (!ticketId) return;

    const messageType = normalizeText(messagePayload?.type).toLowerCase();
    const messageMeta =
      messagePayload && typeof messagePayload.meta === "object"
        ? (messagePayload.meta as Record<string, unknown>)
        : null;
    const metaEvent = normalizeText(messageMeta?.event ?? "");
    if (messageType === "system" && metaEvent === "participant_added") {
      const addedAdminIds = Array.isArray(messageMeta?.added_admin_ids)
        ? messageMeta?.added_admin_ids.map(value => normalizeText(value)).filter(Boolean)
        : [];

      if (currentAdminId.value && !addedAdminIds.includes(currentAdminId.value)) {
        return;
      }
    }

    const routeTicketId = getRouteSupportTicketId();
    const isRouteTicketOpened = routeTicketId === ticketId;
    const isActiveTicketOpened = isSupportChatOpen.value && ticketId === activeSupportTicketId.value;
    if (isRouteTicketOpened || isActiveTicketOpened) return;

    const senderName = resolveSenderName(messagePayload);
    const preview = truncate(normalizeText(messagePayload?.body) || "New message");
    const avatarUrl = normalizeText(messagePayload?.author_photo_url);
    const avatarFallback = resolveAvatarFallback(senderName, messagePayload);

    toast.info(
      h("div", { style: { display: "flex", alignItems: "center", gap: "10px", minWidth: "0", cursor: "pointer" } }, [
        h(
          "div",
          {
            style: {
              width: "34px",
              height: "34px",
              borderRadius: "999px",
              overflow: "hidden",
              flexShrink: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--ui-primary-main)",
              color: "var(--ui-text-main)",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
            },
          },
          avatarUrl
            ? h("img", {
                src: avatarUrl,
                alt: senderName,
                style: { width: "100%", height: "100%", objectFit: "cover" },
              })
            : avatarFallback
        ),
        h("div", { style: { minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" } }, [
          h(
            "div",
            {
              style: {
                fontSize: "13px",
                lineHeight: "1.2",
                fontWeight: "700",
                color: "var(--ui-text-main)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            },
            senderName
          ),
          h(
            "div",
            {
              style: {
                fontSize: "12px",
                lineHeight: "1.2",
                color: "var(--ui-text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            },
            preview
          ),
        ]),
      ]),
      {
        id: `support-message-${normalizeText(messagePayload?.id) || ticketId}-${normalizeText(messagePayload?.created_at)}`,
        timeout: 8000,
        closeOnClick: true,
        pauseOnHover: true,
        onClick: () => {
          navigateTo(localePath(`/support/${ticketId}`));
        },
      }
    );
  };

  const handleSupportGlobalMessage = (payload?: any) => {
    handleSupportUnreadUpdated();
    handleSupportMessageToast(payload);
  };

  const handleSupportGlobalRead = () => {
    handleSupportUnreadUpdated();
  };

  const resolveEchoClient = () => {
    if ($echo && typeof $echo.private === "function") return $echo;
    if (typeof window !== "undefined") {
      const fallbackEcho = (window as any).Echo;
      if (fallbackEcho && typeof fallbackEcho.private === "function") {
        return fallbackEcho;
      }
    }
    return null;
  };

  const reconnectSupportSocketTransport = () => {
    const echoClient = resolveEchoClient();
    const pusher = echoClient?.connector?.pusher;
    const state = String(pusher?.connection?.state ?? "");
    if (!pusher) return;

    if (state === "disconnected" || state === "failed" || state === "unavailable") {
      try {
        pusher.connect();
      } catch {
        // noop
      }
    }
  };

  const connectSupportRealtime = () => {
    if (!canReadSupportUnread.value) return;
    const echoClient = resolveEchoClient();
    if (!echoClient) return;

    reconnectSupportSocketTransport();
    const channel = echoClient.private("support.global");
    channel.stopListening(".MessageSent", handleSupportGlobalMessage);
    channel.stopListening("MessageSent", handleSupportGlobalMessage);
    channel.stopListening(".App\\Events\\MessageSent", handleSupportGlobalMessage);
    channel.stopListening("App\\Events\\MessageSent", handleSupportGlobalMessage);
    channel.stopListening(".MessageRead", handleSupportGlobalRead);
    channel.stopListening("MessageRead", handleSupportGlobalRead);
    channel.stopListening(".App\\Events\\MessageRead", handleSupportGlobalRead);
    channel.stopListening("App\\Events\\MessageRead", handleSupportGlobalRead);
    channel.listen(".MessageSent", handleSupportGlobalMessage);
    channel.listen("MessageSent", handleSupportGlobalMessage);
    channel.listen(".App\\Events\\MessageSent", handleSupportGlobalMessage);
    channel.listen("App\\Events\\MessageSent", handleSupportGlobalMessage);
    channel.listen(".MessageRead", handleSupportGlobalRead);
    channel.listen("MessageRead", handleSupportGlobalRead);
    channel.listen(".App\\Events\\MessageRead", handleSupportGlobalRead);
    channel.listen("App\\Events\\MessageRead", handleSupportGlobalRead);
    supportRealtimeChannel = channel;
  };

  const bindSupportSocketStateListener = () => {
    if (!canReadSupportUnread.value) return;
    if (supportSocketStateHandler) return;
    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (!connection || typeof connection.bind !== "function") return;

    supportSocketStateHandler = (states: any) => {
      const currentState = String(states?.current ?? connection?.state ?? "");
      if (currentState === "connected") {
        connectSupportRealtime();
        return;
      }

      if (currentState === "failed" || currentState === "unavailable" || currentState === "disconnected") {
        reconnectSupportSocketTransport();
      }
    };

    connection.bind("state_change", supportSocketStateHandler);
  };

  const unbindSupportSocketStateListener = () => {
    if (!supportSocketStateHandler) return;

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (connection && typeof connection.unbind === "function") {
      connection.unbind("state_change", supportSocketStateHandler);
    }
    supportSocketStateHandler = null;
  };

  const disconnectSupportRealtime = () => {
    if (!supportRealtimeChannel) return;
    supportRealtimeChannel.stopListening(".MessageSent", handleSupportGlobalMessage);
    supportRealtimeChannel.stopListening("MessageSent", handleSupportGlobalMessage);
    supportRealtimeChannel.stopListening(".App\\Events\\MessageSent", handleSupportGlobalMessage);
    supportRealtimeChannel.stopListening("App\\Events\\MessageSent", handleSupportGlobalMessage);
    supportRealtimeChannel.stopListening(".MessageRead", handleSupportGlobalRead);
    supportRealtimeChannel.stopListening("MessageRead", handleSupportGlobalRead);
    supportRealtimeChannel.stopListening(".App\\Events\\MessageRead", handleSupportGlobalRead);
    supportRealtimeChannel.stopListening("App\\Events\\MessageRead", handleSupportGlobalRead);
    supportRealtimeChannel = null;
  };

  const startSupportRealtimeRetry = () => {
    if (!canReadSupportUnread.value) return;
    if (supportRealtimeRetryTimer) return;

    supportRealtimeRetryTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      reconnectSupportSocketTransport();
      bindSupportSocketStateListener();
      connectSupportRealtime();
      loadSupportUnreadCount().catch(() => {});
    }, SUPPORT_REALTIME_RETRY_MS);
  };

  const stopSupportRealtimeRetry = () => {
    if (!supportRealtimeRetryTimer) return;

    clearInterval(supportRealtimeRetryTimer);
    supportRealtimeRetryTimer = null;
  };

  const handleSupportRealtimeResume = () => {
    if (!canReadSupportUnread.value) return;
    reconnectSupportSocketTransport();
    bindSupportSocketStateListener();
    connectSupportRealtime();
    loadSupportUnreadCount().catch(() => {});
  };

  const handleSupportVisibilityChange = () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    handleSupportRealtimeResume();
  };

  const handleSupportOnline = () => {
    handleSupportRealtimeResume();
  };

  const handleSupportPageShow = () => {
    handleSupportRealtimeResume();
  };

  const attachSupportResumeListeners = () => {
    if (!canReadSupportUnread.value) return;
    if (supportResumeListenersAttached) return;
    document.addEventListener("visibilitychange", handleSupportVisibilityChange);
    window.addEventListener("online", handleSupportOnline);
    window.addEventListener("pageshow", handleSupportPageShow);
    supportResumeListenersAttached = true;
  };

  const detachSupportResumeListeners = () => {
    if (!supportResumeListenersAttached) return;
    document.removeEventListener("visibilitychange", handleSupportVisibilityChange);
    window.removeEventListener("online", handleSupportOnline);
    window.removeEventListener("pageshow", handleSupportPageShow);
    supportResumeListenersAttached = false;
  };

  onMounted(async () => {
    await loadSupportUnreadCount();
    const routeTicketId = getRouteSupportTicketId();
    activeSupportTicketId.value = routeTicketId;
    isSupportChatOpen.value = Boolean(routeTicketId);
    try {
      const authUserResponse = await appCore.adminModules.auth.getAuthUser();
      currentAdminId.value = normalizeText(authUserResponse?.data?.id);
    } catch {
      currentAdminId.value = "";
    }
    useEventBus.on(SUPPORT_UNREAD_UPDATED_EVENT, handleSupportUnreadUpdated);
    useEventBus.on(SUPPORT_ACTIVE_TICKET_CHANGED_EVENT, handleSupportActiveTicketChanged);
    startSupportBadgeRefresh();
    connectSupportRealtime();
    bindSupportSocketStateListener();
    attachSupportResumeListeners();
    startSupportRealtimeRetry();
    handleSupportRealtimeResume();
  });

  onBeforeUnmount(() => {
    useEventBus.off(SUPPORT_UNREAD_UPDATED_EVENT, handleSupportUnreadUpdated);
    useEventBus.off(SUPPORT_ACTIVE_TICKET_CHANGED_EVENT, handleSupportActiveTicketChanged);
    stopSupportBadgeRefresh();
    stopSupportRealtimeRetry();
    disconnectSupportRealtime();
    unbindSupportSocketStateListener();
    detachSupportResumeListeners();
    if (supportUnreadRafId !== null) {
      window.cancelAnimationFrame(supportUnreadRafId);
      supportUnreadRafId = null;
    }
  });
</script>

<style lang="scss" scoped>
  .side-bar-cabinet {
    color: white;
    height: 100vh;
    width: 264px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 30px;
    border-right: 1px solid var(--color-stroke-ui-light);
    background-color: var(--ui-background-sidebar);
    z-index: 1;

    box-shadow: 0 0 5px -1px rgba(255, 249, 249, 0.1);
    transition: 0.5s;

    &:hover {
      transition: 0.3s;
      box-shadow: 0 0 5px 1px var(--ui-background-sidebar);
    }

    &__top {
      overflow: hidden;
      height: auto;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      flex-direction: column;

      &__logo {
        height: 60px;
        width: 100%;
        padding: 0 30px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }

      &__profile {
        &__image {
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 62px;
          width: 62px;
          border: 3px solid var(--color-stroke-ui);
          border-radius: 25%;

          img {
            width: 60px;
            height: 58px;
            object-fit: cover;
            border-radius: 23%;
          }

          &.active {
            border-color: var(--ui-primary-accent);
          }
        }

        &__name {
          margin-top: 15px;
          width: 100%;
          font-size: 13px;
        }
      }
    }

    &__content {
      padding: 10px;
      height: calc(100vh - 160px);
      overflow-y: scroll;
      width: 100%;

      display: flex;
      align-items: flex-start;

      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        width: 0;
        height: 0;
        background: transparent;
      }
    }

    &__actions {
      height: 72px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      // padding: 0 10px;
    }

    &__logout {
      height: 72px;
      width: 100%;

      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border-top: 1px solid var(--color-stroke-ui);

      padding: 10px;
    }
  }

  .svg-invert {
    filter: invert(1);
  }

  @keyframes shadowPulse {
    0% {
      box-shadow: 0 0 1px -1px var(--color-stroke-ui);
    }
    100% {
      box-shadow: 0 0 5px 1px var(--color-stroke-ui);
    }
  }

  .icon {
    cursor: pointer;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .side-bar-cabinet__close {
    display: none;
    height: 36px;
    width: 36px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui);
    background: transparent;
    color: var(--ui-text-main);
    font-size: 20px;
    line-height: 1;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  @media (max-width: 1023px) {
    .side-bar-cabinet__top {
      position: relative;
    }

    .side-bar-cabinet__close {
      display: inline-flex;
      position: absolute;
      right: 16px;
      top: 12px;
    }
  }
</style>
