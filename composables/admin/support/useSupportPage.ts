import { computed, h, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useNuxtApp } from "nuxt/app";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import { useLocalePath } from "~/.nuxt/imports";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import type { SupportPanelProps, SupportViewMode } from "~/composables/admin/support/components/SupportPanel";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

export function useSupportPage() {
  const ORDER_DIRECTION_ASC = "asc";
  const ORDER_DIRECTION_DESC = "desc";
  const SUPPORT_UNREAD_UPDATED_EVENT = "support-unread-updated";
  const SUPPORT_PRESENCE_UPDATED_EVENT = "support-presence-updated";
  const { $echo } = useNuxtApp() as { $echo?: any };
  const { t } = useI18n({ useScope: "global" });
  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const supportListText = computed(() => ({
    searchPlaceholder: resolveText("admin.support.searchPlaceholder", "Search"),
    client: resolveText("admin.support.client", "Client"),
    ticket: resolveText("admin.support.ticket", "Ticket"),
    lastUpdate: resolveText("admin.support.lastUpdate", "Last update"),
    admins: resolveText("admin.support.admins", "Admins"),
    status: resolveText("admin.support.status", "Status"),
    actions: resolveText("admin.support.actions", "Actions"),
    active: resolveText("admin.support.active", "Active"),
    archived: resolveText("admin.support.archived", "Archived"),
    noMessages: resolveText("admin.support.noMessages", "No messages yet"),
    noTickets: resolveText("admin.support.noTickets", "No tickets found"),
    none: resolveText("admin.support.none", "None"),
    noAdmins: resolveText("admin.support.noAdmins", "No admins"),
    openProfile: resolveText("admin.support.openProfile", "Open profile"),
    copyId: resolveText("admin.support.copyId", "Copy ID"),
    more: resolveText("admin.support.more", "More"),
    archive: resolveText("admin.support.archive", "Archive"),
    archiveConfirm: resolveText("admin.support.archiveConfirm", "Archive this ticket?"),
    archivedToast: resolveText("admin.support.archivedToast", "Ticket archived."),
    archiveFailed: resolveText("admin.support.archiveFailed", "Failed to archive ticket."),
    perPage: resolveText("admin.support.perPage", "Per page:"),
    created: resolveText("admin.support.created", "Created"),
    createdEmpty: resolveText("admin.support.createdEmpty", "Created -"),
    sortLastCreated: resolveText("admin.support.sortLastCreated", "Last created"),
    sortLastUpdated: resolveText("admin.support.sortLastUpdated", "Last updated"),
    statusOpen: resolveText("admin.support.statusOpen", "Open"),
    statusPending: resolveText("admin.support.statusPending", "Pending"),
    statusCompleted: resolveText("admin.support.statusCompleted", "Completed"),
    statusInProgress: resolveText("admin.support.statusInProgress", "In progress"),
    statusWaiting: resolveText("admin.support.statusWaiting", "Waiting"),
    complete: resolveText("admin.support.complete", "Complete"),
    completeConfirm: resolveText("admin.support.completeConfirm", "Complete this ticket?"),
    statusUpdated: resolveText("admin.support.statusUpdated", "Ticket status updated."),
    statusUpdateFailed: resolveText("admin.support.statusUpdateFailed", "Failed to update ticket status."),
    email: resolveText("admin.support.email", "Email"),
    chat: resolveText("admin.support.chat", "Chat"),
    roleAdmin: resolveText("support.chat.roleAdmin", "Admin"),
    roleClient: resolveText("support.chat.roleClient", "Client"),
  }));

  const tickets = reactive([]);

  const currentUser = reactive({
    id: null,
    linkedUserId: null,
    name: null,
    firstName: null,
    lastName: null,
    email: null,
    photoUrl: null,
  });

  const sortByFilterData = computed(() => [
    {
      id: "created_at",
      value: "created_at",
      text: supportListText.value.sortLastCreated,
    },
    {
      id: "last_message_at",
      value: "last_message_at",
      text: supportListText.value.sortLastUpdated,
    },
    {
      id: "status",
      value: "status",
      text: supportListText.value.status,
    },
  ]);
  const toast = useToast();

  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const router = useRouter();
  const localePath = useLocalePath();
  const canUpdateSupport = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-support")
  );
  const canDeleteSupport = computed(
    () =>
      adminAuthStore.hasRole("super-admin") ||
      adminAuthStore.hasPermission("delete-support") ||
      adminAuthStore.hasPermission("update-support")
  );

  const isLoading = ref(false);
  const search = ref("");
  const total = ref(0);
  const perPage = ref(7);
  const currentPage = ref(1);
  const orderBy = ref("last_message_at");
  const orderDirection = ref(ORDER_DIRECTION_DESC);
  const currentRowActiveOptions = ref<number | null>(null);
  const ticketActionLoadingId = ref("");
  const activeAdminPopoverKey = ref("");
  const showArchived = ref(false);
  const VIEW_MODE_STORAGE_KEY = "admin_support_view_mode";
  const ADMIN_SUPPORT_LIST_REFRESH_MS = 60000;
  const SUPPORT_REALTIME_RETRY_MS = 30000;
  const viewMode = ref<"table" | "cards" | "full">("table");
  const isMobileViewport = ref(false);
  const viewOptions = [
    {
      value: "table" as const,
      label: t("cabinet.billing.view.list") || "List",
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
              h("line", { x1: "3", y1: "6", x2: "4", y2: "6" }),
              h("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
              h("line", { x1: "3", y1: "12", x2: "4", y2: "12" }),
              h("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
              h("line", { x1: "3", y1: "18", x2: "4", y2: "18" }),
            ]
          );
        },
      },
    },
    {
      value: "cards" as const,
      label: t("cabinet.billing.view.cards") || "Cards",
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }),
            ]
          );
        },
      },
    },
    {
      value: "full" as const,
      label: t("cabinet.billing.view.full") || "Full width",
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("rect", { x: "3", y: "6", width: "18", height: "4", rx: "1" }),
              h("rect", { x: "3", y: "14", width: "18", height: "4", rx: "1" }),
            ]
          );
        },
      },
    },
  ];
  const perPageList = reactive([
    { id: 1, value: 1, text: "1" },
    { id: 2, value: 2, text: "2" },
    { id: 3, value: 3, text: "3" },
    { id: 4, value: 4, text: "4" },
    { id: 5, value: 5, text: "5" },
    { id: 6, value: 6, text: "6" },
    { id: 7, value: 7, text: "7" },
    { id: 8, value: 8, text: "8" },
    { id: 9, value: 9, text: "9" },
    { id: 10, value: 10, text: "10" },
    { id: 12, value: 12, text: "12" },
    { id: 15, value: 15, text: "15" },
    { id: 20, value: 20, text: "20" },
    { id: 25, value: 25, text: "25" },
    { id: 50, value: 50, text: "50" },
    { id: 100, value: 100, text: "100" },
  ]);

  const totalPages = computed(() => Math.ceil(total.value / perPage.value));

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    let start = Math.max(1, currentPage.value - half);
    let end = Math.min(totalPages.value, start + maxPagesToShow - 1);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  async function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      await loadData();
    }
  }

  async function goPrev() {
    if (currentPage.value > 1) {
      currentPage.value--;
      await loadData();
    }
  }

  async function goNext() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      await loadData();
    }
  }

  // ---

  const currentTicketIdForChat = ref<string | null>(null);
  const currentChatTicket = computed(
    () => tickets.find((ticket: any) => String(ticket?.id ?? "") === String(currentTicketIdForChat.value ?? "")) ?? null
  );

  const filtered = computed(() =>
    tickets.filter(t =>
      `${t.id} ${t.subject} ${getTicketPreview(t)} ${getTicketClientName(t)} ${getTicketClientEmail(t)} ${t.last_message_at} ${t.status} ${t.channel ?? ""} ${t.source ?? ""} ${t.reply_email ?? ""}`
        .toLowerCase()
        .includes(search.value.toLowerCase())
    )
  );

  const getTicketChannelKey = (channel: unknown, replyEmail?: unknown): "chat" | "email" => {
    const normalizedChannel = String(channel ?? "")
      .trim()
      .toLowerCase();

    const normalizedReplyEmail = String(replyEmail ?? "").trim();
    if (!normalizedChannel && normalizedReplyEmail) {
      return "email";
    }

    return normalizedChannel === "email" ? "email" : "chat";
  };

  const getTicketChannelLabel = (channel: unknown, replyEmail?: unknown): string =>
    getTicketChannelKey(channel, replyEmail) === "email" ? supportListText.value.email : supportListText.value.chat;

  const getTicketChannelBadgeClass = (channel: unknown, replyEmail?: unknown): string =>
    getTicketChannelKey(channel, replyEmail) === "email" ? "ticket-channel-badge--email" : "ticket-channel-badge--chat";

  const getTicketSourceKey = (ticket: any): "cabinet" | "landing" | "admin" => {
    const source = String(ticket?.source ?? "")
      .trim()
      .toLowerCase();

    if (source === "landing") return "landing";
    if (source === "admin") return "admin";

    return "cabinet";
  };

  const getTicketSourceLabel = (ticket: any): string => {
    const label = String(ticket?.source_label ?? "").trim();
    if (label) return label;

    const source = getTicketSourceKey(ticket);
    if (source === "landing") return "Landing";
    if (source === "admin") return "Admin";

    return "Cabinet";
  };

  const getTicketSourceBadgeClass = (ticket: any): string => `ticket-source-badge--${getTicketSourceKey(ticket)}`;

  const normalizeTicketStatus = (status: unknown): string => {
    const normalizedStatus = String(status ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    if (normalizedStatus === "resolved") {
      return "closed";
    }

    return normalizedStatus || "open";
  };

  const getTicketRawStatus = (ticketOrStatus: unknown): unknown =>
    typeof ticketOrStatus === "object" && ticketOrStatus !== null
      ? (ticketOrStatus as { status?: unknown }).status
      : ticketOrStatus;

  const isTicketCompleted = (ticketOrStatus: unknown): boolean => {
    const normalizedStatus = normalizeTicketStatus(getTicketRawStatus(ticketOrStatus));
    return ["closed", "resolved"].includes(normalizedStatus);
  };

  const hasAssignedAdmin = (ticket: any): boolean => {
    if (!ticket || typeof ticket !== "object") return false;

    if (Number(ticket.agent_participants_count ?? 0) > 0) {
      return true;
    }

    return Array.isArray(ticket.participants)
      ? ticket.participants.some((participant: any) => {
          const role = String(participant?.role_key ?? participant?.role ?? "")
            .trim()
            .toLowerCase();
          return role === "agent" || role === "admin";
        })
      : false;
  };

  const getTicketStatusLabel = (ticketOrStatus: unknown): string => {
    const normalizedStatus = normalizeTicketStatus(getTicketRawStatus(ticketOrStatus));
    if (normalizedStatus === "closed") return supportListText.value.statusCompleted;
    if (normalizedStatus === "archived") return supportListText.value.archived;
    if (typeof ticketOrStatus === "object" && ticketOrStatus !== null && !hasAssignedAdmin(ticketOrStatus)) {
      return supportListText.value.statusWaiting;
    }
    if (["open", "pending", "in_progress", "new", "missed"].includes(normalizedStatus)) {
      return supportListText.value.statusInProgress;
    }

    return normalizedStatus.replace(/_/g, " ");
  };

  const getTicketStatusDotClass = (ticketOrStatus: unknown) => {
    const normalizedStatus = normalizeTicketStatus(getTicketRawStatus(ticketOrStatus));
    if (
      !isTicketCompleted(ticketOrStatus) &&
      typeof ticketOrStatus === "object" &&
      ticketOrStatus !== null &&
      !hasAssignedAdmin(ticketOrStatus)
    ) {
      return "bg-[var(--ui-sticker-warning)]";
    }

    if (["open", "in_progress", "active", "closed"].includes(normalizedStatus)) {
      return "bg-[var(--ui-sticker-success)]";
    }

    if (["cancelled", "rejected", "archived"].includes(normalizedStatus)) {
      return "bg-[var(--ui-sticker-danger)]";
    }

    return "bg-[var(--ui-text-secondary)]";
  };

  const getTicketClientAvatarUrl = (ticket: any): string => {
    const rawUrl = ticket?.creator?.photo_url ?? ticket?.creator_photo_url ?? "";
    return typeof rawUrl === "string" ? rawUrl.trim() : "";
  };

  const extractTicketClientInitials = (ticket: any): string => {
    const directInitials = String(ticket?.creator?.initials ?? ticket?.creator_initials ?? "")
      .trim()
      .toUpperCase();
    if (directInitials) {
      return directInitials.slice(0, 2);
    }

    const firstName = String(ticket?.creator?.first_name ?? "").trim();
    const lastName = String(ticket?.creator?.last_name ?? "").trim();
    const fullNameInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase();
    if (fullNameInitials) {
      return fullNameInitials.slice(0, 2);
    }

    const email = String(ticket?.creator?.email ?? ticket?.creator_email ?? "")
      .trim()
      .toUpperCase();
    if (email) {
      return email.slice(0, 2);
    }

    return "CL";
  };

  const getTicketClientInitials = (ticket: any): string => extractTicketClientInitials(ticket);

  const getTicketClientName = (ticket: any): string => {
    const firstName = String(ticket?.creator?.first_name ?? "").trim();
    const lastName = String(ticket?.creator?.last_name ?? "").trim();
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      return fullName;
    }

    const email = String(ticket?.creator?.email ?? ticket?.creator_email ?? "").trim();
    if (email) {
      return email;
    }

    return `${supportListText.value.roleClient} #${String(ticket?.creator_id ?? ticket?.id ?? "")}`;
  };

  const getTicketClientEmail = (ticket: any): string =>
    String(ticket?.creator?.email ?? ticket?.creator_email ?? "").trim();

  const getTicketClientId = (ticket: any): string => String(ticket?.creator?.id ?? ticket?.creator_id ?? "").trim();

  const getTicketPreview = (ticket: any): string => {
    const preview = String(ticket?.latest_message_preview ?? ticket?.last_message_preview ?? ticket?.preview ?? "")
      .replace(/\s+/g, " ")
      .trim();

    return preview;
  };

  const getTicketCreatedLabel = (ticket: any): string => {
    const label = String(ticket?.created_at_label ?? "").trim();
    if (label !== "") return `${supportListText.value.created} ${label}`;

    const createdAt = String(ticket?.created_at ?? "").trim();
    return createdAt !== "" ? `${supportListText.value.created} ${createdAt}` : supportListText.value.createdEmpty;
  };

  const getTicketAdminParticipants = (ticket: any): any[] => {
    const participants = Array.isArray(ticket?.participants) ? ticket.participants : [];

    return participants.filter((participant: any) => {
      const role = String(participant?.role_key ?? participant?.role ?? "")
        .trim()
        .toLowerCase();

      return role === "agent" || role === "admin";
    });
  };

  const getAdminParticipantId = (admin: any): string => String(admin?.admin_id ?? "").trim();

  const getAdminParticipantKey = (ticket: any, admin: any): string =>
    `${String(ticket?.id ?? "")}:${getAdminParticipantId(admin) || String(admin?.id ?? "")}`;

  const getAdminParticipantName = (admin: any): string => {
    const name = String(admin?.admin_name ?? admin?.name ?? "").trim();
    if (name) return name;

    const email = getAdminParticipantEmail(admin);
    if (email) return email;

    return supportListText.value.roleAdmin;
  };

  const getAdminParticipantEmail = (admin: any): string => String(admin?.admin_email ?? admin?.email ?? "").trim();

  const getAdminParticipantInitials = (admin: any): string => {
    const directInitials = String(admin?.initials ?? "")
      .trim()
      .toUpperCase();
    if (directInitials) return directInitials.slice(0, 2);

    const name = getAdminParticipantName(admin)
      .replace(/[^a-zA-Zа-яА-Я0-9\s]/g, "")
      .trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return "AD";
  };

  const getAdminParticipantAvatarUrl = (admin: any): string => String(admin?.photo_url ?? "").trim();

  const isCurrentAdminTicketParticipant = (ticket: any): boolean => {
    if (!ticket) return false;

    const currentAdminId = String(currentUser.id ?? "").trim();
    const linkedUserId = String(currentUser.linkedUserId ?? "").trim();

    return getTicketAdminParticipants(ticket).some((admin: any) => {
      const participantId = String(admin?.id ?? "").trim();
      const adminId = String(admin?.admin_id ?? "").trim();

      return Boolean(
        (linkedUserId && participantId === linkedUserId) ||
          (currentAdminId && (adminId === currentAdminId || participantId === currentAdminId))
      );
    });
  };

  let adminSupportListRefreshTimer: ReturnType<typeof setInterval> | null = null;
  let supportGlobalChannel: any = null;
  let supportRealtimeRetryTimer: ReturnType<typeof setInterval> | null = null;
  let supportSocketStateHandler: ((states: any) => void) | null = null;
  let supportResumeListenersAttached = false;
  let reloadQueued = false;
  const supportLoadErrorNotified = ref(false);

  const loadData = async () => {
    if (isLoading.value) {
      reloadQueued = true;
      return;
    }

    do {
      reloadQueued = false;
      isLoading.value = true;
      try {
        const response = await appCore.adminModules.tickets.get({
          search: search.value,
          channel: "all",
          perPage: perPage.value,
          page: currentPage.value,
          orderBy: orderBy.value,
          orderDirection: orderDirection.value,
          archived: showArchived.value ? 1 : 0,
        });

        perPage.value = response.data.meta.per_page;
        currentPage.value = response.data.meta.current_page;
        total.value = response.data.meta.total;

        tickets.splice(0, tickets.length, ...response.data.data);
        supportLoadErrorNotified.value = false;
      } catch (error) {
        console.error("admin support loadData failed", error);
        if (!supportLoadErrorNotified.value) {
          toast.error("Failed to load support tickets.");
          supportLoadErrorNotified.value = true;
        }
      } finally {
        isLoading.value = false;
      }
    } while (reloadQueued);
  };

  const resolveEchoClient = () => {
    if ($echo && typeof $echo.private === "function") {
      return $echo;
    }
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
    const echoClient = resolveEchoClient();
    if (!echoClient || supportGlobalChannel) return;

    reconnectSupportSocketTransport();
    supportGlobalChannel = echoClient.private("support.global");
    supportGlobalChannel.stopListening(".MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening("MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening(".App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening("App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening(".MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening("MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening(".App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening("App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening(".ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening("ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening(".App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening("App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel.listen(".MessageSent", handleSupportListReload);
    supportGlobalChannel.listen("MessageSent", handleSupportListReload);
    supportGlobalChannel.listen(".App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.listen("App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.listen(".MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.listen("MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.listen(".App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.listen("App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.listen(".ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.listen("ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.listen(".App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel.listen("App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
  };

  const disconnectSupportRealtime = () => {
    if (!supportGlobalChannel) return;

    supportGlobalChannel.stopListening(".MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening("MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening(".App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening("App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening(".MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening("MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening(".App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening("App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening(".ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening("ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening(".App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening("App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel = null;
  };

  const bindSupportSocketStateListener = () => {
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

  const startSupportRealtimeRetry = () => {
    if (supportRealtimeRetryTimer) return;

    supportRealtimeRetryTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      reconnectSupportSocketTransport();
      connectSupportRealtime();
    }, SUPPORT_REALTIME_RETRY_MS);
  };

  const stopSupportRealtimeRetry = () => {
    if (!supportRealtimeRetryTimer) return;

    clearInterval(supportRealtimeRetryTimer);
    supportRealtimeRetryTimer = null;
  };

  const handleSupportRealtimeResume = () => {
    reconnectSupportSocketTransport();
    connectSupportRealtime();
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

  const syncCurrentTicketUnreadCount = (ticketId: string, unreadCount: number) => {
    const target = tickets.find((item: any) => String(item.id) === String(ticketId));
    if (!target) return;
    target.unread_messages_count = Math.max(0, unreadCount);
  };

  const syncCurrentTicketCounterpartyOnline = (ticketId: string, counterpartyOnline: boolean) => {
    const target = tickets.find((item: any) => String(item.id) === String(ticketId));
    if (!target) return;
    target.counterparty_online = counterpartyOnline;
  };

  const normalizeSupportUnreadPayload = (payload?: any): { ticketId: string; unread: number } | null => {
    if (!payload || typeof payload !== "object") return null;

    const rawTicketId = payload.ticketId ?? payload.ticket_id;
    const rawUnread = payload.unread ?? payload.unread_count ?? payload.unread_messages_count;
    if (rawTicketId === undefined || rawTicketId === null || rawUnread === undefined || rawUnread === null) return null;

    const normalizedUnread = Number(rawUnread);
    if (!Number.isFinite(normalizedUnread)) return null;

    return {
      ticketId: String(rawTicketId),
      unread: Math.max(0, normalizedUnread),
    };
  };

  const applySupportUnreadPayload = (payload?: any): boolean => {
    const normalizedPayload = normalizeSupportUnreadPayload(payload);
    if (!normalizedPayload) return false;

    syncCurrentTicketUnreadCount(normalizedPayload.ticketId, normalizedPayload.unread);
    return true;
  };

  const normalizeSupportPresencePayload = (payload?: any): { ticketId: string; counterpartyOnline: boolean } | null => {
    if (!payload || typeof payload !== "object") return null;

    const data = payload?.data ?? payload;
    const rawTicketId = data.ticketId ?? data.ticket_id;
    const rawCounterpartyOnline = data.counterparty_online ?? data.counterpartyOnline ?? Boolean(data.online_client);
    if (rawTicketId === undefined || rawTicketId === null || rawCounterpartyOnline === undefined) return null;

    return {
      ticketId: String(rawTicketId),
      counterpartyOnline: Boolean(rawCounterpartyOnline),
    };
  };

  const applySupportPresencePayload = (payload?: any): boolean => {
    const normalizedPayload = normalizeSupportPresencePayload(payload);
    if (!normalizedPayload) return false;

    syncCurrentTicketCounterpartyOnline(normalizedPayload.ticketId, normalizedPayload.counterpartyOnline);
    return true;
  };

  const startAdminSupportListRefresh = () => {
    if (adminSupportListRefreshTimer) return;

    adminSupportListRefreshTimer = setInterval(() => {
      loadData().catch(() => {});
    }, ADMIN_SUPPORT_LIST_REFRESH_MS);
  };

  const stopAdminSupportListRefresh = () => {
    if (!adminSupportListRefreshTimer) return;

    clearInterval(adminSupportListRefreshTimer);
    adminSupportListRefreshTimer = null;
  };

  const syncViewport = () => {
    if (typeof window === "undefined") return;
    isMobileViewport.value = window.innerWidth < 768;
  };

  const handleWindowResize = () => {
    syncViewport();
  };

  const initViewMode = () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved && ["table", "cards", "full"].includes(saved)) {
      viewMode.value = saved as typeof viewMode.value;
    }
  };

  const handleViewModeChange = (mode: string) => {
    if (["table", "cards", "full"].includes(mode)) {
      viewMode.value = mode as typeof viewMode.value;
    }
  };

  watch(viewMode, mode => {
    if (typeof window === "undefined") return;
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  });

  const handleToggleArchived = async () => {
    showArchived.value = !showArchived.value;
    currentPage.value = 1;
    await loadData();
  };

  const handleInputSearch = async (value: string) => {
    search.value = value;
    currentPage.value = 1;
    await loadData();
  };

  const handleClickUpdate = async () => {
    await loadData();
  };

  const closeFloatingTicketControls = () => {
    activeAdminPopoverKey.value = "";
  };

  const setActiveAdminPopoverKey = (key: string): void => {
    activeAdminPopoverKey.value = key;
  };

  const clearActiveAdminPopoverKey = (): void => {
    activeAdminPopoverKey.value = "";
  };

  const toggleAdminPopover = (ticket: any, admin: any) => {
    const key = getAdminParticipantKey(ticket, admin);
    activeAdminPopoverKey.value = activeAdminPopoverKey.value === key ? "" : key;
  };

  const isTicketActionLoading = (ticket: any): boolean =>
    ticketActionLoadingId.value.startsWith(`${String(ticket?.id ?? "")}:`);

  const replaceTicketInList = (nextTicket: any) => {
    const ticketId = String(nextTicket?.id ?? "");
    if (!ticketId) return;

    const index = tickets.findIndex((ticket: any) => String(ticket?.id ?? "") === ticketId);
    if (index < 0) return;

    tickets.splice(index, 1, {
      ...tickets[index],
      ...nextTicket,
    });
  };

  const extractTicketPayload = (response: any): any => response?.data?.data ?? response?.data ?? response ?? null;

  const handleCompleteTicket = async (ticket: any) => {
    if (!canUpdateSupport.value || isTicketCompleted(ticket)) return;

    const ticketId = String(ticket?.id ?? "");
    if (!ticketId) return;

    if (typeof window !== "undefined" && !window.confirm(supportListText.value.completeConfirm)) {
      return;
    }

    ticketActionLoadingId.value = `${ticketId}:status`;

    try {
      const response = await appCore.adminModules.tickets.updateStatus(ticketId, {
        status: "closed",
        notify_client: false,
      });
      const nextTicket = extractTicketPayload(response);
      if (nextTicket?.id) {
        replaceTicketInList(nextTicket);
      } else {
        ticket.status = "closed";
      }
      await loadData();
      toast.success(supportListText.value.statusUpdated);
      useEventBus.emit(SUPPORT_UNREAD_UPDATED_EVENT);
    } catch (error) {
      console.error("admin support status update failed", error);
      toast.error(supportListText.value.statusUpdateFailed);
    } finally {
      ticketActionLoadingId.value = "";
    }
  };

  const handleArchiveTicket = async (ticket: any) => {
    if (!canDeleteSupport.value) return;

    const ticketId = String(ticket?.id ?? "");
    if (!ticketId) return;

    if (typeof window !== "undefined" && !window.confirm(supportListText.value.archiveConfirm)) {
      return;
    }

    ticketActionLoadingId.value = `${ticketId}:archive`;

    try {
      await appCore.adminModules.tickets.delete(ticketId);
      const index = tickets.findIndex((item: any) => String(item?.id ?? "") === ticketId);
      if (index >= 0) {
        tickets.splice(index, 1);
      }
      total.value = Math.max(0, total.value - 1);
      toast.success(supportListText.value.archivedToast);
      useEventBus.emit(SUPPORT_UNREAD_UPDATED_EVENT);
    } catch (error) {
      console.error("admin support archive failed", error);
      toast.error(supportListText.value.archiveFailed);
    } finally {
      ticketActionLoadingId.value = "";
    }
  };

  const openAdminProfile = async (admin: any) => {
    const adminId = getAdminParticipantId(admin);
    if (!adminId) return;

    await router.push(
      localePath({
        path: "/profile",
        query: { adminId },
      })
    );
  };

  const handleChangeFilterSortBy = async (value: string) => {
    if (orderBy.value === value)
      orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;
    else orderBy.value = value;

    await loadData();
  };

  const handleOrderByAndDirection = async (value: string) => {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
    orderBy.value = value;
    await loadData();
  };

  const handleCloseChat = () => {
    currentTicketIdForChat.value = null;
  };

  const handleChangePerPage = async (newPerPage: number) => {
    perPage.value = newPerPage;
    await loadData();
  };

  const buildSupportRoute = (ticketId: string) => localePath(`/support/${ticketId}`);
  const buildClientRoute = (clientId: string) => localePath(`/clients/${clientId}`);

  const handleClickRow = (ticketId: string) => router.push(buildSupportRoute(ticketId));

  const openTicketClient = (ticket: any) => {
    const clientId = getTicketClientId(ticket);
    if (!clientId) return;

    router.push(buildClientRoute(clientId));
  };

  const handleChatIconClick = (ticket: any) => {
    const ticketId = String(ticket?.id ?? "");
    if (!ticketId) return;

    router.push(buildSupportRoute(ticketId));
  };

  const handleFloatingChatJoined = async () => {
    await loadData();
  };

  const handleSupportListReload = () => {
    loadData().catch(() => {});
  };

  const handleSupportUnreadUpdated = (payload?: any) => {
    if (applySupportUnreadPayload(payload)) return;
    loadData().catch(() => {});
  };

  const handleSupportPresenceUpdated = (payload?: any) => {
    applySupportPresencePayload(payload);
  };

  const handleSupportPresenceRealtime = (payload?: any) => {
    applySupportPresencePayload(payload);
  };

  onMounted(async () => {
    // useEventBus.on("loadDataForAdminSupport", loadData);
    useEventBus.on(SUPPORT_UNREAD_UPDATED_EVENT, handleSupportUnreadUpdated);
    useEventBus.on(SUPPORT_PRESENCE_UPDATED_EVENT, handleSupportPresenceUpdated);
    connectSupportRealtime();
    bindSupportSocketStateListener();
    attachSupportResumeListeners();
    startSupportRealtimeRetry();

    const response = await appCore.adminModules.auth.getAuthUser();
    const photoUrl = response.data.photo_url ?? response.data.avatar_url ?? response.data.avatar ?? null;
    currentUser.id = response.data.id;
    currentUser.linkedUserId = response.data.user_id ?? null;
    currentUser.name = response.data.nickname ?? response.data.first_name ?? null;
    currentUser.firstName = response.data.first_name ?? null;
    currentUser.lastName = response.data.last_name ?? null;
    currentUser.email = response.data.email ?? null;
    currentUser.photoUrl = typeof photoUrl === "string" ? photoUrl : null;

    syncViewport();
    initViewMode();

    document.addEventListener("click", closeFloatingTicketControls);
    window.addEventListener("resize", handleWindowResize);
    await loadData();
    startAdminSupportListRefresh();
  });

  onBeforeUnmount(() => {
    useEventBus.off(SUPPORT_UNREAD_UPDATED_EVENT, handleSupportUnreadUpdated);
    useEventBus.off(SUPPORT_PRESENCE_UPDATED_EVENT, handleSupportPresenceUpdated);
    disconnectSupportRealtime();
    unbindSupportSocketStateListener();
    detachSupportResumeListeners();
    stopSupportRealtimeRetry();
    stopAdminSupportListRefresh();
    document.removeEventListener("click", closeFloatingTicketControls);
    window.removeEventListener("resize", handleWindowResize);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  });

  const supportPanelProps = computed<SupportPanelProps>(() => ({
    t,
    supportListText: supportListText.value,
    tickets,
    currentUser,
    sortByFilterData: sortByFilterData.value,
    canUpdateSupport: canUpdateSupport.value,
    canDeleteSupport: canDeleteSupport.value,
    isLoading: isLoading.value,
    search: search.value,
    total: total.value,
    perPage: perPage.value,
    currentPage: currentPage.value,
    orderBy: orderBy.value,
    orderDirection: orderDirection.value,
    activeAdminPopoverKey: activeAdminPopoverKey.value,
    showArchived: showArchived.value,
    viewMode: viewMode.value,
    isMobileViewport: isMobileViewport.value,
    viewOptions,
    perPageList,
    totalPages: totalPages.value,
    visiblePages: visiblePages.value,
    currentTicketIdForChat: currentTicketIdForChat.value,
    currentChatTicket: currentChatTicket.value,
    filtered: filtered.value,
    setPage,
    goPrev,
    goNext,
    getTicketChannelLabel,
    getTicketChannelBadgeClass,
    getTicketSourceKey,
    getTicketSourceLabel,
    getTicketSourceBadgeClass,
    getTicketStatusLabel,
    getTicketStatusDotClass,
    isTicketCompleted,
    getTicketClientAvatarUrl,
    getTicketClientInitials,
    getTicketClientName,
    getTicketClientEmail,
    getTicketClientId,
    getTicketPreview,
    getTicketCreatedLabel,
    getTicketAdminParticipants,
    getAdminParticipantId,
    getAdminParticipantKey,
    getAdminParticipantName,
    getAdminParticipantEmail,
    getAdminParticipantInitials,
    getAdminParticipantAvatarUrl,
    isCurrentAdminTicketParticipant,
    handleViewModeChange,
    handleToggleArchived,
    handleInputSearch,
    handleClickUpdate,
    setActiveAdminPopoverKey,
    clearActiveAdminPopoverKey,
    toggleAdminPopover,
    isTicketActionLoading,
    handleCompleteTicket,
    handleArchiveTicket,
    openAdminProfile,
    handleChangeFilterSortBy,
    handleOrderByAndDirection,
    handleCloseChat,
    handleChangePerPage,
    handleClickRow,
    openTicketClient,
    handleChatIconClick,
    handleFloatingChatJoined,
  }));

  return {
    supportPanelProps,
  };
}
