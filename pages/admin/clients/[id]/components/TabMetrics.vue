<template>
  <div class="client-metrics">
    <div class="client-metrics__presets">
      <button
        v-for="preset in metricRangePresets"
        :key="preset.id"
        type="button"
        class="client-metrics__preset-button"
        :class="{ 'client-metrics__preset-button--active': filters.preset === preset.id }"
        @click="applyPreset(preset.id)"
      >
        {{ preset.label }}
      </button>
    </div>

    <div class="client-metrics__filters">
      <div class="client-metrics__filter">
        <span class="client-metrics__filter-label">От</span>
        <UiInput type="date" :value="toDateInputValue(filters.date_from)" @input="value => updateFilter('date_from', value)" />
      </div>
      <div class="client-metrics__filter">
        <span class="client-metrics__filter-label">До</span>
        <UiInput type="date" :value="toDateInputValue(filters.date_to)" @input="value => updateFilter('date_to', value)" />
      </div>
      <div class="client-metrics__filter">
        <span class="client-metrics__filter-label">Шаг</span>
        <UiSelect :data="bucketOptions" :value="filters.bucket" without-no-select @change="value => updateFilter('bucket', value || 'day')" />
      </div>
      <div class="client-metrics__filter">
        <span class="client-metrics__filter-label">Устройство</span>
        <UiSelect :data="deviceOptions" :value="filters.device_type" @change="value => updateFilter('device_type', value || '')" />
      </div>
      <div class="client-metrics__filter">
        <span class="client-metrics__filter-label">Браузер</span>
        <UiSelect :data="browserOptions" :value="filters.browser" @change="value => updateFilter('browser', value || '')" />
      </div>
      <div class="client-metrics__filter">
        <span class="client-metrics__filter-label">OS</span>
        <UiSelect :data="osOptions" :value="filters.os" @change="value => updateFilter('os', value || '')" />
      </div>
      <UiButtonDefault state="info" :is-loading="isLoading" @click="loadMetrics">Обновить</UiButtonDefault>
    </div>

    <div class="client-metrics__summary-grid">
      <PanelDefault v-for="card in summaryCards" :key="card.id" class="client-metrics__summary-card">
        <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ card.label }}</UiTextSmall>
        <UiTextH5 class="text-[var(--ui-text-main)]">{{ card.value }}</UiTextH5>
        <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ card.hint }}</UiTextSmall>
      </PanelDefault>
    </div>

    <div class="client-metrics__main-grid">
      <PanelDefault class="client-metrics__panel">
        <div class="client-metrics__panel-header">
          <UiTextH5 class="text-[var(--ui-text-main)]">Онлайн по периодам</UiTextH5>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">Часы присутствия клиента в кабинете</UiTextSmall>
        </div>
        <AdminMetricChart
          :categories="timelineLabels"
          :series="timelineSeries"
          suffix="h"
          :height="320"
        />
      </PanelDefault>

      <PanelDefault class="client-metrics__panel">
        <div class="client-metrics__panel-header">
          <UiTextH5 class="text-[var(--ui-text-main)]">Разрез по устройствам и браузерам</UiTextH5>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">Что именно использовал клиент</UiTextSmall>
        </div>
        <div class="client-metrics__breakdowns">
          <div class="breakdown-block">
            <div class="breakdown-block__title">Устройства</div>
            <div v-if="deviceBreakdowns.length === 0" class="breakdown-block__empty">Нет данных</div>
            <div v-for="item in deviceBreakdowns" :key="`device-${item.key}`" class="breakdown-row">
              <span>{{ item.label }}</span>
              <span>{{ formatHours(item.hours) }} · {{ item.sessions_count }} сесс.</span>
            </div>
          </div>
          <div class="breakdown-block">
            <div class="breakdown-block__title">Браузеры</div>
            <div v-if="browserBreakdowns.length === 0" class="breakdown-block__empty">Нет данных</div>
            <div v-for="item in browserBreakdowns" :key="`browser-${item.key}`" class="breakdown-row">
              <span>{{ item.label }}</span>
              <span>{{ formatHours(item.hours) }} · {{ item.sessions_count }} сесс.</span>
            </div>
          </div>
          <div class="breakdown-block">
            <div class="breakdown-block__title">ОС</div>
            <div v-if="osBreakdowns.length === 0" class="breakdown-block__empty">Нет данных</div>
            <div v-for="item in osBreakdowns" :key="`os-${item.key}`" class="breakdown-row">
              <span>{{ item.label }}</span>
              <span>{{ formatHours(item.hours) }} · {{ item.sessions_count }} сесс.</span>
            </div>
          </div>
        </div>
      </PanelDefault>
    </div>

    <PanelDefault class="client-metrics__panel">
      <div class="client-metrics__panel-header">
        <UiTextH5 class="text-[var(--ui-text-main)]">Последние online-сессии</UiTextH5>
        <UiTextSmall class="text-[var(--ui-text-secondary)]">Когда и откуда клиент был в кабинете</UiTextSmall>
      </div>

      <div v-if="sessionRows.length === 0" class="client-metrics__empty">
        Сессий пока нет
      </div>

      <div v-else class="client-metrics__sessions">
        <div v-for="session in sessionRows" :key="session.id" class="client-metrics__session">
          <div class="client-metrics__session-top">
            <div class="client-metrics__session-ip">
              <strong>{{ session.ip || "Unknown" }}</strong>
              <UiBadge :state="session.is_online ? 'success' : 'warning'" outline class="!px-3">
                {{ session.is_online ? "Онлайн" : "Оффлайн" }}
              </UiBadge>
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

          <div v-if="session.user_agent" class="client-metrics__session-agent">
            {{ session.user_agent }}
          </div>
        </div>
      </div>
    </PanelDefault>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useToast } from "vue-toastification";
