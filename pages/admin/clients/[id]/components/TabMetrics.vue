<template>
  <div class="client-tab-space client-metrics">
    <div class="client-metrics__presets">
      <PrimeButton
        v-for="preset in metricRangePresets"
        :key="preset.id"
        :label="preset.label"
        size="small"
        rounded
        :outlined="filters.preset !== preset.id"
        :severity="filters.preset === preset.id ? 'primary' : 'secondary'"
        @click="applyPreset(preset.id)" />
    </div>

    <PrimeCard class="client-tab-card">
      <template #content>
        <div class="client-card-body">
          <div class="client-metrics__filters">
            <label class="client-metrics__filter">
              <span>{{ resolveText("admin.clients.metrics.filters.from", "From") }}</span>
              <PrimeInputText
                type="date"
                :model-value="toDateInputValue(filters.date_from)"
                @update:model-value="value => updateFilter('date_from', String(value ?? ''))" />
            </label>
            <label class="client-metrics__filter">
              <span>{{ resolveText("admin.clients.metrics.filters.to", "To") }}</span>
              <PrimeInputText
                type="date"
                :model-value="toDateInputValue(filters.date_to)"
                @update:model-value="value => updateFilter('date_to', String(value ?? ''))" />
            </label>
            <label class="client-metrics__filter">
              <span>{{ resolveText("admin.clients.metrics.filters.bucket", "Step") }}</span>
              <PrimeSelect
                :model-value="filters.bucket"
                :options="bucketOptions"
                option-label="text"
                option-value="value"
                @update:model-value="value => updateFilter('bucket', String(value || 'day'))" />
            </label>
            <label class="client-metrics__filter">
              <span>{{ resolveText("admin.clients.metrics.filters.device", "Device") }}</span>
              <PrimeSelect
                :model-value="filters.device_type"
                :options="deviceOptions"
                option-label="text"
                option-value="value"
                show-clear
                @update:model-value="value => updateFilter('device_type', String(value || ''))" />
            </label>
            <label class="client-metrics__filter">
              <span>{{ resolveText("admin.clients.metrics.filters.browser", "Browser") }}</span>
              <PrimeSelect
                :model-value="filters.browser"
                :options="browserOptions"
                option-label="text"
                option-value="value"
                show-clear
                @update:model-value="value => updateFilter('browser', String(value || ''))" />
            </label>
            <label class="client-metrics__filter">
              <span>{{ resolveText("admin.clients.metrics.filters.os", "OS") }}</span>
              <PrimeSelect
                :model-value="filters.os"
                :options="osOptions"
                option-label="text"
                option-value="value"
                show-clear
                @update:model-value="value => updateFilter('os', String(value || ''))" />
            </label>
            <PrimeButton
              :label="resolveText('admin.clients.metrics.actions.refresh', 'Refresh')"
              icon="pi pi-refresh"
              :loading="isLoading"
              @click="loadMetrics" />
          </div>
        </div>
      </template>
    </PrimeCard>

    <div class="client-metrics__summary-grid">
      <PrimeCard
        v-for="card in summaryCards"
        :key="card.id"
        class="client-tab-card client-metrics__summary-card">
        <template #content>
          <div class="client-card-body">
            <span class="client-card-subtitle">{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
            <span class="client-muted">{{ card.hint }}</span>
          </div>
        </template>
      </PrimeCard>
    </div>

    <PrimeCard class="client-tab-card">
      <template #content>
        <div class="client-card-body">
          <div class="client-card-header">
            <div>
              <h3 class="client-card-title">{{ resolveText("admin.clients.metrics.timeline.title", "Online by period") }}</h3>
              <p class="client-card-subtitle">{{ resolveText("admin.clients.metrics.timeline.description", "Hours spent by the client in the cabinet.") }}</p>
            </div>
          </div>
          <AdminMetricChart
            :categories="timelineLabels"
            :series="timelineSeries"
            suffix="h"
            :height="320" />
        </div>
      </template>
    </PrimeCard>

    <PrimeCard class="client-tab-card">
      <template #content>
        <div class="client-card-body">
          <div class="client-card-header">
            <div>
              <h3 class="client-card-title">{{ resolveText("admin.clients.metrics.breakdowns.title", "Device and browser breakdown") }}</h3>
              <p class="client-card-subtitle">{{ resolveText("admin.clients.metrics.breakdowns.description", "What the client used while working in the cabinet.") }}</p>
            </div>
          </div>

          <div class="client-metrics__breakdowns">
            <div
              v-for="block in breakdownBlocks"
              :key="block.id"
              class="client-metrics__breakdown-block">
              <strong>{{ block.title }}</strong>
              <span
                v-if="block.items.length === 0"
                class="client-muted">
                {{ resolveText("admin.clients.metrics.empty.noData", "No data") }}
              </span>
              <div
                v-for="item in block.items"
                :key="`${block.id}-${item.key}`"
                class="client-metrics__breakdown-row">
                <span>{{ item.label }}</span>
                <span>{{ formatHours(item.hours) }} · {{ resolveText("admin.clients.metrics.sessionsCount", "{count} sessions").replace('{count}', String(item.sessions_count)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </PrimeCard>

    <PrimeCard class="client-tab-card">
      <template #content>
        <div class="client-card-body">
          <div class="client-card-header">
            <div>
              <h3 class="client-card-title">{{ resolveText("admin.clients.metrics.sessions.title", "Recent online sessions") }}</h3>
              <p class="client-card-subtitle">{{ resolveText("admin.clients.metrics.sessions.description", "When and where the client visited the cabinet.") }}</p>
            </div>
          </div>

          <div
            v-if="sessionRows.length === 0"
            class="client-metrics__empty">
            {{ resolveText("admin.clients.metrics.sessions.empty", "No sessions yet") }}
          </div>

          <div
            v-else
            class="client-metrics__sessions">
            <article
              v-for="session in sessionRows"
              :key="session.id"
              class="client-metrics__session">
              <div class="client-metrics__session-top">
                <div class="client-metrics__session-ip">
                  <strong>{{ session.ip || "Unknown" }}</strong>
                  <span
                    class="client-inline-status"
                    :class="session.is_online ? 'client-inline-status--success' : 'client-inline-status--warning'">
                    {{ session.is_online ? resolveText("admin.clients.online.onlineNow", "Online") : resolveText("admin.clients.online.offlineNow", "Offline") }}
                  </span>
                </div>
                <span class="client-metrics__session-duration">{{ session.duration_human }}</span>
              </div>

              <div class="client-metrics__session-meta">
                <span>{{ session.started_at_label }}</span>
                <span>{{ session.ended_at_label }}</span>
                <span>{{ session.device_label }}</span>
                <span>{{ session.browser }}</span>
                <span>{{ session.os }}</span>
                <span>{{ session.location_label }}</span>
              </div>

              <p
                v-if="session.user_agent"
                class="client-metrics__session-agent">
                {{ session.user_agent }}
              </p>
            </article>
          </div>
        </div>
      </template>
    </PrimeCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import useAppCore from "~/composables/useAppCore";
import AdminMetricChart from "~/components/block/charts/AdminMetricChart.vue";

const props = defineProps({
  clientId: {
    type: String,
    default: "",
  },
});

const { t, locale } = useI18n({ useScope: "global" });
const toast = useToast();
const appCore = useAppCore();
const isLoading = ref(false);
const metrics = ref<any>(null);

type Bucket = "day" | "hour";
type MetricPreset = {
  id: string;
  label: string;
  amount: number;
  unit: "hours" | "days" | "weeks" | "months" | "years";
  bucket: Bucket;
};

const metricRangePresets: MetricPreset[] = [
  { id: "1h", label: "1h", amount: 1, unit: "hours", bucket: "hour" },
  { id: "3h", label: "3h", amount: 3, unit: "hours", bucket: "hour" },
  { id: "5h", label: "5h", amount: 5, unit: "hours", bucket: "hour" },
  { id: "1d", label: "1d", amount: 1, unit: "days", bucket: "hour" },
  { id: "3d", label: "3d", amount: 3, unit: "days", bucket: "hour" },
  { id: "1w", label: "1w", amount: 1, unit: "weeks", bucket: "day" },
  { id: "3w", label: "3w", amount: 3, unit: "weeks", bucket: "day" },
  { id: "1m", label: "1m", amount: 1, unit: "months", bucket: "day" },
  { id: "3m", label: "3m", amount: 3, unit: "months", bucket: "day" },
  { id: "6m", label: "6m", amount: 6, unit: "months", bucket: "day" },
  { id: "1y", label: "1y", amount: 1, unit: "years", bucket: "day" },
];

const resolvePreset = (presetId: string) => metricRangePresets.find(preset => preset.id === presetId) ?? metricRangePresets[7];

const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const shiftDate = (date: Date, preset: MetricPreset) => {
  const shifted = new Date(date);

  if (preset.unit === "hours") shifted.setHours(shifted.getHours() - preset.amount);
  if (preset.unit === "days") shifted.setDate(shifted.getDate() - preset.amount);
  if (preset.unit === "weeks") shifted.setDate(shifted.getDate() - preset.amount * 7);
  if (preset.unit === "months") shifted.setMonth(shifted.getMonth() - preset.amount);
  if (preset.unit === "years") shifted.setFullYear(shifted.getFullYear() - preset.amount);

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
    bucket: preset.bucket,
  };
};

const filters = reactive({
  ...toPresetRange("1m"),
  device_type: "",
  browser: "",
  os: "",
});

const bucketOptions = [
  { id: "day", value: "day", text: resolveText("admin.clients.metrics.bucket.day", "By days") },
  { id: "hour", value: "hour", text: resolveText("admin.clients.metrics.bucket.hour", "By hours") },
];

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

const loadMetrics = async () => {
  if (!props.clientId) return;

  isLoading.value = true;

  try {
    const response = await appCore.adminModules.clients.getMetrics(props.clientId, {
      ...filters,
      device_type: filters.device_type || undefined,
      browser: filters.browser || undefined,
      os: filters.os || undefined,
      limit: 20,
    });

    metrics.value = response?.data?.data ?? null;
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? resolveText("admin.clients.metrics.toasts.loadFailed", "Failed to load client metrics."));
  } finally {
    isLoading.value = false;
  }
};

const applyPreset = async (presetId: string) => {
  Object.assign(filters, toPresetRange(presetId));
  await loadMetrics();
};

const updateFilter = (key: string, value: string) => {
  (filters as Record<string, string>)[key] = value;
  filters.preset = "custom";
};

const toDateInputValue = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const summaryCards = computed(() => {
  const summary = metrics.value?.summary ?? {};

  return [
    {
      id: "hours",
      label: resolveText("admin.clients.metrics.summary.totalOnline", "Total online"),
      value: formatHours(summary.total_online_hours ?? 0),
      hint: resolveText("admin.clients.metrics.summary.totalOnlineHint", "Total presence time"),
    },
    {
      id: "sessions",
      label: resolveText("admin.clients.metrics.summary.sessions", "Sessions"),
      value: String(summary.sessions_count ?? 0),
      hint: resolveText("admin.clients.metrics.summary.sessionsHint", "For the selected period"),
    },
    {
      id: "average",
      label: resolveText("admin.clients.metrics.summary.averageSession", "Average session"),
      value: formatDuration(summary.average_session_seconds ?? 0),
      hint: resolveText("admin.clients.metrics.summary.averageSessionHint", "Average duration"),
    },
    {
      id: "last_seen",
      label: resolveText("admin.clients.metrics.summary.lastSeen", "Last online"),
      value: summary.last_seen_at ? formatDateTime(summary.last_seen_at) : "—",
      hint: (summary.currently_online_users ?? 0) > 0
        ? resolveText("admin.clients.metrics.summary.clientOnline", "Client is currently in the cabinet")
        : resolveText("admin.clients.metrics.summary.clientOffline", "Client is not in the cabinet now"),
    },
  ];
});

const timelineLabels = computed(() => (metrics.value?.timeline ?? []).map((point: any) => point.label));
const timelineSeries = computed(() => [
  {
    name: resolveText("admin.clients.metrics.timeline.seriesOnlineHours", "Online, hours"),
    data: (metrics.value?.timeline ?? []).map((point: any) => Number(((point.value ?? 0) / 3600).toFixed(2))),
    color: "#719edf",
    type: "line" as const,
    area: true,
  },
]);

const deviceBreakdowns = computed(() => metrics.value?.breakdowns?.devices ?? []);
const browserBreakdowns = computed(() => metrics.value?.breakdowns?.browsers ?? []);
const osBreakdowns = computed(() => metrics.value?.breakdowns?.oses ?? []);

const breakdownBlocks = computed(() => [
  {
    id: "devices",
    title: resolveText("admin.clients.metrics.breakdowns.devices", "Devices"),
    items: deviceBreakdowns.value,
  },
  {
    id: "browsers",
    title: resolveText("admin.clients.metrics.breakdowns.browsers", "Browsers"),
    items: browserBreakdowns.value,
  },
  {
    id: "os",
    title: resolveText("admin.clients.metrics.breakdowns.os", "OS"),
    items: osBreakdowns.value,
  },
]);

const sessionRows = computed(() =>
  (metrics.value?.sessions ?? []).map((session: any) => ({
    ...session,
    started_at_label: `${resolveText("admin.clients.metrics.sessions.startedAt", "Start")}: ${formatDateTime(session.started_at)}`,
    ended_at_label: `${resolveText("admin.clients.metrics.sessions.endedAt", "End")}: ${formatDateTime(session.ended_at)}`,
    device_label: resolveDeviceLabel(session.device_type),
    location_label: [session.country, session.city].filter(Boolean).join(" / ") || resolveText("admin.clients.metrics.sessions.locationUnknown", "Unknown location"),
  }))
);

const formatDateTime = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(locale.value || "en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatHours = (value: number) => `${Number(value ?? 0).toFixed(2)} ${resolveText("admin.clients.metrics.units.hoursShort", "h")}`;
const formatDuration = (seconds: number) => {
  const total = Number(seconds ?? 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) return `${hours}${resolveText("admin.clients.metrics.units.hoursShort", "h")} ${String(minutes).padStart(2, "0")}${resolveText("admin.clients.metrics.units.minutesShort", "m")}`;

  return `${Math.max(minutes, 1)}${resolveText("admin.clients.metrics.units.minutesShort", "m")}`;
};

const resolveDeviceLabel = (deviceType: string) => {
  if (deviceType === "mobile") return resolveText("admin.clients.kyc.history.device.mobile", "Mobile");
  if (deviceType === "tablet") return resolveText("admin.clients.kyc.history.device.tablet", "Tablet");
  return resolveText("admin.clients.kyc.history.device.desktop", "Desktop");
};

onMounted(async () => {
  await loadMetrics();
});

watch(
  () => props.clientId,
  async () => {
    await loadMetrics();
  }
);
</script>

<style scoped lang="scss">
.client-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.client-metrics__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.client-metrics__preset-button {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--color-stroke-ui-dark);
  color: var(--ui-text-secondary);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.client-metrics__preset-button:hover {
  border-color: rgba(113, 158, 223, 0.45);
  color: var(--ui-text-main);
}

.client-metrics__preset-button--active {
  background: rgba(113, 158, 223, 0.16);
  border-color: rgba(113, 158, 223, 0.65);
  color: #fff;
}

.client-metrics__filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;
}

.client-metrics__filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.client-metrics__filter span {
  font-size: 12px;
  color: var(--ui-text-secondary);
  font-weight: 720;
}

.client-metrics__summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.client-metrics__summary-card {
  min-height: 116px;
}

.client-metrics__summary-card strong {
  color: var(--ui-text-main);
  font-size: clamp(22px, 2.1vw, 34px);
  line-height: 1;
  letter-spacing: -0.035em;
}

.client-metrics__main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.client-metrics__panel {
  padding: 16px;
}

.client-metrics__panel-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.client-metrics__breakdowns {
  display: grid;
  gap: 12px;
}

.client-metrics__breakdown-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--ui-background-card) 58%, transparent);
}

.client-metrics__breakdown-block strong {
  color: var(--ui-text-main);
  font-weight: 780;
}

.client-metrics__breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--ui-text-main);
  font-size: 13px;
}

.client-metrics__empty {
  color: var(--ui-text-secondary);
}

.client-metrics__sessions {
  display: grid;
  gap: 12px;
}

.client-metrics__session {
  padding: 14px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--ui-background-card) 58%, transparent);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.client-metrics__session-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.client-metrics__session-ip {
  display: flex;
  align-items: center;
  gap: 10px;
}

.client-metrics__session-duration {
  color: var(--ui-primary-main);
  font-weight: 700;
}

.client-metrics__session-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  color: var(--ui-text-secondary);
  font-size: 13px;
}

.client-metrics__session-agent {
  color: var(--ui-text-secondary);
  font-size: 12px;
  word-break: break-word;
}

@media (max-width: 1100px) {
  .client-metrics__main-grid {
    grid-template-columns: 1fr;
  }
}
</style>
