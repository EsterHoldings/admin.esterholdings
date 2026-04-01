<template>
  <div class="admin-profile-activity">
    <div class="admin-profile-activity__presets">
      <button
        v-for="preset in metricRangePresets"
        :key="preset.id"
        type="button"
        class="admin-profile-activity__preset-button"
        :class="{ 'admin-profile-activity__preset-button--active': filters.preset === preset.id }"
        @click="applyPreset(preset.id)">
        {{ preset.label }}
      </button>
    </div>

    <div class="admin-profile-activity__filters">
      <div class="admin-profile-activity__filter">
        <span class="admin-profile-activity__filter-label">
          {{ resolveText("admin.profile.activity.filters.from", "From") }}
        </span>
        <UiInput
          type="date"
          :value="toDateInputValue(filters.date_from)"
          @input="value => updateFilter('date_from', value)" />
      </div>

      <div class="admin-profile-activity__filter">
        <span class="admin-profile-activity__filter-label">
          {{ resolveText("admin.profile.activity.filters.to", "To") }}
        </span>
        <UiInput
          type="date"
          :value="toDateInputValue(filters.date_to)"
          @input="value => updateFilter('date_to', value)" />
      </div>

      <div class="admin-profile-activity__filter">
        <span class="admin-profile-activity__filter-label">
          {{ resolveText("admin.profile.activity.filters.bucket", "Step") }}
        </span>
        <UiSelect
          :data="bucketOptions"
          :value="filters.bucket"
          without-no-select
          @change="value => updateFilter('bucket', value || 'day')" />
      </div>

      <div class="admin-profile-activity__filter">
        <span class="admin-profile-activity__filter-label">
          {{ resolveText("admin.profile.activity.filters.device", "Device") }}
        </span>
        <UiSelect
          :data="deviceOptions"
          :value="filters.device_type"
          @change="value => updateFilter('device_type', value || '')" />
      </div>

      <div class="admin-profile-activity__filter">
        <span class="admin-profile-activity__filter-label">
          {{ resolveText("admin.profile.activity.filters.browser", "Browser") }}
        </span>
        <UiSelect
          :data="browserOptions"
          :value="filters.browser"
          @change="value => updateFilter('browser', value || '')" />
      </div>

      <div class="admin-profile-activity__filter">
        <span class="admin-profile-activity__filter-label">
          {{ resolveText("admin.profile.activity.filters.os", "OS") }}
        </span>
        <UiSelect
          :data="osOptions"
          :value="filters.os"
          @change="value => updateFilter('os', value || '')" />
      </div>

      <UiButtonDefault
        state="info"
        :isLoading="isLoading"
        @click="loadActivity">
        {{ resolveText("admin.profile.actions.refresh", "Refresh") }}
      </UiButtonDefault>
    </div>

    <div class="admin-profile-activity__summary-grid">
      <PanelDefault
        v-for="card in summaryCards"
        :key="card.id"
        class="admin-profile-activity__summary-card">
        <UiTextSmall class="admin-profile-activity__summary-label">{{ card.label }}</UiTextSmall>
        <UiTextH5 class="admin-profile-activity__summary-value">{{ card.value }}</UiTextH5>
        <UiTextSmall class="admin-profile-activity__summary-hint">{{ card.hint }}</UiTextSmall>
      </PanelDefault>
    </div>

    <div class="admin-profile-activity__main-grid">
      <PanelDefault class="admin-profile-activity__panel">
        <div class="admin-profile-activity__panel-header">
          <div>
            <UiTextH5 class="admin-profile-activity__panel-title">
              {{ resolveText("admin.profile.activity.sections.chart", "Online activity") }}
            </UiTextH5>
            <UiTextSmall class="admin-profile-activity__panel-subtitle">
              {{
                resolveText(
                  "admin.profile.activity.descriptions.chart",
                  "Monitor online time and active sessions across the selected period."
                )
              }}
            </UiTextSmall>
          </div>
        </div>

        <AdminMetricChart
          :categories="timelineLabels"
          :categoryKeys="timelineKeys"
          :series="chartSeries"
          :yAxes="chartAxes"
          :height="320" />
      </PanelDefault>

      <PanelDefault class="admin-profile-activity__panel">
        <div class="admin-profile-activity__panel-header">
          <div>
            <UiTextH5 class="admin-profile-activity__panel-title">
              {{ resolveText("admin.profile.activity.sections.breakdowns", "Environment breakdown") }}
            </UiTextH5>
            <UiTextSmall class="admin-profile-activity__panel-subtitle">
              {{
                resolveText(
                  "admin.profile.activity.descriptions.breakdowns",
                  "Which devices, browsers and operating systems were used most often."
                )
              }}
            </UiTextSmall>
          </div>
        </div>

        <div class="admin-profile-activity__breakdowns">
          <div class="admin-profile-activity__breakdown-block">
            <div class="admin-profile-activity__breakdown-title">
              {{ resolveText("admin.profile.activity.filters.device", "Device") }}
            </div>
            <div
              v-if="deviceBreakdowns.length === 0"
              class="admin-profile-activity__empty-inline">
              {{ resolveText("admin.profile.activity.empty.breakdowns", "No data yet.") }}
            </div>
            <div
              v-for="item in deviceBreakdowns"
              :key="`device-${item.key}`"
              class="admin-profile-activity__breakdown-row">
              <span>{{ item.label }}</span>
              <span>{{ formatHours(item.hours) }} · {{ item.sessions_count }}</span>
            </div>
          </div>

          <div class="admin-profile-activity__breakdown-block">
            <div class="admin-profile-activity__breakdown-title">
              {{ resolveText("admin.profile.activity.filters.browser", "Browser") }}
            </div>
            <div
              v-if="browserBreakdowns.length === 0"
              class="admin-profile-activity__empty-inline">
              {{ resolveText("admin.profile.activity.empty.breakdowns", "No data yet.") }}
            </div>
            <div
              v-for="item in browserBreakdowns"
              :key="`browser-${item.key}`"
              class="admin-profile-activity__breakdown-row">
              <span>{{ item.label }}</span>
              <span>{{ formatHours(item.hours) }} · {{ item.sessions_count }}</span>
            </div>
          </div>

          <div class="admin-profile-activity__breakdown-block">
            <div class="admin-profile-activity__breakdown-title">
              {{ resolveText("admin.profile.activity.filters.os", "OS") }}
            </div>
            <div
              v-if="osBreakdowns.length === 0"
              class="admin-profile-activity__empty-inline">
              {{ resolveText("admin.profile.activity.empty.breakdowns", "No data yet.") }}
            </div>
            <div
              v-for="item in osBreakdowns"
              :key="`os-${item.key}`"
              class="admin-profile-activity__breakdown-row">
              <span>{{ item.label }}</span>
              <span>{{ formatHours(item.hours) }} · {{ item.sessions_count }}</span>
            </div>
          </div>
        </div>
      </PanelDefault>
    </div>

    <PanelDefault class="admin-profile-activity__panel">
      <div class="admin-profile-activity__panel-header">
        <div>
          <UiTextH5 class="admin-profile-activity__panel-title">
            {{ resolveText("admin.profile.activity.sections.sessions", "Online sessions") }}
          </UiTextH5>
          <UiTextSmall class="admin-profile-activity__panel-subtitle">
            {{
              resolveText(
                "admin.profile.activity.descriptions.sessions",
                "Recent presence sessions in the admin panel with technical details."
              )
            }}
          </UiTextSmall>
        </div>
      </div>

      <div
        v-if="sessionRows.length === 0"
        class="admin-profile-activity__empty-state">
        {{ resolveText("admin.profile.activity.empty.sessions", "No online sessions recorded yet.") }}
      </div>

      <div
        v-else
        class="admin-profile-activity__sessions">
        <div
          v-for="session in sessionRows"
          :key="session.id"
          class="admin-profile-activity__session-card">
          <div class="admin-profile-activity__session-top">
            <div class="admin-profile-activity__session-main">
              <strong>{{ session.ip || resolveText("admin.profile.activity.labels.unknown", "Unknown") }}</strong>
              <UiBadge
                :state="session.is_online ? 'success' : 'warning'"
                outline
                class="!px-3">
                {{
                  session.is_online
                    ? resolveText("admin.profile.status.online", "Online")
                    : resolveText("admin.profile.status.offline", "Offline")
                }}
              </UiBadge>
            </div>

            <span class="admin-profile-activity__session-duration">{{ session.duration_human }}</span>
          </div>

          <div class="admin-profile-activity__session-meta">
            <span>{{ formatDateTime(session.started_at) }}</span>
            <span>{{ formatDateTime(session.ended_at) }}</span>
            <span>{{ session.device_type || resolveText("admin.profile.activity.labels.unknown", "Unknown") }}</span>
            <span>{{ session.browser || resolveText("admin.profile.activity.labels.unknown", "Unknown") }}</span>
            <span>{{ session.os || resolveText("admin.profile.activity.labels.unknown", "Unknown") }}</span>
            <span>{{
              session.city || session.country || resolveText("admin.profile.activity.labels.unknown", "Unknown")
            }}</span>
          </div>

          <div
            v-if="session.user_agent"
            class="admin-profile-activity__session-agent">
            {{ session.user_agent }}
          </div>
        </div>
      </div>
    </PanelDefault>

    <div class="admin-profile-activity__logs-grid">
      <PanelDefault class="admin-profile-activity__panel">
        <div class="admin-profile-activity__panel-header">
          <div>
            <UiTextH5 class="admin-profile-activity__panel-title">
              {{ resolveText("admin.profile.activity.sections.actions", "Admin actions") }}
            </UiTextH5>
            <UiTextSmall class="admin-profile-activity__panel-subtitle">
              {{
                resolveText(
                  "admin.profile.activity.descriptions.actions",
                  "Profile updates, security changes and write actions from the admin panel."
                )
              }}
            </UiTextSmall>
          </div>
        </div>

        <div
          v-if="actionRows.length === 0"
          class="admin-profile-activity__empty-state">
          {{ resolveText("admin.profile.activity.empty.actions", "No actions recorded yet.") }}
        </div>

        <div
          v-else
          class="admin-profile-activity__log-list">
          <div
            v-for="row in actionRows"
            :key="row.id"
            class="admin-profile-activity__log-card">
            <div class="admin-profile-activity__log-top">
              <div class="admin-profile-activity__log-title-wrap">
                <strong>{{ row.title }}</strong>
                <UiBadge
                  :state="resolveLogBadge(row.type)"
                  outline
                  class="!px-3">
                  {{ row.type }}
                </UiBadge>
              </div>
              <span class="admin-profile-activity__log-time">{{ formatDateTime(row.created_at) }}</span>
            </div>

            <div
              v-if="row.description"
              class="admin-profile-activity__log-description">
              {{ row.description }}
            </div>

            <div class="admin-profile-activity__log-meta">
              <span v-if="row.method">{{ row.method }}</span>
              <span v-if="row.path">{{ row.path }}</span>
              <span v-if="row.route_name">{{ row.route_name }}</span>
              <span v-if="row.ip">{{ row.ip }}</span>
            </div>
          </div>
        </div>
      </PanelDefault>

      <PanelDefault class="admin-profile-activity__panel">
        <div class="admin-profile-activity__panel-header">
          <div>
            <UiTextH5 class="admin-profile-activity__panel-title">
              {{ resolveText("admin.profile.activity.sections.chatConnections", "Chat connections") }}
            </UiTextH5>
            <UiTextSmall class="admin-profile-activity__panel-subtitle">
              {{
                resolveText(
                  "admin.profile.activity.descriptions.chatConnections",
                  "All connections and disconnections from support chats."
                )
              }}
            </UiTextSmall>
          </div>
        </div>

        <div
          v-if="chatRows.length === 0"
          class="admin-profile-activity__empty-state">
          {{ resolveText("admin.profile.activity.empty.chatConnections", "No chat connections recorded yet.") }}
        </div>

        <div
          v-else
          class="admin-profile-activity__log-list">
          <div
            v-for="row in chatRows"
            :key="row.id"
            class="admin-profile-activity__log-card">
            <div class="admin-profile-activity__log-top">
              <div class="admin-profile-activity__log-title-wrap">
                <strong>{{ row.title }}</strong>
                <UiBadge
                  state="success"
                  outline
                  class="!px-3">
                  {{ row.action }}
                </UiBadge>
              </div>
              <span class="admin-profile-activity__log-time">{{ formatDateTime(row.created_at) }}</span>
            </div>

            <div
              v-if="row.description"
              class="admin-profile-activity__log-description">
              {{ row.description }}
            </div>

            <div class="admin-profile-activity__log-meta">
              <span v-if="row.meta?.ticket_id">Ticket #{{ row.meta.ticket_id }}</span>
              <span v-if="row.meta?.session_id">Session {{ row.meta.session_id }}</span>
              <span v-if="row.ip">{{ row.ip }}</span>
              <span v-if="row.path">{{ row.path }}</span>
            </div>
          </div>
        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import AdminMetricChart from "~/components/block/charts/AdminMetricChart.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiBadge from "~/components/ui/UiBadge.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";

  type Bucket = "day" | "hour";
  type MetricPreset = {
    id: string;
    label: string;
    amount: number;
    unit: "hours" | "days" | "weeks" | "months";
    bucket: Bucket;
  };

  const props = withDefaults(
    defineProps<{
      profileData?: Record<string, any> | null;
      isLoading?: boolean;
    }>(),
    {
      profileData: null,
      isLoading: false,
    }
  );

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();

  const activity = ref<any>(null);
  const isLoading = ref(false);

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const metricRangePresets: MetricPreset[] = [
    { id: "1d", label: "1d", amount: 1, unit: "days", bucket: "hour" },
    { id: "3d", label: "3d", amount: 3, unit: "days", bucket: "hour" },
    { id: "1w", label: "1w", amount: 1, unit: "weeks", bucket: "day" },
    { id: "2w", label: "2w", amount: 2, unit: "weeks", bucket: "day" },
    { id: "1m", label: "1m", amount: 1, unit: "months", bucket: "day" },
    { id: "3m", label: "3m", amount: 3, unit: "months", bucket: "day" },
  ];

  const resolvePreset = (presetId: string) =>
    metricRangePresets.find(preset => preset.id === presetId) ?? metricRangePresets[2];

  const shiftDate = (date: Date, preset: MetricPreset) => {
    const shifted = new Date(date);

    if (preset.unit === "hours") shifted.setHours(shifted.getHours() - preset.amount);
    if (preset.unit === "days") shifted.setDate(shifted.getDate() - preset.amount);
    if (preset.unit === "weeks") shifted.setDate(shifted.getDate() - preset.amount * 7);
    if (preset.unit === "months") shifted.setMonth(shifted.getMonth() - preset.amount);

    return shifted;
  };

  const toPresetRange = (presetId: string) => {
    const preset = resolvePreset(presetId);
    const now = new Date();
    const from = shiftDate(now, preset);

    return {
      preset: preset.id,
      date_from: from.toISOString(),
      date_to: now.toISOString(),
      bucket: preset.bucket as Bucket,
    };
  };

  const filters = reactive({
    ...toPresetRange("1w"),
    device_type: "",
    browser: "",
    os: "",
    limit: 30,
  });

  const bucketOptions = computed(() => [
    { id: "day", value: "day", text: resolveText("admin.profile.activity.filters.day", "By day") },
    { id: "hour", value: "hour", text: resolveText("admin.profile.activity.filters.hour", "By hour") },
  ]);

  const metrics = computed(() => activity.value?.metrics ?? {});
  const timeline = computed(() => (Array.isArray(metrics.value?.timeline) ? metrics.value.timeline : []));
  const sessions = computed(() => (Array.isArray(metrics.value?.sessions) ? metrics.value.sessions : []));
  const actionRows = computed(() => (Array.isArray(activity.value?.actions) ? activity.value.actions : []));
  const chatRows = computed(() =>
    Array.isArray(activity.value?.chat_connections) ? activity.value.chat_connections : []
  );

  const deviceBreakdowns = computed(() => metrics.value?.breakdowns?.devices ?? []);
  const browserBreakdowns = computed(() => metrics.value?.breakdowns?.browsers ?? []);
  const osBreakdowns = computed(() => metrics.value?.breakdowns?.oses ?? []);

  const deviceOptions = computed(() => [
    ...((metrics.value?.filter_options?.device_types ?? []).map((item: any) => ({
      id: item.value,
      value: item.value,
      text: item.text,
    })) as Array<{ id: string; value: string; text: string }>),
  ]);

  const browserOptions = computed(() => [
    ...((metrics.value?.filter_options?.browsers ?? []).map((item: any) => ({
      id: item.value,
      value: item.value,
      text: item.text,
    })) as Array<{ id: string; value: string; text: string }>),
  ]);

  const osOptions = computed(() => [
    ...((metrics.value?.filter_options?.oses ?? []).map((item: any) => ({
      id: item.value,
      value: item.value,
      text: item.text,
    })) as Array<{ id: string; value: string; text: string }>),
  ]);

  const timelineLabels = computed(() => timeline.value.map((row: any) => String(row?.label ?? "")));
  const timelineKeys = computed(() => timeline.value.map((row: any) => String(row?.key ?? "")));

  const chartSeries = computed(() => [
    {
      name: resolveText("admin.profile.activity.series.hours", "Online hours"),
      type: "line" as const,
      color: "#719edf",
      area: true,
      suffix: "h",
      data: timeline.value.map((row: any) => Number((Number(row?.value ?? 0) / 3600).toFixed(2))),
    },
    {
      name: resolveText("admin.profile.activity.series.sessions", "Sessions"),
      type: "bar" as const,
      color: "#39c98d",
      yAxisIndex: 1,
      data: timeline.value.map((row: any) => Number(row?.sessions_count ?? 0)),
    },
  ]);

  const chartAxes = computed(() => [
    {
      name: resolveText("admin.profile.activity.series.hours", "Online hours"),
      suffix: "h",
      position: "left" as const,
    },
    {
      name: resolveText("admin.profile.activity.series.sessions", "Sessions"),
      position: "right" as const,
    },
  ]);

  const sessionRows = computed(() => sessions.value);

  const summaryCards = computed(() => {
    const metricsSummary = metrics.value?.summary ?? {};
    const summary = activity.value?.summary ?? {};
    const onlineState = activity.value?.online ?? {};

    return [
      {
        id: "online",
        label: resolveText("admin.profile.activity.summary.onlineNow", "Online now"),
        value: onlineState?.is_online
          ? resolveText("admin.profile.status.online", "Online")
          : resolveText("admin.profile.status.offline", "Offline"),
        hint: formatDateTime(onlineState?.last_seen_at),
      },
      {
        id: "hours",
        label: resolveText("admin.profile.activity.summary.totalHours", "Total online time"),
        value: formatHours(metricsSummary?.total_online_hours ?? 0),
        hint: resolveText("admin.profile.activity.summary.periodHint", "For the selected period"),
      },
      {
        id: "sessions",
        label: resolveText("admin.profile.activity.summary.sessions", "Sessions"),
        value: String(metricsSummary?.sessions_count ?? 0),
        hint:
          resolveText("admin.profile.activity.summary.avgSession", "Average session") +
          `: ${formatDuration(metricsSummary?.average_session_seconds ?? 0)}`,
      },
      {
        id: "actions",
        label: resolveText("admin.profile.activity.summary.actions", "Actions"),
        value: String(summary?.actions_count ?? 0),
        hint:
          resolveText("admin.profile.activity.summary.lastActivity", "Last activity") +
          `: ${formatDateTime(summary?.last_activity_at)}`,
      },
      {
        id: "chat",
        label: resolveText("admin.profile.activity.summary.chatConnections", "Chat connections"),
        value: String(summary?.chat_connections_count ?? 0),
        hint: resolveText("admin.profile.activity.summary.liveSupport", "Support chat connect/disconnect events"),
      },
    ];
  });

  const loadActivity = async () => {
    isLoading.value = true;

    try {
      const response = await appCore.adminModules.profile.getActivity({
        date_from: filters.date_from,
        date_to: filters.date_to,
        bucket: filters.bucket,
        device_type: filters.device_type,
        browser: filters.browser,
        os: filters.os,
        limit: filters.limit,
      });

      activity.value = response?.data?.data ?? null;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? resolveText("admin.profile.activity.errors.load", "Failed to load activity.")
      );
    } finally {
      isLoading.value = false;
    }
  };

  const applyPreset = async (presetId: string) => {
    const range = toPresetRange(presetId);
    filters.preset = range.preset;
    filters.date_from = range.date_from;
    filters.date_to = range.date_to;
    filters.bucket = range.bucket;
    await loadActivity();
  };

  const updateFilter = (field: keyof typeof filters, value: string) => {
    if (field === "date_from" || field === "date_to") {
      filters.preset = "custom";
      filters[field] = value;
      return;
    }

    filters[field] = value as never;
  };

  const toDateInputValue = (value?: string | null) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  };

  const formatHours = (value: number) => `${Number(value ?? 0).toFixed(2)}h`;

  const formatDuration = (seconds: number) => {
    const total = Number(seconds ?? 0);
    if (total <= 0) return "0m";

    const hours = Math.floor(total / 3600);
    const minutes = Math.max(1, Math.floor((total % 3600) / 60));

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, "0")}m`;
    }

    return `${minutes}m`;
  };

  const resolveLogBadge = (type: string) => {
    if (type === "security") return "warning";
    if (type === "profile") return "info";
    if (type === "support_chat") return "success";
    return "secondary";
  };

  watch(
    () => props.profileData?.id,
    async value => {
      if (!value) {
        return;
      }

      await loadActivity();
    },
    { immediate: true }
  );
</script>

<style scoped lang="scss">
  .admin-profile-activity {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .admin-profile-activity__presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .admin-profile-activity__preset-button {
    border: 1px solid rgba(113, 158, 223, 0.18);
    background: rgba(255, 255, 255, 0.03);
    color: var(--ui-text-secondary);
    border-radius: 999px;
    padding: 8px 12px;
    transition: 0.2s ease;
  }

  .admin-profile-activity__preset-button--active {
    color: var(--ui-text-main);
    border-color: rgba(113, 158, 223, 0.48);
    background: rgba(113, 158, 223, 0.12);
  }

  .admin-profile-activity__filters {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr)) auto;
    gap: 12px;
    align-items: end;
  }

  .admin-profile-activity__filter {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .admin-profile-activity__filter-label,
  .admin-profile-activity__summary-label,
  .admin-profile-activity__summary-hint,
  .admin-profile-activity__panel-subtitle {
    color: var(--ui-text-secondary);
  }

  .admin-profile-activity__summary-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
  }

  .admin-profile-activity__summary-card,
  .admin-profile-activity__panel {
    padding: 20px;
  }

  .admin-profile-activity__summary-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .admin-profile-activity__summary-value,
  .admin-profile-activity__panel-title {
    color: var(--ui-text-main);
  }

  .admin-profile-activity__main-grid,
  .admin-profile-activity__logs-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .admin-profile-activity__panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .admin-profile-activity__panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .admin-profile-activity__breakdowns {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .admin-profile-activity__breakdown-block {
    border-radius: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .admin-profile-activity__breakdown-title {
    color: var(--ui-text-main);
    font-weight: 700;
  }

  .admin-profile-activity__breakdown-row,
  .admin-profile-activity__session-meta,
  .admin-profile-activity__log-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    color: var(--ui-text-secondary);
  }

  .admin-profile-activity__empty-inline,
  .admin-profile-activity__empty-state {
    color: var(--ui-text-secondary);
    text-align: center;
  }

  .admin-profile-activity__empty-state {
    min-height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    border: 1px dashed rgba(255, 255, 255, 0.08);
  }

  .admin-profile-activity__sessions,
  .admin-profile-activity__log-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .admin-profile-activity__session-card,
  .admin-profile-activity__log-card {
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .admin-profile-activity__session-top,
  .admin-profile-activity__log-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .admin-profile-activity__session-main,
  .admin-profile-activity__log-title-wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    color: var(--ui-text-main);
  }

  .admin-profile-activity__session-duration,
  .admin-profile-activity__log-time {
    color: var(--ui-text-secondary);
    white-space: nowrap;
  }

  .admin-profile-activity__session-agent,
  .admin-profile-activity__log-description {
    color: var(--ui-text-main);
    line-height: 1.5;
  }

  @media (max-width: 1240px) {
    .admin-profile-activity__filters {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .admin-profile-activity__summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .admin-profile-activity__main-grid,
    .admin-profile-activity__logs-grid,
    .admin-profile-activity__breakdowns {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .admin-profile-activity__filters,
    .admin-profile-activity__summary-grid {
      grid-template-columns: 1fr;
    }

    .admin-profile-activity__session-top,
    .admin-profile-activity__log-top {
      flex-direction: column;
    }
  }
</style>
