<template>
  <div
    class="admin-dashboard"
    :class="{ 'admin-dashboard--refreshing': isRefreshing }">
    <div class="admin-dashboard__header">
      <div class="admin-dashboard__heading">
        <h1 class="admin-dashboard__title">
          {{ resolveText("admin.dashboard.title", "Admin dashboard") }}
        </h1>
        <p class="admin-dashboard__subtitle">
          {{
            resolveText(
              "admin.dashboard.subtitle",
              "Live overview of registrations, moderation queues, transactions, and online activity."
            )
          }}
        </p>
      </div>

      <div class="admin-dashboard__header-actions">
        <span class="dashboard-inline-status dashboard-inline-status--info">
          <span class="dashboard-inline-status__dot" />
          <span>{{ resolveText("admin.dashboard.autoRefresh", "Live updates every 30 seconds") }}</span>
        </span>
        <span class="admin-dashboard__updated-at">{{ lastUpdatedText }}</span>
        <PrimeButton
          icon="pi pi-refresh"
          rounded
          text
          :loading="isLoading"
          :aria-label="resolveText('admin.dashboard.actions.refresh', 'Refresh dashboard')"
          :title="resolveText('admin.dashboard.actions.refresh', 'Refresh dashboard')"
          @click="handleManualRefresh" />
      </div>
    </div>

    <template v-if="isInitialLoading">
      <div class="admin-dashboard__summary-grid">
        <PrimeCard
          v-for="item in summarySkeletonCards"
          :key="`summary-skeleton-${item}`"
          class="dashboard-summary-card dashboard-summary-card--skeleton">
          <template #content>
            <div class="dashboard-summary-card__body">
              <div class="dashboard-summary-card__top">
                <div class="dashboard-summary-card__copy">
                  <PrimeSkeleton
                    width="62%"
                    height="14px"
                    border-radius="999px" />
                  <PrimeSkeleton
                    width="44%"
                    height="32px"
                    border-radius="10px" />
                </div>
                <PrimeSkeleton
                  shape="circle"
                  size="44px" />
              </div>
            </div>
          </template>
        </PrimeCard>
      </div>

      <div class="admin-dashboard__charts">
        <div
          v-for="item in chartSkeletonCards"
          :key="`chart-skeleton-${item}`"
          class="dashboard-panel-card dashboard-panel-card--skeleton">
          <div class="dashboard-chart-card">
            <div class="dashboard-chart-card__header">
              <div class="dashboard-chart-card__heading">
                <PrimeSkeleton
                  width="220px"
                  height="22px"
                  border-radius="8px" />
                <PrimeSkeleton
                  width="320px"
                  height="14px"
                  border-radius="999px" />
              </div>
              <div class="dashboard-chart-card__presets">
                <PrimeSkeleton
                  v-for="preset in metricRangePresets"
                  :key="`chart-preset-skeleton-${item}-${preset.id}`"
                  width="52px"
                  height="34px"
                  border-radius="999px" />
              </div>
            </div>
            <div class="dashboard-chart-card__filters dashboard-chart-card__filters--skeleton">
              <PrimeSkeleton
                v-for="filter in 6"
                :key="`filter-skeleton-${item}-${filter}`"
                height="64px"
                border-radius="16px" />
            </div>
            <PrimeSkeleton
              height="300px"
              border-radius="18px" />
          </div>
        </div>
      </div>

      <div class="admin-dashboard__panels">
        <PrimeCard
          v-for="item in chartSkeletonCards"
          :key="`list-skeleton-${item}`"
          class="dashboard-panel-card dashboard-panel-card--skeleton">
          <template #content>
            <div class="dashboard-list-card">
              <div class="dashboard-list-card__header">
                <div>
                  <PrimeSkeleton
                    width="210px"
                    height="22px"
                    border-radius="8px" />
                  <PrimeSkeleton
                    width="280px"
                    height="14px"
                    border-radius="999px" />
                </div>
                <PrimeSkeleton
                  width="48px"
                  height="28px"
                  border-radius="999px" />
              </div>
              <div class="dashboard-list-card__rows">
                <PrimeSkeleton
                  v-for="row in listSkeletonRows"
                  :key="`row-skeleton-${item}-${row}`"
                  height="62px"
                  border-radius="16px" />
              </div>
            </div>
          </template>
        </PrimeCard>
      </div>
    </template>

    <template v-else>
      <div class="admin-dashboard__summary-grid">
        <button
          v-for="card in summaryCards"
          :key="card.id"
          type="button"
          class="admin-dashboard__summary-link"
          @click="handleNavigate(card.to)">
          <PrimeCard
            class="dashboard-summary-card"
            :class="`dashboard-summary-card--${card.kind}`">
            <template #content>
              <div class="dashboard-summary-card__body">
                <div class="dashboard-summary-card__top">
                  <div class="dashboard-summary-card__copy">
                    <span class="dashboard-summary-card__label">{{ card.label }}</span>
                    <strong class="dashboard-summary-card__value">{{ card.value }}</strong>
                  </div>

                  <div class="dashboard-summary-card__icon-wrap">
                    <component
                      :is="card.icon"
                      class="dashboard-summary-card__icon" />
                  </div>
                </div>
              </div>
            </template>
          </PrimeCard>
        </button>
      </div>

      <div class="admin-dashboard__charts">
        <div class="dashboard-panel-card dashboard-panel-card--chart">
          <div class="dashboard-chart-card">
            <div class="dashboard-chart-card__header">
              <div class="dashboard-chart-card__heading">
                <h2 class="dashboard-chart-card__title">
                  {{ resolveText("admin.dashboard.charts.onlineTitle", "Online activity") }}
                </h2>
                <p class="dashboard-chart-card__subtitle">
                  {{
                    resolveText(
                      "admin.dashboard.charts.onlineSubtitle",
                      "Current online users, accumulated online hours, and active sessions."
                    )
                  }}
                </p>
              </div>

              <div class="dashboard-chart-card__presets">
                <PrimeButton
                  v-for="preset in metricRangePresets"
                  :key="`online-${preset.id}`"
                  size="small"
                  rounded
                  :outlined="onlineFilters.preset !== preset.id"
                  :text="onlineFilters.preset !== preset.id"
                  :label="preset.label"
                  @click="applyDashboardPreset('online', preset.id)" />
              </div>
            </div>

            <div class="dashboard-chart-card__filters dashboard-chart-card__filters--online">
              <label class="admin-dashboard__filter">
                <span class="admin-dashboard__filter-label">
                  {{ resolveText("admin.dashboard.filters.from", "From") }}
                </span>
                <PrimeDatePicker
                  :model-value="toDatePickerValue(onlineFilters.date_from)"
                  date-format="yy-mm-dd"
                  show-icon
                  fluid
                  @update:model-value="value => updateDateFilter('online', 'date_from', value)" />
              </label>

              <label class="admin-dashboard__filter">
                <span class="admin-dashboard__filter-label">
                  {{ resolveText("admin.dashboard.filters.to", "To") }}
                </span>
                <PrimeDatePicker
                  :model-value="toDatePickerValue(onlineFilters.date_to)"
                  date-format="yy-mm-dd"
                  show-icon
                  fluid
                  @update:model-value="value => updateDateFilter('online', 'date_to', value)" />
              </label>

              <label class="admin-dashboard__filter">
                <span class="admin-dashboard__filter-label">
                  {{ resolveText("admin.dashboard.filters.step", "Step") }}
                </span>
                <PrimeSelect
                  :model-value="onlineFilters.bucket"
                  :options="bucketSelectOptions"
                  option-label="label"
                  option-value="value"
                  fluid
                  @update:model-value="value => updateDashboardFilter('online', 'bucket', value || 'day')" />
              </label>

              <label class="admin-dashboard__filter">
                <span class="admin-dashboard__filter-label">
                  {{ resolveText("admin.dashboard.filters.device", "Device") }}
                </span>
                <PrimeSelect
                  :model-value="onlineFilters.device_type"
                  :options="deviceSelectOptions"
                  option-label="label"
                  option-value="value"
                  show-clear
                  fluid
                  :placeholder="resolveText('admin.dashboard.filters.allDevices', 'All devices')"
                  @update:model-value="value => updateDashboardFilter('online', 'device_type', value || '')" />
              </label>

              <label class="admin-dashboard__filter">
                <span class="admin-dashboard__filter-label">
                  {{ resolveText("admin.dashboard.filters.browser", "Browser") }}
                </span>
                <PrimeSelect
                  :model-value="onlineFilters.browser"
                  :options="browserSelectOptions"
                  option-label="label"
                  option-value="value"
                  show-clear
                  fluid
                  :placeholder="resolveText('admin.dashboard.filters.allBrowsers', 'All browsers')"
                  @update:model-value="value => updateDashboardFilter('online', 'browser', value || '')" />
              </label>

              <label class="admin-dashboard__filter">
                <span class="admin-dashboard__filter-label">
                  {{ resolveText("admin.dashboard.filters.os", "OS") }}
                </span>
                <PrimeSelect
                  :model-value="onlineFilters.os"
                  :options="osSelectOptions"
                  option-label="label"
                  option-value="value"
                  show-clear
                  fluid
                  :placeholder="resolveText('admin.dashboard.filters.allOs', 'All OS')"
                  @update:model-value="value => updateDashboardFilter('online', 'os', value || '')" />
              </label>
            </div>

            <div class="dashboard-chart-card__chart">
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
          </div>
        </div>

        <div class="dashboard-panel-card dashboard-panel-card--chart">
          <div class="dashboard-chart-card">
            <div class="dashboard-chart-card__header">
              <div class="dashboard-chart-card__heading">
                <h2 class="dashboard-chart-card__title">
                  {{ resolveText("admin.dashboard.charts.registrationsTitle", "Client registrations") }}
                </h2>
                <p class="dashboard-chart-card__subtitle">
                  {{
                    resolveText("admin.dashboard.charts.registrationsSubtitle", "New clients for the selected range.")
                  }}
                </p>
              </div>

              <div class="dashboard-chart-card__presets">
                <PrimeButton
                  v-for="preset in metricRangePresets"
                  :key="`registrations-${preset.id}`"
                  size="small"
                  rounded
                  :outlined="registrationsFilters.preset !== preset.id"
                  :text="registrationsFilters.preset !== preset.id"
                  :label="preset.label"
                  @click="applyDashboardPreset('registrations', preset.id)" />
              </div>
            </div>

            <div class="dashboard-chart-card__filters dashboard-chart-card__filters--compact">
              <label class="admin-dashboard__filter">
                <span class="admin-dashboard__filter-label">
                  {{ resolveText("admin.dashboard.filters.from", "From") }}
                </span>
                <PrimeDatePicker
                  :model-value="toDatePickerValue(registrationsFilters.date_from)"
                  date-format="yy-mm-dd"
                  show-icon
                  fluid
                  @update:model-value="value => updateDateFilter('registrations', 'date_from', value)" />
              </label>

              <label class="admin-dashboard__filter">
                <span class="admin-dashboard__filter-label">
                  {{ resolveText("admin.dashboard.filters.to", "To") }}
                </span>
                <PrimeDatePicker
                  :model-value="toDatePickerValue(registrationsFilters.date_to)"
                  date-format="yy-mm-dd"
                  show-icon
                  fluid
                  @update:model-value="value => updateDateFilter('registrations', 'date_to', value)" />
              </label>

              <label class="admin-dashboard__filter">
                <span class="admin-dashboard__filter-label">
                  {{ resolveText("admin.dashboard.filters.step", "Step") }}
                </span>
                <PrimeSelect
                  :model-value="registrationsFilters.bucket"
                  :options="bucketSelectOptions"
                  option-label="label"
                  option-value="value"
                  fluid
                  @update:model-value="value => updateDashboardFilter('registrations', 'bucket', value || 'day')" />
              </label>
            </div>

            <div class="dashboard-chart-card__chart">
              <AdminMetricChart
                :categories="registrationLabels"
                :series="registrationSeries"
                :height="320" />
            </div>
          </div>
        </div>
      </div>

      <div class="admin-dashboard__panels">
        <PrimeCard class="dashboard-panel-card">
          <template #content>
            <div class="dashboard-list-card">
              <div class="dashboard-list-card__header">
                <div>
                  <h2 class="dashboard-list-card__title">
                    {{ resolveText("admin.dashboard.panels.topOnline", "Top online clients") }}
                  </h2>
                  <p class="dashboard-list-card__subtitle">
                    {{
                      resolveText(
                        "admin.dashboard.panels.topOnlineSubtitle",
                        "Who spent the most time online in the selected period."
                      )
                    }}
                  </p>
                </div>

                <span class="dashboard-list-card__count">{{ formatNumber(topOnlineClients.length) }}</span>
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
                  <span class="dashboard-row-link__avatar">{{ getInitials(user.name || user.email) }}</span>
                  <span class="dashboard-row-link__main">
                    <span class="dashboard-row-link__title">{{ user.name }}</span>
                    <span class="dashboard-row-link__meta">
                      {{ user.email || resolveText("admin.dashboard.labels.noEmail", "No email") }}
                      ·
                      {{ formatHours(user.total_online_hours) }}
                      ·
                      {{ formatNumber(user.sessions_count) }}
                      {{ resolveText("admin.dashboard.labels.sessionsShort", "sessions") }}
                    </span>
                  </span>

                  <span
                    class="dashboard-inline-status"
                    :class="user.is_online ? 'dashboard-inline-status--success' : 'dashboard-inline-status--muted'">
                    <span class="dashboard-inline-status__dot" />
                    <span>
                      {{
                        user.is_online
                          ? resolveText("admin.dashboard.status.online", "Online")
                          : resolveText("admin.dashboard.status.offline", "Offline")
                      }}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </template>
        </PrimeCard>

        <PrimeCard class="dashboard-panel-card">
          <template #content>
            <div class="dashboard-list-card">
              <div class="dashboard-list-card__header">
                <div>
                  <h2 class="dashboard-list-card__title">
                    {{ resolveText("admin.dashboard.recentUsers", "Recent users") }}
                  </h2>
                  <p class="dashboard-list-card__subtitle">
                    {{
                      resolveText(
                        "admin.dashboard.panels.recentUsersSubtitle",
                        "Newly registered clients with their current account status."
                      )
                    }}
                  </p>
                </div>

                <span class="dashboard-list-card__count">{{ formatNumber(recentUsers.length) }}</span>
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
                  <span class="dashboard-row-link__avatar">{{ getInitials(user.name || user.email) }}</span>
                  <span class="dashboard-row-link__main">
                    <span class="dashboard-row-link__title">{{ user.name }}</span>
                    <span class="dashboard-row-link__meta">
                      {{ user.email || resolveText("admin.dashboard.labels.noEmail", "No email") }}
                      ·
                      {{ formatDateTime(user.created_at) }}
                    </span>
                  </span>

                  <span
                    class="dashboard-inline-status"
                    :class="`dashboard-inline-status--${resolveUserStatusTone(user.status)}`">
                    <span class="dashboard-inline-status__dot" />
                    <span>{{ resolveUserStatusText(user.status) }}</span>
                  </span>
                </button>
              </div>
            </div>
          </template>
        </PrimeCard>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import type Echo from "laravel-echo";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import { navigateTo, useNuxtApp } from "nuxt/app";
  import { definePageMeta, useLocalePath } from "~/.nuxt/imports";

  import AdminMetricChart from "~/components/block/charts/AdminMetricChart.vue";
  import useEventBus from "~/composables/useEventBus";
  import UiIconClients from "~/components/ui/UiIconClients.vue";
  import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
  import UiIconTime from "~/components/ui/UiIconTime.vue";
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
  const REALTIME_REFRESH_DELAY_MS = 900;
  const ADMIN_NOTIFICATION_RECEIVED_EVENT = "admin-notification-received";
  const DASHBOARD_NOTIFICATION_TYPES = ["payments.withdrawal.created", "verification.request.created"];

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
  const { $echo } = useNuxtApp() as { $echo?: Echo<any> };

  const dashboard = ref<any>(null);
  const isLoading = ref(false);
  const hasLoadedDashboard = ref(false);
  const registrationsFilters = reactive<ChartFilters>(createChartFilters("30d"));
  const onlineFilters = reactive<OnlineChartFilters>(createOnlineChartFilters("7d"));
  const summarySkeletonCards = [1, 2, 3];
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

  const isInitialLoading = computed(() => !hasLoadedDashboard.value || (isLoading.value && !dashboard.value));
  const isRefreshing = computed(() => isLoading.value && Boolean(dashboard.value));

  const toPrimeOptions = (options: Array<{ value: string; text?: string; label?: string }>) =>
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

  function updateDateFilter(section: "registrations" | "online", key: string, value: Date | string | null): void {
    updateDashboardFilter(section, key, toDateFilterValue(value));
  }

  function resolveUserStatusTone(status: string): "success" | "danger" | "warning" {
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

  function handleRealtimeDashboardUpdate(): void {
    scheduleRealtimeReload();
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
        // noop
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

  function handleNavigate(to?: string): void {
    if (!to) {
      return;
    }

    navigateTo(localePath(to));
  }

  const onlineSummary = computed(() => dashboard.value?.online?.summary ?? {});
  const topOnlineClients = computed(() => dashboard.value?.online?.top_clients ?? []);
  const recentUsers = computed(() => dashboard.value?.recent?.users ?? []);

  const summaryCards = computed(() =>
    [
      {
        id: "online_now",
        label: resolveText("admin.dashboard.cards.onlineNow", "Online now"),
        value: formatNumber(onlineSummary.value?.currently_online_users ?? 0),
        icon: UiIconClients,
        to: "/clients",
        kind: "primary",
      },
      {
        id: "transactions_queue",
        label: resolveText("admin.dashboard.cards.transactionsQueue", "Transactions queue"),
        value: `${formatNumber(dashboard.value?.priority?.processing_transactions ?? 0)} / ${formatNumber(
          dashboard.value?.priority?.unprocessed_transactions ?? 0
        )}`,
        icon: UiIconTime,
        to: "/payments",
        kind: "success",
      },
      {
        id: "unprocessed_verifications",
        label: resolveText("admin.dashboard.cards.unprocessedVerifications", "Unprocessed verification requests"),
        value: formatNumber(dashboard.value?.priority?.unprocessed_verifications ?? 0),
        icon: UiIconDocuments,
        to: "/verifications",
        kind: "warning",
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
      return category;
    }

    const users = Array.isArray(point.users) ? point.users : [];
    const usersHtml =
      users.length > 0
        ? users
            .map((user: any) => {
              const label = user.name || user.email || user.user_id;
              const clientUrl = localePath(`/clients/${user.user_id}`);

              return `
                <div class="admin-chart-tooltip__user-row">
                  <a class="admin-chart-tooltip__user-link" href="${clientUrl}">
                    ${label}
                  </a>
                  <span>${formatHours(user.total_online_hours)} · ${Number(user.sessions_count ?? 0)} ${resolveText(
                    "admin.dashboard.labels.sessionsShort",
                    "sessions"
                  )}</span>
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
          <strong>${formatSecondsDuration(point.value ?? 0)}</strong>
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
</script>

<style lang="scss" scoped>
  .admin-dashboard {
    --dashboard-glass-bg: color-mix(in srgb, var(--ui-background-card) 74%, transparent);
    --dashboard-glass-bg-strong: color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
    --dashboard-glass-border: color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
    --dashboard-glass-shadow: 0 18px 56px color-mix(in srgb, #000000 20%, transparent);

    position: relative;
    width: 100%;
    max-width: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(12px, 1.35vw, 22px);
    color: var(--ui-text-main);
    animation: dashboard-enter 0.32s ease both;
  }

  .admin-dashboard--refreshing::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    border-radius: 24px;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--ui-primary-main) 7%, transparent),
      transparent
    );
    animation: dashboard-refresh-sheen 1.35s ease infinite;
  }

  .admin-dashboard__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .admin-dashboard__heading {
    min-width: 0;
  }

  .admin-dashboard__title {
    margin: 0;
    color: var(--ui-text-main);
    font-size: clamp(24px, 2.1vw, 36px);
    font-weight: 850;
    line-height: 1.02;
    letter-spacing: -0.035em;
  }

  .admin-dashboard__subtitle {
    max-width: 900px;
    margin: 6px 0 0;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  .admin-dashboard__header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .admin-dashboard__updated-at {
    max-width: 280px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.35;
    text-align: right;
  }

  .admin-dashboard__summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(158px, 1fr));
    gap: 10px;
  }

  .admin-dashboard__summary-link {
    min-width: 0;
    width: 100%;
    padding: 0;
    border: 0;
    appearance: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .dashboard-summary-card,
  .dashboard-panel-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    height: 100%;
    border: 1px solid var(--dashboard-glass-border);
    border-radius: 22px;
    background:
      radial-gradient(
        circle at 16% 0%,
        color-mix(in srgb, var(--summary-accent, var(--ui-primary-main)) 10%, transparent),
        transparent 38%
      ),
      linear-gradient(145deg, var(--dashboard-glass-bg), var(--dashboard-glass-bg-strong));
    box-shadow: var(--dashboard-glass-shadow);
    backdrop-filter: blur(22px) saturate(135%);
    -webkit-backdrop-filter: blur(22px) saturate(135%);
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      background-color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .dashboard-summary-card :deep(.p-card-body),
  .dashboard-panel-card :deep(.p-card-body) {
    position: relative;
    z-index: 1;
  }

  .dashboard-summary-card::after,
  .dashboard-panel-card::after {
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

  .dashboard-summary-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    z-index: 1;
    height: 2px;
    background: linear-gradient(
      90deg,
      var(--summary-accent, var(--ui-primary-main)),
      color-mix(in srgb, var(--summary-accent, var(--ui-primary-main)) 24%, transparent)
    );
  }

  .admin-dashboard__summary-link:hover .dashboard-summary-card,
  .dashboard-panel-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--summary-accent, var(--ui-primary-main)) 34%, var(--color-stroke-ui-light));
    box-shadow: 0 22px 68px color-mix(in srgb, var(--summary-accent, var(--ui-primary-main)) 12%, #000000 20%);
  }

  .admin-dashboard__summary-link:hover .dashboard-summary-card::after,
  .dashboard-panel-card:hover::after {
    animation: dashboard-glass-glint 1.1s ease both;
  }

  .dashboard-summary-card__body {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 10px;
    min-height: 96px;
    padding: 13px;
  }

  .dashboard-summary-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .dashboard-summary-card__copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .dashboard-summary-card__label,
  .dashboard-chart-card__subtitle,
  .dashboard-list-card__subtitle,
  .dashboard-empty-state,
  .dashboard-row-link__meta,
  .admin-dashboard__filter-label {
    color: var(--ui-text-secondary);
  }

  .dashboard-summary-card__label {
    font-size: 11px;
    font-weight: 760;
    line-height: 1.3;
    letter-spacing: 0.015em;
  }

  .dashboard-summary-card__value {
    color: var(--ui-text-main);
    font-size: clamp(24px, 2.1vw, 34px);
    font-weight: 880;
    line-height: 1;
    letter-spacing: -0.04em;
    word-break: break-word;
  }

  .dashboard-summary-card__icon-wrap {
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    color: var(--summary-accent, var(--ui-primary-main));
    background: color-mix(in srgb, var(--summary-accent, var(--ui-primary-main)) 13%, transparent);
  }

  .dashboard-summary-card__icon {
    width: 18px;
    height: 18px;
  }

  .dashboard-summary-card--primary {
    --summary-accent: var(--ui-primary-main);
  }

  .dashboard-summary-card--accent {
    --summary-accent: var(--ui-primary-accent);
  }

  .dashboard-summary-card--info {
    --summary-accent: var(--color-info);
  }

  .dashboard-summary-card--warning {
    --summary-accent: var(--color-warning);
  }

  .dashboard-summary-card--success {
    --summary-accent: var(--color-success);
  }

  .dashboard-summary-card--danger {
    --summary-accent: var(--color-danger);
  }

  .admin-dashboard__charts {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    align-items: stretch;
  }

  .admin-dashboard__panels {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .dashboard-chart-card,
  .dashboard-list-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
  }

  .dashboard-list-card {
    gap: 9px;
    padding: 11px;
  }

  .dashboard-chart-card__header,
  .dashboard-list-card__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 12px;
  }

  .dashboard-chart-card__heading,
  .dashboard-list-card__header > div:first-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .dashboard-chart-card__title,
  .dashboard-list-card__title {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 17px;
    font-weight: 820;
    line-height: 1.16;
    letter-spacing: -0.02em;
  }

  .dashboard-chart-card__subtitle,
  .dashboard-list-card__subtitle {
    margin: 0;
    font-size: 12px;
    line-height: 1.42;
  }

  .dashboard-chart-card__presets {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 6px;
  }

  .dashboard-chart-card__filters {
    display: grid;
    gap: 8px;
    align-items: end;
  }

  .dashboard-chart-card__filters--online {
    grid-template-columns: repeat(6, minmax(112px, 1fr));
  }

  .dashboard-chart-card__filters--compact {
    grid-template-columns: repeat(3, minmax(128px, 1fr));
  }

  .dashboard-chart-card__filters--skeleton {
    grid-template-columns: repeat(6, minmax(112px, 1fr));
  }

  .admin-dashboard__filter {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .admin-dashboard__filter-label {
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .dashboard-chart-card__chart {
    min-height: 320px;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 62%, transparent);
    border-radius: 18px;
    background:
      radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--ui-primary-main) 9%, transparent), transparent 32%),
      color-mix(in srgb, var(--ui-background-card) 46%, transparent);
  }

  .admin-dashboard__filter :deep(.p-datepicker),
  .admin-dashboard__filter :deep(.p-select) {
    width: 100%;
  }

  .admin-dashboard__filter :deep(.p-inputtext),
  .admin-dashboard__filter :deep(.p-select),
  .admin-dashboard__filter :deep(.p-datepicker-input),
  .admin-dashboard__filter :deep(.p-select-label) {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-background-card) 78%, transparent);
  }

  .admin-dashboard__filter :deep(.p-inputtext),
  .admin-dashboard__filter :deep(.p-select) {
    border-color: color-mix(in srgb, var(--ui-primary-main) 18%, var(--color-stroke-ui-light));
    box-shadow: none;
  }

  .admin-dashboard__filter :deep(.p-inputtext::placeholder),
  .admin-dashboard__filter :deep(.p-select-label.p-placeholder) {
    color: var(--ui-text-secondary);
  }

  .admin-dashboard__filter :deep(.p-inputtext:enabled:hover),
  .admin-dashboard__filter :deep(.p-select:not(.p-disabled):hover) {
    border-color: color-mix(in srgb, var(--ui-primary-main) 34%, var(--color-stroke-ui-light));
  }

  .admin-dashboard__filter :deep(.p-inputtext:enabled:focus),
  .admin-dashboard__filter :deep(.p-select.p-focus),
  .admin-dashboard__filter :deep(.p-datepicker:has(.p-inputtext:focus)) {
    border-color: color-mix(in srgb, var(--ui-primary-main) 50%, var(--color-stroke-ui-light));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
  }

  .admin-dashboard__filter :deep(.p-select-dropdown),
  .admin-dashboard__filter :deep(.p-datepicker-dropdown) {
    color: var(--ui-text-main);
  }

  .dashboard-list-card__count {
    min-width: 30px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 9px;
    border-radius: 999px;
    color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 11%, transparent);
    font-size: 12px;
    font-weight: 820;
  }

  .dashboard-list-card__rows {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .dashboard-row-link {
    width: 100%;
    min-height: 50px;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 8px 9px;
    border: 1px solid transparent;
    border-radius: 15px;
    appearance: none;
    background: color-mix(in srgb, var(--ui-background-card) 48%, transparent);
    cursor: pointer;
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      background-color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .dashboard-row-link:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--ui-primary-main) 28%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-primary-main) 7%, var(--ui-background-card));
    box-shadow: 0 10px 24px color-mix(in srgb, #000000 12%, transparent);
  }

  .dashboard-row-link__avatar {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    color: var(--ui-text-invert);
    background: linear-gradient(
      135deg,
      var(--ui-primary-main),
      color-mix(in srgb, var(--ui-primary-main) 45%, var(--ui-primary-accent))
    );
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.04em;
  }

  .dashboard-row-link__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    text-align: left;
  }

  .dashboard-row-link__title {
    overflow: hidden;
    color: var(--ui-text-main);
    font-size: 13px;
    font-weight: 820;
    line-height: 1.22;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dashboard-row-link__meta {
    overflow: hidden;
    font-size: 11px;
    font-weight: 620;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dashboard-inline-status {
    --status-color: var(--ui-text-secondary);

    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    color: var(--status-color);
    font-size: 12px;
    font-weight: 760;
    line-height: 1.2;
    white-space: nowrap;
  }

  .dashboard-inline-status__dot {
    width: 7px;
    height: 7px;
    flex: 0 0 7px;
    border-radius: 999px;
    background: var(--status-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-color) 15%, transparent);
  }

  .dashboard-inline-status--info {
    --status-color: var(--color-info);
  }

  .dashboard-inline-status--success {
    --status-color: var(--color-success);
  }

  .dashboard-inline-status--warning {
    --status-color: var(--color-warning);
  }

  .dashboard-inline-status--danger {
    --status-color: var(--color-danger);
  }

  .dashboard-inline-status--muted {
    --status-color: var(--ui-text-secondary);
  }

  .dashboard-empty-state {
    min-height: 132px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    border: 1px dashed var(--color-stroke-ui-light);
    border-radius: 16px;
    background: color-mix(in srgb, var(--ui-background-card) 48%, transparent);
    font-size: 13px;
    font-weight: 650;
    text-align: center;
  }

  :deep(.admin-chart-tooltip--online) {
    min-width: 300px;
  }

  :deep(.admin-chart-tooltip__users) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 220px;
    margin-top: 8px;
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
    margin-top: 8px;
    color: var(--ui-text-secondary);
  }

  @keyframes dashboard-enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes dashboard-refresh-sheen {
    0% {
      opacity: 0;
      transform: translateX(-34%);
    }
    40%,
    70% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateX(34%);
    }
  }

  @keyframes dashboard-glass-glint {
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

  @media (max-width: 1180px) {
    .admin-dashboard__summary-grid,
    .admin-dashboard__panels {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dashboard-chart-card__filters--online,
    .dashboard-chart-card__filters--skeleton {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 820px) {
    .admin-dashboard__header,
    .dashboard-chart-card__header,
    .dashboard-list-card__header {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .admin-dashboard__header-actions {
      justify-content: flex-start;
    }

    .admin-dashboard__updated-at {
      max-width: none;
      text-align: left;
    }

    .dashboard-chart-card__presets {
      justify-content: flex-start;
    }

    .dashboard-row-link {
      grid-template-columns: 34px minmax(0, 1fr);
      align-items: start;
    }

    .dashboard-row-link .dashboard-inline-status {
      grid-column: 2;
      justify-self: start;
    }
  }

  @media (max-width: 640px) {
    .admin-dashboard {
      padding: 12px;
    }

    .admin-dashboard__summary-grid,
    .admin-dashboard__panels,
    .dashboard-chart-card__filters--online,
    .dashboard-chart-card__filters--compact,
    .dashboard-chart-card__filters--skeleton {
      grid-template-columns: 1fr;
    }

    .dashboard-chart-card {
      padding: 12px;
    }

    .dashboard-list-card {
      padding: 10px;
    }

    .dashboard-chart-card__chart {
      min-height: 300px;
    }
  }
</style>
