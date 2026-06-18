import type Echo from "laravel-echo";
import { navigateTo, useNuxtApp } from "nuxt/app";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { useLocalePath } from "~/.nuxt/imports";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { canAccessAdminPath } from "~/constants/adminPagePermissions";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
import UiIconPaymentDetail from "~/components/ui/UiIconPaymentDetail.vue";
import UiIconTime from "~/components/ui/UiIconTime.vue";
import type {
  DashboardFilters,
  DashboardOnlineClient,
  DashboardOnlineFilters,
  DashboardPreset,
  DashboardSelectOption,
  DashboardStatusTone,
  DashboardSummaryCard,
} from "~/pages/admin/dashboard/types";

type DashboardSection = "registrations" | "online";
type DashboardDateKey = "date_from" | "date_to";

const AUTO_REFRESH_INTERVAL_MS = 30_000;
const FILTER_RELOAD_DELAY_MS = 350;
const REALTIME_REFRESH_DELAY_MS = 900;
const ADMIN_NOTIFICATION_RECEIVED_EVENT = "admin-notification-received";
const DASHBOARD_NOTIFICATION_TYPES = ["payments.withdrawal.created", "verification.request.created"];

const metricRangePresets: DashboardPreset[] = [
  { id: "1d", label: "24h", amount: 1, unit: "days", bucket: "hour" },
  { id: "7d", label: "7d", amount: 1, unit: "weeks", bucket: "day" },
  { id: "30d", label: "30d", amount: 30, unit: "days", bucket: "day" },
  { id: "90d", label: "90d", amount: 3, unit: "months", bucket: "day" },
];

function resolvePreset(presetId: string): DashboardPreset {
  return metricRangePresets.find(preset => preset.id === presetId) ?? metricRangePresets[2];
}

function shiftDate(date: Date, preset: DashboardPreset): Date {
  const shifted = new Date(date);

  if (preset.unit === "days") shifted.setDate(shifted.getDate() - preset.amount);
  if (preset.unit === "weeks") shifted.setDate(shifted.getDate() - preset.amount * 7);
  if (preset.unit === "months") shifted.setMonth(shifted.getMonth() - preset.amount);

  return shifted;
}

function toIsoRange(presetId: string): DashboardFilters {
  const preset = resolvePreset(presetId);
  const now = new Date();
  const from = shiftDate(now, preset);

  return {
    preset: preset.id,
    date_from: from.toISOString(),
    date_to: now.toISOString(),
    bucket: preset.bucket,
  };
}

function createChartFilters(presetId: string): DashboardFilters {
  return {
    ...toIsoRange(presetId),
  };
}

function createOnlineChartFilters(presetId: string): DashboardOnlineFilters {
  return {
    ...toIsoRange(presetId),
    device_type: "",
    browser: "",
    os: "",
  };
}

function parseJsonObject(value: unknown): Record<string, any> | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : null;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizePresencePayload(payload?: any): Record<string, any> | null {
  if (!payload) {
    return null;
  }

  const parsedPayload =
    typeof payload === "string" ? parseJsonObject(payload) : payload && typeof payload === "object" ? payload : null;
  if (!parsedPayload) {
    return null;
  }

  const dataLayer =
    parsedPayload?.data && typeof parsedPayload.data === "object"
      ? parsedPayload.data
      : (parseJsonObject(parsedPayload?.data) ?? parsedPayload);

  return dataLayer && typeof dataLayer === "object" ? (dataLayer as Record<string, any>) : null;
}

