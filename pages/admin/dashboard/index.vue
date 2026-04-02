<template>
  <div class="admin-dashboard">
    <div class="admin-dashboard__header">
      <div class="admin-dashboard__heading">
        <UiTextH4 class="admin-dashboard__title text-[var(--ui-text-main)]">
          {{ resolveText("admin.dashboard.title", "Admin dashboard") }}
        </UiTextH4>
        <UiTextParagraph class="admin-dashboard__subtitle">
          {{
            resolveText(
              "admin.dashboard.subtitle",
              "Live overview of registrations, moderation queues, transactions, and online activity."
            )
          }}
        </UiTextParagraph>
      </div>

      <div class="admin-dashboard__header-actions">
        <div class="admin-dashboard__live-meta">
          <span class="admin-dashboard__live-pill">
            {{ resolveText("admin.dashboard.autoRefresh", "Live updates every 30 seconds") }}
          </span>
          <UiTextSmall class="admin-dashboard__updated-at">
            {{ lastUpdatedText }}
          </UiTextSmall>
        </div>

        <UiButtonDefault
          state="info--small"
          class="admin-dashboard__refresh-button !w-[40px]"
          :disabled="isLoading"
          :title="resolveText('admin.dashboard.actions.refresh', 'Refresh dashboard')"
          @click="handleManualRefresh">
          <UiIconUpdate :spinning="isLoading" />
        </UiButtonDefault>
      </div>
    </div>

    <div class="admin-dashboard__summary-grid">
      <button
        v-for="card in summaryCards"
        :key="card.id"
        type="button"
        class="admin-dashboard__summary-link"
        @click="handleNavigate(card.to)">
        <PanelDefault
          class="dashboard-summary-card"
          :class="`dashboard-summary-card--${card.kind}`">
          <div class="dashboard-summary-card__body">
            <div class="dashboard-summary-card__top">
              <div class="dashboard-summary-card__copy">
                <UiTextSmall class="dashboard-summary-card__label">{{ card.label }}</UiTextSmall>
                <UiTextH5 class="dashboard-summary-card__value">{{ card.value }}</UiTextH5>
              </div>

              <div class="dashboard-summary-card__icon-wrap">
                <component
                  :is="card.icon"
                  class="dashboard-summary-card__icon" />
              </div>
            </div>

            <UiTextSmall class="dashboard-summary-card__hint">{{ card.hint }}</UiTextSmall>
          </div>
        </PanelDefault>
      </button>
    </div>

    <div class="admin-dashboard__charts">
      <PanelDefault class="dashboard-panel-card">
        <div class="dashboard-chart-card">
          <div class="dashboard-chart-card__header">
            <div class="dashboard-chart-card__heading">
              <UiTextH5 class="dashboard-chart-card__title">
                {{ resolveText("admin.dashboard.charts.registrationsTitle", "Client registrations") }}
              </UiTextH5>
              <UiTextSmall class="dashboard-chart-card__subtitle">
                {{ resolveText("admin.dashboard.charts.registrationsSubtitle", "New clients for the selected range.") }}
              </UiTextSmall>
            </div>

            <div class="dashboard-chart-card__presets">
              <button
                v-for="preset in metricRangePresets"
                :key="`registrations-${preset.id}`"
                type="button"
                class="dashboard-preset-button"
                :class="{ 'dashboard-preset-button--active': registrationsFilters.preset === preset.id }"
                @click="applyDashboardPreset('registrations', preset.id)">
                {{ preset.label }}
              </button>
            </div>
          </div>

          <div class="dashboard-chart-card__filters">
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">
                {{ resolveText("admin.dashboard.filters.from", "From") }}
              </span>
              <UiInput
                type="date"
                :value="toDateInputValue(registrationsFilters.date_from)"
                @input="value => updateDashboardFilter('registrations', 'date_from', value)" />
            </div>

            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">
                {{ resolveText("admin.dashboard.filters.to", "To") }}
              </span>
              <UiInput
                type="date"
                :value="toDateInputValue(registrationsFilters.date_to)"
                @input="value => updateDashboardFilter('registrations', 'date_to', value)" />
            </div>

            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">
                {{ resolveText("admin.dashboard.filters.step", "Step") }}
              </span>
              <UiSelect
                :data="bucketOptions"
                :value="registrationsFilters.bucket"
                without-no-select
                @change="value => updateDashboardFilter('registrations', 'bucket', value || 'day')" />
            </div>
          </div>

          <AdminMetricChart
            :categories="registrationLabels"
            :series="registrationSeries"
            :height="320" />
        </div>
      </PanelDefault>

      <PanelDefault class="dashboard-panel-card">
        <div class="dashboard-chart-card">
          <div class="dashboard-chart-card__header">
            <div class="dashboard-chart-card__heading">
              <UiTextH5 class="dashboard-chart-card__title">
                {{ resolveText("admin.dashboard.charts.onlineTitle", "Online activity") }}
              </UiTextH5>
              <UiTextSmall class="dashboard-chart-card__subtitle">
                {{
                  resolveText(
                    "admin.dashboard.charts.onlineSubtitle",
                    "Current online users, accumulated online hours, and active sessions."
                  )
                }}
              </UiTextSmall>
            </div>

            <div class="dashboard-chart-card__presets">
              <button
                v-for="preset in metricRangePresets"
                :key="`online-${preset.id}`"
                type="button"
                class="dashboard-preset-button"
                :class="{ 'dashboard-preset-button--active': onlineFilters.preset === preset.id }"
                @click="applyDashboardPreset('online', preset.id)">
                {{ preset.label }}
              </button>
            </div>
          </div>

          <div class="dashboard-chart-card__filters dashboard-chart-card__filters--online">
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">
                {{ resolveText("admin.dashboard.filters.from", "From") }}
              </span>
              <UiInput
                type="date"
                :value="toDateInputValue(onlineFilters.date_from)"
                @input="value => updateDashboardFilter('online', 'date_from', value)" />
            </div>

            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">
                {{ resolveText("admin.dashboard.filters.to", "To") }}
              </span>
              <UiInput
                type="date"
                :value="toDateInputValue(onlineFilters.date_to)"
                @input="value => updateDashboardFilter('online', 'date_to', value)" />
            </div>

            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">
                {{ resolveText("admin.dashboard.filters.step", "Step") }}
              </span>
              <UiSelect
                :data="bucketOptions"
                :value="onlineFilters.bucket"
                without-no-select
                @change="value => updateDashboardFilter('online', 'bucket', value || 'day')" />
            </div>

            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">
                {{ resolveText("admin.dashboard.filters.device", "Device") }}
              </span>
              <UiSelect
                :data="deviceOptions"
                :value="onlineFilters.device_type"
                @change="value => updateDashboardFilter('online', 'device_type', value || '')" />
            </div>

            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">
                {{ resolveText("admin.dashboard.filters.browser", "Browser") }}
              </span>
              <UiSelect
                :data="browserOptions"
                :value="onlineFilters.browser"
                @change="value => updateDashboardFilter('online', 'browser', value || '')" />
            </div>

            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">
                {{ resolveText("admin.dashboard.filters.os", "OS") }}
              </span>
              <UiSelect
                :data="osOptions"
                :value="onlineFilters.os"
                @change="value => updateDashboardFilter('online', 'os', value || '')" />
            </div>
          </div>

          <AdminMetricChart
            :categories="onlineLabels"
            :category-keys="onlineCategoryKeys"
            :series="onlineSeries"
            :y-axes="onlineAxes"
            :height="360"
            enable-zoom
            :tooltip-formatter="formatOnlineTooltip"
            @range-selected="handleOnlineRangeSelected" />
        </div>
      </PanelDefault>
    </div>

    <div class="admin-dashboard__panels">
      <PanelDefault class="dashboard-panel-card">
        <div class="dashboard-list-card">
          <div class="dashboard-list-card__header">
            <div>
              <UiTextH5 class="dashboard-list-card__title">
                {{ resolveText("admin.dashboard.panels.topOnline", "Top online clients") }}
              </UiTextH5>
              <UiTextSmall class="dashboard-list-card__subtitle">
                {{
                  resolveText(
                    "admin.dashboard.panels.topOnlineSubtitle",
                    "Who spent the most time online in the selected period."
                  )
                }}
              </UiTextSmall>
            </div>

            <UiBadge
              state="info"
              outline
              class="!px-3">
              {{ formatNumber(topOnlineClients.length) }}
            </UiBadge>
          </div>

          <div
            v-if="topOnlineClients.length === 0"
            class="dashboard-empty-state">
            {{ resolveText("admin.dashboard.empty.topOnline", "No online session data yet.") }}
          </div>

          <div
            v-else
            class="dashboard-list-card__rows">
            <button
              v-for="user in topOnlineClients"
              :key="user.user_id"
              type="button"
              class="dashboard-row-link"
              @click="handleNavigate(`/clients/${user.user_id}`)">
              <div class="dashboard-row-link__main">
                <UiTextSmall class="dashboard-row-link__title">{{ user.name }}</UiTextSmall>
                <UiTextSmall class="dashboard-row-link__meta">
                  {{ user.email || resolveText("admin.dashboard.labels.noEmail", "No email") }}
                  ·
                  {{ formatHours(user.total_online_hours) }}
                  ·
                  {{ formatNumber(user.sessions_count) }}
                  {{ resolveText("admin.dashboard.labels.sessionsShort", "sessions") }}
                </UiTextSmall>
              </div>

              <UiBadge
                :state="user.is_online ? 'success' : 'secondary'"
                outline
                class="!px-3">
                {{
                  user.is_online
                    ? resolveText("admin.dashboard.status.online", "Online")
                    : resolveText("admin.dashboard.status.offline", "Offline")
                }}
              </UiBadge>
            </button>
          </div>
        </div>
      </PanelDefault>

      <PanelDefault class="dashboard-panel-card">
        <div class="dashboard-list-card">
          <div class="dashboard-list-card__header">
            <div>
              <UiTextH5 class="dashboard-list-card__title">
                {{ resolveText("admin.dashboard.recentUsers", "Recent users") }}
              </UiTextH5>
              <UiTextSmall class="dashboard-list-card__subtitle">
                {{
                  resolveText(
                    "admin.dashboard.panels.recentUsersSubtitle",
                    "Newly registered clients with their current account status."
                  )
                }}
              </UiTextSmall>
            </div>

            <UiBadge
              state="secondary"
              outline
              class="!px-3">
              {{ formatNumber(recentUsers.length) }}
            </UiBadge>
          </div>

          <div
            v-if="recentUsers.length === 0"
            class="dashboard-empty-state">
            {{ resolveText("admin.dashboard.empty.recentUsers", "No recent users yet.") }}
          </div>

          <div
            v-else
            class="dashboard-list-card__rows">
            <button
              v-for="user in recentUsers"
              :key="user.id"
              type="button"
              class="dashboard-row-link"
              @click="handleNavigate(`/clients/${user.id}`)">
              <div class="dashboard-row-link__main">
                <UiTextSmall class="dashboard-row-link__title">{{ user.name }}</UiTextSmall>
                <UiTextSmall class="dashboard-row-link__meta">
                  {{ user.email || resolveText("admin.dashboard.labels.noEmail", "No email") }}
                  ·
                  {{ formatDateTime(user.created_at) }}
                </UiTextSmall>
              </div>

              <UiBadge
                :state="resolveUserBadgeState(user.status)"
                outline
                class="!px-3">
                {{ resolveUserStatusText(user.status) }}
              </UiBadge>
            </button>
          </div>
        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import { navigateTo } from "nuxt/app";
  import { definePageMeta, useLocalePath } from "~/.nuxt/imports";

  import AdminMetricChart from "~/components/block/charts/AdminMetricChart.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiBadge from "~/components/ui/UiBadge.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconClients from "~/components/ui/UiIconClients.vue";
  import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
  import UiIconTime from "~/components/ui/UiIconTime.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import { canAccessAdminPath } from "~/constants/adminPagePermissions";
  import useAppCore from "~/composables/useAppCore";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  type Bucket = "day" | "hour";
  type MetricPreset = {
    id: string;
    label: string;
    amount: number;
    unit: "days" | "weeks" | "months";
    bucket: Bucket;
  };
  type ChartFilters = {
    preset: string;
    date_from: string;
    date_to: string;
    bucket: Bucket;
  };
  type OnlineChartFilters = ChartFilters & {
    device_type: string;
    browser: string;
    os: string;
  };

  const AUTO_REFRESH_INTERVAL_MS = 30_000;
  const FILTER_RELOAD_DELAY_MS = 350;

  const metricRangePresets: MetricPreset[] = [
    { id: "1d", label: "24h", amount: 1, unit: "days", bucket: "hour" },
    { id: "7d", label: "7d", amount: 1, unit: "weeks", bucket: "day" },
    { id: "30d", label: "30d", amount: 30, unit: "days", bucket: "day" },
    { id: "90d", label: "90d", amount: 3, unit: "months", bucket: "day" },
  ];

  const { t, locale } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const toast = useToast();
  const adminAuthStore = useAdminAuthStore();
  const appCore = useAppCore();

  const dashboard = ref<any>(null);
  const isLoading = ref(false);
  const registrationsFilters = reactive<ChartFilters>(createChartFilters("30d"));
  const onlineFilters = reactive<OnlineChartFilters>(createOnlineChartFilters("7d"));

  let autoRefreshIntervalId: number | null = null;
  let filterReloadTimeoutId: number | null = null;

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

  function resolvePreset(presetId: string): MetricPreset {
    return metricRangePresets.find(preset => preset.id === presetId) ?? metricRangePresets[2];
  }

  function shiftDate(date: Date, preset: MetricPreset): Date {
    const shifted = new Date(date);

    if (preset.unit === "days") shifted.setDate(shifted.getDate() - preset.amount);
    if (preset.unit === "weeks") shifted.setDate(shifted.getDate() - preset.amount * 7);
    if (preset.unit === "months") shifted.setMonth(shifted.getMonth() - preset.amount);

    return shifted;
  }

  function toIsoRange(presetId: string) {
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

  function createChartFilters(presetId: string): ChartFilters {
    return {
      ...toIsoRange(presetId),
    };
  }

  function createOnlineChartFilters(presetId: string): OnlineChartFilters {
    return {
      ...toIsoRange(presetId),
      device_type: "",
      browser: "",
      os: "",
    };
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

  function formatPercent(value: number | string | null | undefined): string {
    const normalized = Number(value ?? 0);
    const sign = normalized > 0 ? "+" : "";

    return `${sign}${normalized.toFixed(2)}% ${resolveText("admin.dashboard.hints.previousPeriod", "vs prev period")}`;
  }

  function formatHours(value: number | string | null | undefined): string {
    return `${Number(value ?? 0).toFixed(2)} ${resolveText("admin.dashboard.units.hoursShort", "h")}`;
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

  function resolveUserBadgeState(status: string): string {
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
    }
  }

  function clearFilterReloadTimeout(): void {
    if (filterReloadTimeoutId === null || typeof window === "undefined") {
      return;
    }

    window.clearTimeout(filterReloadTimeoutId);
    filterReloadTimeoutId = null;
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

  function setPresetFilters(target: ChartFilters | OnlineChartFilters, presetId: string): void {
    Object.assign(target, toIsoRange(presetId));
  }

  async function applyDashboardPreset(section: "registrations" | "online", presetId: string): Promise<void> {
    if (section === "registrations") {
      setPresetFilters(registrationsFilters, presetId);
    }

    if (section === "online") {
      setPresetFilters(onlineFilters, presetId);
    }

    await loadDashboard({ silent: true });
  }

  function updateDashboardFilter(section: "registrations" | "online", key: string, value: string): void {
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

  async function handleManualRefresh(): Promise<void> {
    await loadDashboard({ silent: false });
  }

  function handleNavigate(to?: string): void {
    if (!to) {
      return;
    }

    navigateTo(localePath(to));
  }

  const registrationsTotal = computed(() =>
    (dashboard.value?.charts?.registrations?.points ?? []).reduce(
      (sum: number, point: any) => sum + Number(point?.value ?? 0),
      0
    )
  );

  const onlineSummary = computed(() => dashboard.value?.online?.summary ?? {});
  const topOnlineClients = computed(() => dashboard.value?.online?.top_clients ?? []);
  const recentUsers = computed(() => dashboard.value?.recent?.users ?? []);

  const summaryCards = computed(() =>
    [
      {
        id: "online_now",
        label: resolveText("admin.dashboard.cards.onlineNow", "Online now"),
        value: formatNumber(onlineSummary.value?.currently_online_users ?? 0),
        hint: resolveText("admin.dashboard.hints.activeClientsNow", "Clients currently active in cabinet"),
        icon: UiIconClients,
        to: "/clients",
        kind: "primary",
      },
      {
        id: "registrations_range",
        label: resolveText("admin.dashboard.cards.registrationsRange", "Registrations in range"),
        value: formatNumber(registrationsTotal.value),
        hint: resolveText("admin.dashboard.hints.selectedRange", "For the selected period"),
        icon: UiIconUser,
        to: "/clients",
        kind: "accent",
      },
      {
        id: "users",
        label: resolveText("admin.dashboard.cards.totalUsers", "Total users"),
        value: formatNumber(dashboard.value?.overview?.users?.value ?? 0),
        hint: formatPercent(dashboard.value?.overview?.users?.delta_percent ?? 0),
        icon: UiIconUser,
        to: "/clients",
        kind: "info",
      },
      {
        id: "unprocessed_verifications",
        label: resolveText("admin.dashboard.cards.unprocessedVerifications", "Unprocessed verification requests"),
        value: formatNumber(dashboard.value?.priority?.unprocessed_verifications ?? 0),
        hint: resolveText("admin.dashboard.hints.requiresReview", "Requests waiting for moderation"),
        icon: UiIconDocuments,
        to: "/verifications",
        kind: "warning",
      },
      {
        id: "processing_transactions",
        label: resolveText("admin.dashboard.cards.processingTransactions", "Transactions in processing"),
        value: formatNumber(dashboard.value?.priority?.processing_transactions ?? 0),
        hint: resolveText("admin.dashboard.hints.processingNow", "Transactions currently being processed"),
        icon: UiIconTime,
        to: "/payments",
        kind: "success",
      },
      {
        id: "unprocessed_transactions",
        label: resolveText("admin.dashboard.cards.unprocessedTransactions", "Unprocessed transactions"),
        value: formatNumber(dashboard.value?.priority?.unprocessed_transactions ?? 0),
        hint: resolveText("admin.dashboard.hints.awaitingHandling", "Transactions waiting to be handled"),
        icon: UiIconWarningFull,
        to: "/payments",
        kind: "danger",
      },
    ].filter(card => canAccessPath(card.to))
  );

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
      data: (dashboard.value?.charts?.online?.points ?? []).map((point: any) =>
        Number((Number(point.value ?? 0) / 3600).toFixed(2))
      ),
      color: resolveCssVar("--ui-primary-main", "#719edf"),
      area: true,
      type: "line" as const,
      yAxisIndex: 0,
      suffix: ` ${resolveText("admin.dashboard.units.hoursShort", "h")}`,
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
      suffix: ` ${resolveText("admin.dashboard.units.hoursShort", "h")}`,
      position: "left" as const,
    },
    {
      name: resolveText("admin.dashboard.series.onlineClients", "Clients online"),
      position: "right" as const,
    },
  ]);

  function formatOnlineTooltip({ dataIndex, category }: { dataIndex: number; category: string }): string {
    const point = (dashboard.value?.charts?.online?.points ?? [])[dataIndex];
    if (!point) {
      return category;
    }

    const users = Array.isArray(point.users) ? point.users : [];
    const usersHtml =
      users.length > 0
        ? users
            .map((user: any) => {
              const hours = Number(user.total_online_hours ?? 0).toFixed(2);
              const label = user.name || user.email || user.user_id;
              const clientUrl = localePath(`/clients/${user.user_id}`);

              return `
                <div class="admin-chart-tooltip__user-row">
                  <a class="admin-chart-tooltip__user-link" href="${clientUrl}">
                    ${label}
                  </a>
                  <span>${hours} ${resolveText("admin.dashboard.units.hoursShort", "h")} · ${Number(
                    user.sessions_count ?? 0
                  )} ${resolveText("admin.dashboard.labels.sessionsShort", "sessions")}</span>
                </div>
              `;
            })
            .join("")
        : `<div class="admin-chart-tooltip__empty">${resolveText(
            "admin.dashboard.tooltip.noClientsBucket",
            "No clients in this bucket."
          )}</div>`;

    return `
      <div class="admin-chart-tooltip admin-chart-tooltip--online">
        <div class="admin-chart-tooltip__title">${category}</div>
        <div class="admin-chart-tooltip__row">
          <span>${resolveText("admin.dashboard.tooltip.totalHours", "Total hours")}</span>
          <strong>${Number((Number(point.value ?? 0) / 3600).toFixed(2))} ${resolveText(
            "admin.dashboard.units.hoursShort",
            "h"
          )}</strong>
        </div>
        <div class="admin-chart-tooltip__row">
          <span>${resolveText("admin.dashboard.tooltip.uniqueClients", "Unique clients")}</span>
          <strong>${Number(point.users_count ?? 0)}</strong>
        </div>
        <div class="admin-chart-tooltip__row">
          <span>${resolveText("admin.dashboard.tooltip.sessions", "Sessions")}</span>
          <strong>${Number(point.sessions_count ?? 0)}</strong>
        </div>
        <div class="admin-chart-tooltip__users">${usersHtml}</div>
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
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleVisibilityChange);
    }

    void loadDashboard();
  });

  onBeforeUnmount(() => {
    stopAutoRefresh();
    clearFilterReloadTimeout();

    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", handleVisibilityChange);
    }
  });
</script>

<style lang="scss" scoped>
  .admin-dashboard {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    color: var(--ui-text-main);
  }

  .admin-dashboard__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .admin-dashboard__heading {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .admin-dashboard__title {
    min-width: 0;
  }

  .admin-dashboard__subtitle,
  .admin-dashboard__updated-at,
  .admin-dashboard__filter-label,
  .dashboard-summary-card__label,
  .dashboard-summary-card__hint,
  .dashboard-chart-card__subtitle,
  .dashboard-list-card__subtitle,
  .dashboard-empty-state,
  .dashboard-row-link__meta {
    color: var(--ui-text-secondary);
  }

  .admin-dashboard__header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .admin-dashboard__live-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  .admin-dashboard__live-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 28%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-primary-main) 10%, var(--ui-background-panel));
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .admin-dashboard__refresh-button {
    flex-shrink: 0;
  }

  .admin-dashboard__summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .admin-dashboard__summary-link {
    appearance: none;
    border: 0;
    padding: 0;
    background: transparent;
    width: 100%;
    min-width: 0;
    text-align: left;
  }

  .dashboard-summary-card {
    position: relative;
    overflow: hidden;
    height: 100%;
    border-radius: 18px;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-background-card) 88%, transparent), transparent),
      var(--ui-background-panel);
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .dashboard-summary-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: var(--ui-primary-main);
  }

  .dashboard-summary-card__body {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 148px;
    padding: 18px;
  }

  .dashboard-summary-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .dashboard-summary-card__copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dashboard-summary-card__label {
    line-height: 1.45;
  }

  .dashboard-summary-card__value,
  .dashboard-chart-card__title,
  .dashboard-list-card__title,
  .dashboard-row-link__title {
    color: var(--ui-text-main);
  }

  .dashboard-summary-card__value {
    font-size: 28px;
    line-height: 1.1;
    word-break: break-word;
  }

  .dashboard-summary-card__hint {
    line-height: 1.45;
  }

  .dashboard-summary-card__icon-wrap {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ui-primary-main) 14%, transparent);
    color: var(--ui-primary-main);
  }

  .dashboard-summary-card__icon {
    width: 20px;
    height: 20px;
  }

  .admin-dashboard__summary-link:hover .dashboard-summary-card,
  .dashboard-row-link:hover,
  .dashboard-preset-button:hover {
    transform: translateY(-2px);
  }

  .dashboard-summary-card--primary::before,
  .dashboard-summary-card--primary .dashboard-summary-card__icon-wrap {
    background: color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
    color: var(--ui-primary-main);
  }

  .dashboard-summary-card--primary::before {
    background: var(--ui-primary-main);
  }

  .dashboard-summary-card--accent::before {
    background: var(--ui-primary-accent);
  }

  .dashboard-summary-card--accent .dashboard-summary-card__icon-wrap {
    background: color-mix(in srgb, var(--ui-primary-accent) 18%, transparent);
    color: var(--ui-primary-accent);
  }

  .dashboard-summary-card--info::before {
    background: var(--color-info);
  }

  .dashboard-summary-card--info .dashboard-summary-card__icon-wrap {
    background: color-mix(in srgb, var(--color-info) 18%, transparent);
    color: var(--color-info);
  }

  .dashboard-summary-card--warning::before {
    background: var(--color-warning);
  }

  .dashboard-summary-card--warning .dashboard-summary-card__icon-wrap {
    background: color-mix(in srgb, var(--color-warning) 18%, transparent);
    color: var(--color-warning);
  }

  .dashboard-summary-card--success::before {
    background: var(--color-success);
  }

  .dashboard-summary-card--success .dashboard-summary-card__icon-wrap {
    background: color-mix(in srgb, var(--color-success) 18%, transparent);
    color: var(--color-success);
  }

  .dashboard-summary-card--danger::before {
    background: var(--color-danger);
  }

  .dashboard-summary-card--danger .dashboard-summary-card__icon-wrap {
    background: color-mix(in srgb, var(--color-danger) 18%, transparent);
    color: var(--color-danger);
  }

  .admin-dashboard__charts,
  .admin-dashboard__panels {
    display: grid;
    gap: 18px;
  }

  .dashboard-panel-card {
    overflow: hidden;
    border-radius: 18px;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-background-card) 90%, transparent), transparent),
      var(--ui-background-panel);
  }

  .dashboard-chart-card,
  .dashboard-list-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 20px;
  }

  .dashboard-chart-card__header,
  .dashboard-list-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .dashboard-chart-card__heading,
  .dashboard-list-card__header > div:first-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dashboard-chart-card__presets {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
  }

  .dashboard-preset-button {
    appearance: none;
    min-height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 600;
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;
  }

  .dashboard-preset-button--active {
    border-color: color-mix(in srgb, var(--ui-primary-main) 54%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-primary-main) 12%, var(--ui-background-card));
    color: var(--ui-text-main);
  }

  .dashboard-chart-card__filters {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .dashboard-chart-card__filters--online {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .admin-dashboard__filter {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    border-radius: 14px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
  }

  .admin-dashboard__filter-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .admin-dashboard__panels {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-list-card__rows {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .dashboard-empty-state {
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px dashed var(--color-stroke-ui-light);
    border-radius: 16px;
    background: color-mix(in srgb, var(--ui-background-card) 82%, transparent);
  }

  .dashboard-row-link {
    appearance: none;
    border: 1px solid var(--color-stroke-ui-light);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    border-radius: 16px;
    background: var(--ui-background-card);
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .dashboard-row-link:hover {
    border-color: color-mix(in srgb, var(--ui-primary-main) 32%, var(--color-stroke-ui-light));
  }

  .dashboard-row-link__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dashboard-row-link__title,
  .dashboard-row-link__meta {
    text-align: left;
  }

  :deep(.admin-chart-tooltip--online) {
    min-width: 300px;
  }

  :deep(.admin-chart-tooltip__users) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    max-height: 220px;
    overflow: auto;
  }

  :deep(.admin-chart-tooltip__user-row) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: var(--ui-text-main);
  }

  :deep(.admin-chart-tooltip__user-link) {
    color: var(--ui-primary-main);
    text-decoration: none;
  }

  :deep(.admin-chart-tooltip__user-link:hover) {
    text-decoration: underline;
  }

  :deep(.admin-chart-tooltip__empty) {
    color: var(--ui-text-secondary);
    margin-top: 8px;
  }

  @media (max-width: 1240px) {
    .admin-dashboard__summary-grid,
    .admin-dashboard__panels {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dashboard-chart-card__filters,
    .dashboard-chart-card__filters--online {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 820px) {
    .admin-dashboard__header,
    .dashboard-chart-card__header,
    .dashboard-list-card__header {
      flex-direction: column;
    }

    .admin-dashboard__header-actions,
    .admin-dashboard__live-meta {
      width: 100%;
      align-items: flex-start;
    }

    .dashboard-chart-card__presets {
      justify-content: flex-start;
    }

    .dashboard-row-link {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 640px) {
    .admin-dashboard {
      padding: 16px;
      gap: 16px;
    }

    .admin-dashboard__summary-grid,
    .admin-dashboard__panels,
    .dashboard-chart-card__filters,
    .dashboard-chart-card__filters--online {
      grid-template-columns: 1fr;
    }

    .dashboard-chart-card,
    .dashboard-list-card {
      padding: 16px;
    }

    .dashboard-summary-card__body {
      min-height: 134px;
      padding: 16px;
    }
  }
</style>