import useAppCore from "~/composables/useAppCore";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import AdminMetricChart from "~/components/block/charts/AdminMetricChart.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";

const props = defineProps({
  clientId: {
    type: String,
    default: "",
  },
});

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
  { id: "1h", label: "1ч", amount: 1, unit: "hours", bucket: "hour" },
  { id: "2h", label: "2ч", amount: 2, unit: "hours", bucket: "hour" },
  { id: "3h", label: "3ч", amount: 3, unit: "hours", bucket: "hour" },
  { id: "5h", label: "5ч", amount: 5, unit: "hours", bucket: "hour" },
  { id: "10h", label: "10ч", amount: 10, unit: "hours", bucket: "hour" },
  { id: "15h", label: "15ч", amount: 15, unit: "hours", bucket: "hour" },
  { id: "20h", label: "20ч", amount: 20, unit: "hours", bucket: "hour" },
  { id: "1d", label: "1д", amount: 1, unit: "days", bucket: "hour" },
  { id: "2d", label: "2д", amount: 2, unit: "days", bucket: "hour" },
  { id: "3d", label: "3д", amount: 3, unit: "days", bucket: "hour" },
  { id: "5d", label: "5д", amount: 5, unit: "days", bucket: "day" },
  { id: "1w", label: "1н", amount: 1, unit: "weeks", bucket: "day" },
  { id: "2w", label: "2н", amount: 2, unit: "weeks", bucket: "day" },
  { id: "3w", label: "3н", amount: 3, unit: "weeks", bucket: "day" },
  { id: "4w", label: "4н", amount: 4, unit: "weeks", bucket: "day" },
  { id: "1m", label: "1м", amount: 1, unit: "months", bucket: "day" },
  { id: "2m", label: "2м", amount: 2, unit: "months", bucket: "day" },
  { id: "3m", label: "3м", amount: 3, unit: "months", bucket: "day" },
  { id: "6m", label: "6м", amount: 6, unit: "months", bucket: "day" },
  { id: "1y", label: "1г", amount: 1, unit: "years", bucket: "day" },
  { id: "2y", label: "2г", amount: 2, unit: "years", bucket: "day" },
  { id: "3y", label: "3г", amount: 3, unit: "years", bucket: "day" },
];

const resolvePreset = (presetId: string) => metricRangePresets.find(preset => preset.id === presetId) ?? metricRangePresets[15];

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
  { id: "day", value: "day", text: "По дням" },
  { id: "hour", value: "hour", text: "По часам" },
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
    toast.error(error?.response?.data?.message ?? "Не удалось загрузить метрики клиента.");
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
      label: "Всего онлайн",
      value: formatHours(summary.total_online_hours ?? 0),
      hint: "суммарное время присутствия",
    },
    {
      id: "sessions",
      label: "Сессии",
      value: String(summary.sessions_count ?? 0),
      hint: "за выбранный период",
    },
    {
      id: "average",
      label: "Средняя сессия",
      value: formatDuration(summary.average_session_seconds ?? 0),
      hint: "усреднённая длительность",
    },
    {
      id: "last_seen",
      label: "Последний online",
      value: summary.last_seen_at ? formatDateTime(summary.last_seen_at) : "—",
      hint: (summary.currently_online_users ?? 0) > 0 ? "клиент сейчас в кабинете" : "сейчас не в кабинете",
    },
  ];
});

const timelineLabels = computed(() => (metrics.value?.timeline ?? []).map((point: any) => point.label));
const timelineSeries = computed(() => [
  {
    name: "Онлайн, часы",
    data: (metrics.value?.timeline ?? []).map((point: any) => Number(((point.value ?? 0) / 3600).toFixed(2))),
    color: "#719edf",
    type: "line" as const,
    area: true,
  },
]);

const deviceBreakdowns = computed(() => metrics.value?.breakdowns?.devices ?? []);
const browserBreakdowns = computed(() => metrics.value?.breakdowns?.browsers ?? []);
const osBreakdowns = computed(() => metrics.value?.breakdowns?.oses ?? []);

const sessionRows = computed(() =>
  (metrics.value?.sessions ?? []).map((session: any) => ({
    ...session,
    started_at_label: `Старт: ${formatDateTime(session.started_at)}`,
    ended_at_label: `Финиш: ${formatDateTime(session.ended_at)}`,
    device_label: resolveDeviceLabel(session.device_type),
    location_label: [session.country, session.city].filter(Boolean).join(" / ") || "Локация неизвестна",
  }))
);

const formatDateTime = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatHours = (value: number) => `${Number(value ?? 0).toFixed(2)} ч`;
const formatDuration = (seconds: number) => {
  const total = Number(seconds ?? 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) return `${hours}ч ${String(minutes).padStart(2, "0")}м`;

  return `${Math.max(minutes, 1)}м`;
};

const resolveDeviceLabel = (deviceType: string) => {
  if (deviceType === "mobile") return "Мобильное устройство";
  if (deviceType === "tablet") return "Планшет";
  return "Десктоп";
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

.client-metrics__filter-label {
  font-size: 12px;
  color: var(--ui-text-secondary);
}

.client-metrics__summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.client-metrics__summary-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.breakdown-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: var(--color-stroke-ui-dark);
}

.breakdown-block__title {
  font-weight: 700;
  color: var(--ui-text-main);
}

.breakdown-block__empty {
  color: var(--ui-text-secondary);
}

.breakdown-row {
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
  background: var(--color-stroke-ui-dark);
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