export function useAdminDashboardPage() {
  const { t, locale } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const toast = useToast();
  const adminAuthStore = useAdminAuthStore();
  const appCore = useAppCore();
  const { $echo } = useNuxtApp() as { $echo?: Echo<any> };

  const dashboard = ref<any>(null);
  const isLoading = ref(false);
  const hasLoadedDashboard = ref(false);
  const advancedFiltersVisible = ref(false);
  const registrationsFilters = reactive<DashboardFilters>(createChartFilters("30d"));
  const onlineFilters = reactive<DashboardOnlineFilters>(createOnlineChartFilters("7d"));
  const summarySkeletonCards = [1, 2, 3, 4];
  const chartSkeletonCards = [1, 2];
  const listSkeletonRows = [1, 2, 3, 4, 5];

  let autoRefreshIntervalId: number | null = null;
  let filterReloadTimeoutId: number | null = null;
  let realtimeRefreshTimeoutId: number | null = null;
  let queuedRealtimeRefresh = false;
  let dashboardRealtimeChannel: any = null;
  let supportRealtimeChannel: any = null;
  let socketStateHandler: ((states: any) => void) | null = null;

  function resolveText(key: string, fallback: string): string {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  function canAccessPath(path: string): boolean {
    return canAccessAdminPath(path, {
      hasPermission: permission => adminAuthStore.hasPermission(permission),
      hasRole: role => adminAuthStore.hasRole(role),
    });
  }

  const bucketOptions = computed(() => [
    { id: "day", value: "day", text: resolveText("admin.dashboard.filters.day", "By day") },
    { id: "hour", value: "hour", text: resolveText("admin.dashboard.filters.hour", "By hour") },
  ]);

  const deviceOptions = computed(() =>
    ((dashboard.value?.online?.filter_options?.device_types ?? []) as any[]).map(item => ({
      id: item.value,
      value: item.value,
      text: item.text,
    }))
  );

  const browserOptions = computed(() =>
    ((dashboard.value?.online?.filter_options?.browsers ?? []) as any[]).map(item => ({
      id: item.value,
      value: item.value,
      text: item.text,
    }))
  );

  const osOptions = computed(() =>
    ((dashboard.value?.online?.filter_options?.oses ?? []) as any[]).map(item => ({
      id: item.value,
      value: item.value,
      text: item.text,
    }))
  );

  const isInitialLoading = computed(() => !hasLoadedDashboard.value || (isLoading.value && !dashboard.value));
  const isRefreshing = computed(() => isLoading.value && Boolean(dashboard.value));

  const toPrimeOptions = (options: Array<{ value: string; text?: string; label?: string }>): DashboardSelectOption[] =>
    options.map(option => ({
      label: option.label ?? option.text ?? option.value,
      value: option.value,
    }));

  const bucketSelectOptions = computed(() => toPrimeOptions(bucketOptions.value));
  const deviceSelectOptions = computed(() => toPrimeOptions(deviceOptions.value));
  const browserSelectOptions = computed(() => toPrimeOptions(browserOptions.value));
  const osSelectOptions = computed(() => toPrimeOptions(osOptions.value));

  function formatNumber(value: number | string | null | undefined): string {
    return new Intl.NumberFormat(locale.value || undefined).format(Number(value ?? 0));
  }

  function resolveCssVar(variable: string, fallback: string): string {
    if (typeof window === "undefined") {
      return fallback;
    }

    const value = window.getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
  }

  function formatDurationPart(value: number, unitKey: string, fallback: string): string {
    return `${formatNumber(value)} ${resolveText(unitKey, fallback)}`;
  }

  function formatSecondsDuration(value: number | string | null | undefined): string {
    const totalSeconds = Math.max(0, Math.round(Number(value ?? 0)));
    const daySeconds = 86_400;
    const hourSeconds = 3_600;
    const minuteSeconds = 60;
    const days = Math.floor(totalSeconds / daySeconds);
    const hours = Math.floor((totalSeconds % daySeconds) / hourSeconds);
    const minutes = Math.floor((totalSeconds % hourSeconds) / minuteSeconds);
    const seconds = totalSeconds % minuteSeconds;
    const parts: string[] = [];

    if (days > 0) {
      parts.push(formatDurationPart(days, "admin.dashboard.units.daysShort", "d"));
    }
    if (hours > 0 && parts.length < 2) {
      parts.push(formatDurationPart(hours, "admin.dashboard.units.hoursShort", "h"));
    }
    if (minutes > 0 && parts.length < 2) {
      parts.push(formatDurationPart(minutes, "admin.dashboard.units.minutesShort", "min"));
    }
    if (parts.length === 0) {
      return seconds > 0
        ? formatDurationPart(1, "admin.dashboard.units.minutesShort", "min")
        : formatDurationPart(0, "admin.dashboard.units.minutesShort", "min");
    }

    return parts.join(" ");
  }

  function durationPluralIndex(value: number): 0 | 1 | 2 {
    const absolute = Math.abs(value);
    const mod10 = absolute % 10;
    const mod100 = absolute % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return 0;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 1;
    }

    return 2;
  }

  function formatHumanDurationPart(value: number, unit: "day" | "hour" | "minute"): string {
    const normalizedLocale = String(locale.value || "en").toLowerCase();
    const localizedForms: Record<string, Record<typeof unit, [string, string, string]>> = {
      ru: {
        day: ["день", "дня", "дней"],
        hour: ["час", "часа", "часов"],
        minute: ["минута", "минуты", "минут"],
      },
      uk: {
        day: ["день", "дні", "днів"],
        hour: ["година", "години", "годин"],
        minute: ["хвилина", "хвилини", "хвилин"],
      },
    };

    const language = normalizedLocale.split("-")[0];
    const forms = localizedForms[language]?.[unit];
    if (forms) {
      return `${formatNumber(value)} ${forms[durationPluralIndex(value)]}`;
    }

    const englishUnit = value === 1 ? unit : `${unit}s`;
    return `${formatNumber(value)} ${englishUnit}`;
  }

  function formatHumanSessionDuration(value: number | string | null | undefined): string {
    const totalSeconds = Math.max(0, Math.round(Number(value ?? 0)));
    const daySeconds = 86_400;
    const hourSeconds = 3_600;
    const minuteSeconds = 60;
    const days = Math.floor(totalSeconds / daySeconds);
    const hours = Math.floor((totalSeconds % daySeconds) / hourSeconds);
    const minutes = Math.floor((totalSeconds % hourSeconds) / minuteSeconds);
    const parts: string[] = [];

    if (days > 0) {
      parts.push(formatHumanDurationPart(days, "day"));
    }
    if (hours > 0 && parts.length < 2) {
      parts.push(formatHumanDurationPart(hours, "hour"));
    }
    if (minutes > 0 && parts.length < 2) {
      parts.push(formatHumanDurationPart(minutes, "minute"));
    }

    if (parts.length === 0) {
      return resolveText("admin.dashboard.onlinePopover.lessThanMinute", "less than a minute");
    }

    return parts.join(" ");
  }

  function formatHours(value: number | string | null | undefined): string {
    return formatSecondsDuration(Number(value ?? 0) * 3_600);
  }

  function formatDateTime(value?: string | null): string {
    if (!value) {
      return "—";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale.value || undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function toDateInputValue(value?: string | null): string {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 10);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function toDatePickerValue(value?: string | null): Date | null {
    if (!value) {
      return null;
    }

    const normalized = toDateInputValue(value);
    if (!normalized) {
      return null;
    }

    const [year, month, day] = normalized.split("-").map(Number);
    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  function toDateFilterValue(value: Date | string | null | undefined): string {
    if (!value) {
      return "";
    }

    if (value instanceof Date) {
      return toDateInputValue(value.toISOString());
    }

    return String(value);
  }

  function updateDateFilter(section: DashboardSection, key: DashboardDateKey, value: Date | string | null): void {
    updateDashboardFilter(section, key, toDateFilterValue(value));
  }

  function resolveUserStatusTone(status: string): DashboardStatusTone {
    if (status === "active") return "success";
    if (status === "blocked") return "danger";
    return "warning";
  }

  function resolveUserStatusText(status: string): string {
    if (status === "active") {
      return resolveText("admin.dashboard.status.active", "Active");
    }
    if (status === "blocked") {
      return resolveText("admin.dashboard.status.blocked", "Blocked");
    }

    return resolveText("admin.dashboard.status.pending", "Pending");
  }

  function resolveOnlineStatusLabel(isOnline: boolean): string {
    return isOnline
      ? resolveText("admin.dashboard.status.online", "Online")
      : resolveText("admin.dashboard.status.offline", "Offline");
  }

  function resolveOnlineStatusTone(isOnline: boolean): DashboardStatusTone {
    return isOnline ? "success" : "muted";
  }

  function normalizeNullableText(value: unknown): string | null {
    const normalized = String(value ?? "").trim();

    return normalized === "" ? null : normalized;
  }

  function normalizeOnlineClient(value: unknown): DashboardOnlineClient | null {
    if (!value || typeof value !== "object") {
      return null;
    }

    const source = value as Record<string, unknown>;
    const id = normalizeNullableText(source.id ?? source.user_id);
    if (!id) {
      return null;
    }

    return {
      id,
      first_name: normalizeNullableText(source.first_name),
      last_name: normalizeNullableText(source.last_name),
      name: normalizeNullableText(source.name),
      email: normalizeNullableText(source.email),
      photo_url: normalizeNullableText(source.photo_url),
      initials: normalizeNullableText(source.initials),
      online_since_at: normalizeNullableText(source.online_since_at),
      current_session_seconds:
        source.current_session_seconds === null || source.current_session_seconds === undefined
          ? null
          : String(source.current_session_seconds),
    };
  }

  function getInitials(value?: string | null): string {
    const parts = String(value || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return "AA";
    }

    return parts
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  async function loadDashboard(options: { silent?: boolean } = {}): Promise<void> {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;

    try {
      const response = await appCore.adminModules.dashboard.getSummary({
        registrations_date_from: registrationsFilters.date_from,
        registrations_date_to: registrationsFilters.date_to,
        registrations_bucket: registrationsFilters.bucket,
        online_date_from: onlineFilters.date_from,
        online_date_to: onlineFilters.date_to,
        online_bucket: onlineFilters.bucket,
        online_device_type: onlineFilters.device_type || undefined,
        online_browser: onlineFilters.browser || undefined,
        online_os: onlineFilters.os || undefined,
        online_top_limit: 10,
      });

      dashboard.value = response?.data?.data ?? null;
    } catch (error: any) {
      if (!options.silent) {
        toast.error(
          error?.response?.data?.message ?? resolveText("admin.dashboard.errors.load", "Failed to load dashboard data.")
        );
      }
    } finally {
      isLoading.value = false;
      hasLoadedDashboard.value = true;

      if (queuedRealtimeRefresh && shouldAutoRefresh()) {
        queuedRealtimeRefresh = false;
        void loadDashboard({ silent: true });
      }
    }
  }

  function clearFilterReloadTimeout(): void {
    if (filterReloadTimeoutId === null || typeof window === "undefined") {
      return;
    }

    window.clearTimeout(filterReloadTimeoutId);
    filterReloadTimeoutId = null;
  }

  function clearRealtimeRefreshTimeout(): void {
    if (realtimeRefreshTimeoutId === null || typeof window === "undefined") {
      return;
    }

    window.clearTimeout(realtimeRefreshTimeoutId);
    realtimeRefreshTimeoutId = null;
  }

  function scheduleDashboardReload(): void {
    if (typeof window === "undefined") {
      return;
    }

    clearFilterReloadTimeout();
    filterReloadTimeoutId = window.setTimeout(() => {
      filterReloadTimeoutId = null;
      void loadDashboard({ silent: true });
    }, FILTER_RELOAD_DELAY_MS);
  }

  function scheduleRealtimeReload(): void {
    if (typeof window === "undefined" || !shouldAutoRefresh()) {
      return;
    }

    if (isLoading.value) {
      queuedRealtimeRefresh = true;
      return;
    }

    clearRealtimeRefreshTimeout();
    realtimeRefreshTimeoutId = window.setTimeout(() => {
      realtimeRefreshTimeoutId = null;

      if (isLoading.value) {
        queuedRealtimeRefresh = true;
        return;
      }

      void loadDashboard({ silent: true });
    }, REALTIME_REFRESH_DELAY_MS);
  }

  function setPresetFilters(target: DashboardFilters | DashboardOnlineFilters, presetId: string): void {
    Object.assign(target, toIsoRange(presetId));
  }

  async function applyDashboardPreset(section: DashboardSection, presetId: string): Promise<void> {
    if (section === "registrations") {
      setPresetFilters(registrationsFilters, presetId);
    }

    if (section === "online") {
      setPresetFilters(onlineFilters, presetId);
    }

    await loadDashboard({ silent: true });
  }

  function updateDashboardFilter(section: DashboardSection, key: string, value: string): void {
    const target = section === "registrations" ? registrationsFilters : onlineFilters;

    (target as Record<string, string>)[key] = value;
    target.preset = "custom";
    scheduleDashboardReload();
  }

  async function handleOnlineRangeSelected({ startKey, endKey }: { startKey: string; endKey: string }): Promise<void> {
    if (!startKey || !endKey) {
      return;
    }

    const endDate = new Date(endKey);
    if (!Number.isNaN(endDate.getTime())) {
      if (onlineFilters.bucket === "hour") {
        endDate.setHours(endDate.getHours() + 1, 0, 0, -1);
      } else {
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(0, 0, 0, -1);
      }
    }

    onlineFilters.date_from = startKey;
    onlineFilters.date_to = Number.isNaN(endDate.getTime()) ? endKey : endDate.toISOString();
    onlineFilters.preset = "custom";

    await loadDashboard({ silent: true });
  }

  function shouldAutoRefresh(): boolean {
    if (typeof document === "undefined") {
      return true;
    }

    return document.visibilityState === "visible";
  }

  function stopAutoRefresh(): void {
    if (autoRefreshIntervalId === null || typeof window === "undefined") {
      return;
    }

    window.clearInterval(autoRefreshIntervalId);
    autoRefreshIntervalId = null;
  }

  function startAutoRefresh(): void {
    if (typeof window === "undefined") {
      return;
    }

    stopAutoRefresh();
    autoRefreshIntervalId = window.setInterval(() => {
      if (!shouldAutoRefresh()) {
        return;
      }

      void loadDashboard({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);
  }

  function handleVisibilityChange(): void {
    if (!shouldAutoRefresh()) {
      return;
    }

    void loadDashboard({ silent: true });
  }

  function handleRealtimeDashboardUpdate(): void {
    scheduleRealtimeReload();
  }

  function handleRealtimeClientPresence(payload: any): void {
    const data = normalizePresencePayload(payload);
    const onlineClientsNow = Number(data?.online_clients_now ?? data?.onlineClientsNow);

    if (dashboard.value && Number.isFinite(onlineClientsNow)) {
      const currentOnline = dashboard.value?.online?.summary ?? {};
      dashboard.value = {
        ...dashboard.value,
        online: {
          ...(dashboard.value?.online ?? {}),
          summary: {
            ...currentOnline,
            currently_online_users: Math.max(0, onlineClientsNow),
          },
        },
      };
    }

    if (!data || !Number.isFinite(onlineClientsNow)) {
      scheduleRealtimeReload();
      return;
    }

    scheduleRealtimeReload();
  }

  function handleAdminNotificationReceived(payload?: { notification?: any }): void {
    const notificationType = String(payload?.notification?.type ?? "").trim();
    if (!DASHBOARD_NOTIFICATION_TYPES.includes(notificationType)) {
      return;
    }

    scheduleRealtimeReload();
  }

  function resolveEchoClient() {
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
  }

  function reconnectDashboardSocketTransport(): void {
    const echoClient = resolveEchoClient();
    const pusher = echoClient?.connector?.pusher;
    const state = String(pusher?.connection?.state ?? "");

    if (!pusher) {
      return;
    }

    if (state === "disconnected" || state === "failed" || state === "unavailable") {
      try {
        pusher.connect();
      } catch {
        // Pusher reconnect attempts are best-effort from the dashboard.
      }
    }
  }

  function connectDashboardRealtime(): void {
    const echoClient = resolveEchoClient();
    if (!echoClient || dashboardRealtimeChannel) {
      return;
    }

    reconnectDashboardSocketTransport();
    dashboardRealtimeChannel = echoClient.private("dashboard.admin");

    const eventNames = [
      ".admin.dashboard.updated",
      "admin.dashboard.updated",
      ".Modules\\System\\Events\\AdminDashboardUpdated",
      "Modules\\System\\Events\\AdminDashboardUpdated",
      ".AdminDashboardUpdated",
      "AdminDashboardUpdated",
    ];

    for (const eventName of eventNames) {
      dashboardRealtimeChannel.stopListening(eventName, handleRealtimeDashboardUpdate);
      dashboardRealtimeChannel.listen(eventName, handleRealtimeDashboardUpdate);
    }
  }

  function disconnectDashboardRealtime(): void {
    if (!dashboardRealtimeChannel) {
      return;
    }

    const eventNames = [
      ".admin.dashboard.updated",
      "admin.dashboard.updated",
      ".Modules\\System\\Events\\AdminDashboardUpdated",
      "Modules\\System\\Events\\AdminDashboardUpdated",
      ".AdminDashboardUpdated",
      "AdminDashboardUpdated",
    ];

    for (const eventName of eventNames) {
      dashboardRealtimeChannel.stopListening(eventName, handleRealtimeDashboardUpdate);
    }

    dashboardRealtimeChannel = null;
  }

  function connectClientPresenceRealtime(): void {
    const echoClient = resolveEchoClient();
    if (!echoClient || supportRealtimeChannel) {
      return;
    }

    reconnectDashboardSocketTransport();
    supportRealtimeChannel = echoClient.private("support.global");

    const eventNames = [
      ".client.presence.updated",
      "client.presence.updated",
      ".App\\Events\\ClientPresenceUpdated",
      "App\\Events\\ClientPresenceUpdated",
      ".ClientPresenceUpdated",
      "ClientPresenceUpdated",
      ".Modules\\Support\\Events\\ClientPresenceUpdated",
      "Modules\\Support\\Events\\ClientPresenceUpdated",
    ];

    for (const eventName of eventNames) {
      supportRealtimeChannel.stopListening(eventName, handleRealtimeClientPresence);
      supportRealtimeChannel.listen(eventName, handleRealtimeClientPresence);
    }
  }

  function disconnectClientPresenceRealtime(): void {
    if (!supportRealtimeChannel) {
      return;
    }

    const eventNames = [
      ".client.presence.updated",
      "client.presence.updated",
      ".App\\Events\\ClientPresenceUpdated",
      "App\\Events\\ClientPresenceUpdated",
      ".ClientPresenceUpdated",
      "ClientPresenceUpdated",
      ".Modules\\Support\\Events\\ClientPresenceUpdated",
      "Modules\\Support\\Events\\ClientPresenceUpdated",
    ];

    for (const eventName of eventNames) {
      supportRealtimeChannel.stopListening(eventName, handleRealtimeClientPresence);
    }

    supportRealtimeChannel = null;
  }

  function bindDashboardSocketStateListener(): void {
    if (socketStateHandler) {
      return;
    }

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (!connection || typeof connection.bind !== "function") {
      return;
    }

    socketStateHandler = (states: any) => {
      const currentState = String(states?.current ?? connection?.state ?? "");

      if (currentState === "connected") {
        connectDashboardRealtime();
        connectClientPresenceRealtime();
        scheduleRealtimeReload();
        return;
      }

      if (currentState === "failed" || currentState === "unavailable" || currentState === "disconnected") {
        reconnectDashboardSocketTransport();
      }
    };

    connection.bind("state_change", socketStateHandler);
  }

  function unbindDashboardSocketStateListener(): void {
    if (!socketStateHandler) {
      return;
    }

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (connection && typeof connection.unbind === "function") {
      connection.unbind("state_change", socketStateHandler);
    }

    socketStateHandler = null;
  }

  async function handleManualRefresh(): Promise<void> {
    await loadDashboard({ silent: false });
  }

  function toggleAdvancedFilters(): void {
    advancedFiltersVisible.value = !advancedFiltersVisible.value;
  }

  function handleNavigate(to?: string): void {
    if (!to) {
      return;
    }

    const [path, queryString = ""] = to.split("?");
    if (queryString === "") {
      navigateTo(localePath(path));
      return;
    }

    navigateTo({
      path: localePath(path),
      query: Object.fromEntries(new URLSearchParams(queryString)),
    });
  }

  function onlineClientName(client: DashboardOnlineClient): string {
    const firstName = String(client.first_name ?? "").trim();
    const lastName = String(client.last_name ?? "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    const fallbackName = String(client.name ?? "").trim();

    return fullName || fallbackName || onlineClientEmail(client);
  }

  function onlineClientEmail(client: DashboardOnlineClient): string {
    return String(client.email ?? "").trim() || "—";
  }

  function onlineClientSessionDuration(client: DashboardOnlineClient): string {
    try {
      const rawSeconds = client.current_session_seconds;
      const explicitSeconds =
        rawSeconds === null || rawSeconds === undefined || rawSeconds === "" ? null : Number(rawSeconds);
      const startedAt = client.online_since_at ? new Date(client.online_since_at) : null;
      const fallbackSeconds =
        startedAt && !Number.isNaN(startedAt.getTime())
          ? Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000))
          : null;
      const seconds = explicitSeconds !== null && Number.isFinite(explicitSeconds) ? explicitSeconds : fallbackSeconds;

      if (seconds === null || !Number.isFinite(seconds) || seconds < 0) {
        return resolveText("admin.dashboard.onlinePopover.sessionUnavailable", "Online time unavailable");
      }

      return resolveText("admin.dashboard.onlinePopover.onlineFor", "Online {duration}").replace(
        "{duration}",
        formatHumanSessionDuration(seconds)
      );
    } catch {
      return resolveText("admin.dashboard.onlinePopover.sessionUnavailable", "Online time unavailable");
    }
  }

  function formatTopOnlineClientMeta(user: any): string {
    const email = user.email || resolveText("admin.dashboard.labels.noEmail", "No email");

    return `${email} · ${formatHours(user.total_online_hours)} · ${formatNumber(user.sessions_count)} ${resolveText(
      "admin.dashboard.labels.sessionsShort",
      "sessions"
    )}`;
  }

  function formatRecentUserMeta(user: any): string {
    const email = user.email || resolveText("admin.dashboard.labels.noEmail", "No email");

    return `${email} · ${formatDateTime(user.created_at)}`;
  }

  const onlineSummary = computed(() => dashboard.value?.online?.summary ?? {});
  const currentOnlineCount = computed(() => Number(onlineSummary.value?.currently_online_users ?? 0));
  const currentOnlineClients = computed<DashboardOnlineClient[]>(() => {
    const clients = dashboard.value?.online?.current_clients;
    if (!Array.isArray(clients)) {
      return [];
    }

    return clients
      .map(normalizeOnlineClient)
      .filter((client): client is DashboardOnlineClient => client !== null);
  });
  const onlineClientsRoute = computed(() => "/clients?filter_online_status=online");
  const topOnlineClients = computed<any[]>(() => dashboard.value?.online?.top_clients ?? []);
  const recentUsers = computed<any[]>(() => dashboard.value?.recent?.users ?? []);

  const summaryCards = computed<DashboardSummaryCard[]>(() => {
    const cards: DashboardSummaryCard[] = [
      {
        id: "online_now",
        label: resolveText("admin.dashboard.cards.onlineNow", "Online now"),
        value: formatNumber(currentOnlineCount.value),
        icon: UiIconClients,
        to: onlineClientsRoute.value,
        kind: "primary",
      },
      {
        id: "transactions_queue",
        label: resolveText("admin.dashboard.cards.transactionsQueue", "Transactions queue"),
        value: formatNumber(dashboard.value?.priority?.unprocessed_transactions ?? 0),
        icon: UiIconTime,
        to: "/payments",
        kind: "success",
      },
      {
        id: "unprocessed_requisites",
        label: resolveText("admin.dashboard.cards.unprocessedRequisites", "Необработанные реквизиты"),
        value: formatNumber(
          dashboard.value?.priority?.unprocessed_requisites ?? dashboard.value?.priority?.processing_requisites ?? 0
        ),
        icon: UiIconPaymentDetail,
        to: "/payout-verifications",
        kind: "info",
      },
      {
        id: "unprocessed_verifications",
        label: resolveText("admin.dashboard.cards.unprocessedVerifications", "Unprocessed verification requests"),
        value: formatNumber(dashboard.value?.priority?.unprocessed_verifications ?? 0),
        icon: UiIconDocuments,
        to: "/verifications",
        kind: "warning",
      },
    ];

    return cards.filter(card => canAccessPath(card.to));
  });

  const registrationLabels = computed(() =>
    (dashboard.value?.charts?.registrations?.points ?? []).map((point: any) => point.label)
  );
  const registrationSeries = computed(() => [
    {
      name: resolveText("admin.dashboard.series.registrations", "Registrations"),
      data: (dashboard.value?.charts?.registrations?.points ?? []).map((point: any) => Number(point.value ?? 0)),
      color: resolveCssVar("--ui-primary-main", "#719edf"),
      area: true,
      type: "line" as const,
    },
  ]);

  const onlineLabels = computed(() => (dashboard.value?.charts?.online?.points ?? []).map((point: any) => point.label));
  const onlineCategoryKeys = computed(() =>
    (dashboard.value?.charts?.online?.points ?? []).map((point: any) => point.key)
  );
  const onlineSeries = computed(() => [
    {
      name: resolveText("admin.dashboard.series.onlineHours", "Online hours"),
      data: (dashboard.value?.charts?.online?.points ?? []).map((point: any) => Number(point.value ?? 0)),
      color: resolveCssVar("--ui-primary-main", "#719edf"),
      area: true,
      type: "line" as const,
      yAxisIndex: 0,
    },
    {
      name: resolveText("admin.dashboard.series.onlineClients", "Clients online"),
      data: (dashboard.value?.charts?.online?.points ?? []).map((point: any) => Number(point.users_count ?? 0)),
      color: resolveCssVar("--color-success", "#39c98d"),
      type: "bar" as const,
      yAxisIndex: 1,
    },
  ]);
  const onlineAxes = computed(() => [
    {
      name: resolveText("admin.dashboard.series.onlineHours", "Online hours"),
      position: "left" as const,
      formatter: (value: number) => formatSecondsDuration(value),
    },
    {
      name: resolveText("admin.dashboard.series.onlineClients", "Clients online"),
      position: "right" as const,
    },
  ]);

  function formatOnlineTooltip({ dataIndex, category }: { dataIndex: number; category: string }): string {
    const point = (dashboard.value?.charts?.online?.points ?? [])[dataIndex];
    if (!point) {
      return escapeHtml(category);
    }

    const users = Array.isArray(point.users) ? point.users : [];
    const usersHtml =
      users.length > 0
        ? users
            .map((user: any) => {
              const label = String(user.name || user.email || user.user_id || "");
              const clientUrl = localePath(`/clients/${user.user_id}`);

              return `
                <div class="flex items-center justify-between gap-3 text-[#d8dff4]">
                  <a class="max-w-[210px] overflow-hidden text-ellipsis whitespace-nowrap text-[var(--ui-primary-main)] no-underline hover:underline" href="${escapeHtml(
                    clientUrl
                  )}">
                    ${escapeHtml(label)}
                  </a>
                  <span class="whitespace-nowrap">${escapeHtml(formatHours(user.total_online_hours))} · ${formatNumber(
                    user.sessions_count
                  )} ${escapeHtml(resolveText("admin.dashboard.labels.sessionsShort", "sessions"))}</span>
                </div>
              `;
            })
            .join("")
        : `<div class="mt-2 text-[var(--ui-text-secondary)]">${escapeHtml(
            resolveText("admin.dashboard.tooltip.noClientsBucket", "No clients in this bucket.")
          )}</div>`;

    return `
      <div class="flex min-w-[300px] flex-col gap-2">
        <div class="font-bold text-white">${escapeHtml(category)}</div>
        <div class="flex items-center justify-between gap-3 text-[#d8dff4]">
          <span>${escapeHtml(resolveText("admin.dashboard.tooltip.totalHours", "Total hours"))}</span>
          <strong>${escapeHtml(formatSecondsDuration(point.value ?? 0))}</strong>
        </div>
        <div class="flex items-center justify-between gap-3 text-[#d8dff4]">
          <span>${escapeHtml(resolveText("admin.dashboard.tooltip.uniqueClients", "Unique clients"))}</span>
          <strong>${formatNumber(point.users_count ?? 0)}</strong>
        </div>
        <div class="flex items-center justify-between gap-3 text-[#d8dff4]">
          <span>${escapeHtml(resolveText("admin.dashboard.tooltip.sessions", "Sessions"))}</span>
          <strong>${formatNumber(point.sessions_count ?? 0)}</strong>
        </div>
        <div class="mt-1 flex max-h-[220px] flex-col gap-2 overflow-auto">${usersHtml}</div>
      </div>
    `;
  }

  const lastUpdatedText = computed(() => {
    if (!dashboard.value?.generated_at) {
      return resolveText("admin.dashboard.liveWaiting", "Waiting for first sync");
    }

    return `${resolveText("admin.dashboard.lastUpdated", "Updated")}: ${formatDateTime(dashboard.value.generated_at)}`;
  });

  onMounted(() => {
    startAutoRefresh();
    connectDashboardRealtime();
    connectClientPresenceRealtime();
    bindDashboardSocketStateListener();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleVisibilityChange);
    }
    useEventBus.on(ADMIN_NOTIFICATION_RECEIVED_EVENT, handleAdminNotificationReceived);

    void loadDashboard();
  });

  onBeforeUnmount(() => {
    stopAutoRefresh();
    clearFilterReloadTimeout();
    clearRealtimeRefreshTimeout();
    disconnectDashboardRealtime();
    disconnectClientPresenceRealtime();
    unbindDashboardSocketStateListener();

    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", handleVisibilityChange);
    }
    useEventBus.off(ADMIN_NOTIFICATION_RECEIVED_EVENT, handleAdminNotificationReceived);
  });

  return {
    advancedFiltersVisible,
    browserSelectOptions,
    bucketSelectOptions,
    chartSkeletonCards,
    currentOnlineClients,
    currentOnlineCount,
    deviceSelectOptions,
    formatDateTime,
    formatHours,
    formatNumber,
    formatOnlineTooltip,
    formatRecentUserMeta,
    formatTopOnlineClientMeta,
    getInitials,
    handleManualRefresh,
    handleNavigate,
    handleOnlineRangeSelected,
    isInitialLoading,
    isLoading,
    isRefreshing,
    lastUpdatedText,
    listSkeletonRows,
    metricRangePresets,
    onlineAxes,
    onlineCategoryKeys,
    onlineClientEmail,
    onlineClientName,
    onlineClientSessionDuration,
    onlineFilters,
    onlineLabels,
    onlineSeries,
    osSelectOptions,
    recentUsers,
    registrationLabels,
    registrationSeries,
    registrationsFilters,
    resolveOnlineStatusLabel,
    resolveOnlineStatusTone,
    resolveText,
    resolveUserStatusText,
    resolveUserStatusTone,
    summaryCards,
    summarySkeletonCards,
    toDatePickerValue,
    toggleAdvancedFilters,
    topOnlineClients,
    updateDashboardFilter,
    updateDateFilter,
    applyDashboardPreset,
  };
}
