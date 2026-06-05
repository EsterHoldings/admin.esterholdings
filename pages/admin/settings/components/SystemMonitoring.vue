<template>
  <div class="system-monitoring">
    <div class="system-monitoring__toolbar">
      <div>
        <h3>{{ resolveText("admin.settings.monitoring.title", "Мониторинг системы") }}</h3>
        <p>
          {{
            resolveText(
              "admin.settings.monitoring.subtitle",
              "Почти в реальном времени: нагрузка CPU, оперативная память, диск и история по снимкам."
            )
          }}
        </p>
      </div>

      <div class="system-monitoring__actions">
        <PrimeSelect
          v-model="range"
          :options="rangeOptions"
          option-label="label"
          option-value="value"
          size="small" />
        <PrimeButton
          icon="pi pi-refresh"
          :label="resolveText('admin.settings.monitoring.refresh', 'Обновить')"
          size="small"
          :loading="isLoading"
          outlined
          @click="loadMonitoring()" />
      </div>
    </div>

    <PrimeMessage
      v-if="errorMessage"
      severity="error"
      :closable="false">
      {{ errorMessage }}
    </PrimeMessage>

    <div class="system-monitoring__metrics">
      <PrimeCard
        v-for="metric in metricCards"
        :key="metric.id"
        class="system-monitoring__metric-card">
        <template #content>
          <div class="system-monitoring__metric-body">
            <div class="system-monitoring__metric-head">
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
            </div>
            <PrimeProgressBar
              :value="metric.percent"
              :show-value="false"
              class="system-monitoring__progress" />
            <div class="system-monitoring__metric-foot">
              <span>{{ metric.note }}</span>
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>

    <PrimeCard class="system-monitoring__chart-card">
      <template #content>
        <div class="system-monitoring__chart-header">
          <div>
            <h4>{{ resolveText("admin.settings.monitoring.chartTitle", "История нагрузки") }}</h4>
            <p>{{ resolveText("admin.settings.monitoring.chartSubtitle", "CPU, RAM и диск по времени снимков.") }}</p>
          </div>
          <span class="system-monitoring__updated">
            {{ resolveText("admin.settings.monitoring.updated", "Обновлено") }}: {{ formatDate(generatedAt) }}
          </span>
        </div>
        <PrimeChart
          type="line"
          :data="chartData"
          :options="chartOptions"
          class="system-monitoring__chart" />
      </template>
    </PrimeCard>
  </div>
</template>

<script setup lang="ts">
  import PrimeChart from "primevue/chart";
  import PrimeProgressBar from "primevue/progressbar";
  import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import useAppCore from "~/composables/useAppCore";

  type MonitorSnapshot = {
    cpu_load_percent?: number | null;
    memory_total_bytes?: number | null;
    memory_used_bytes?: number | null;
    memory_free_bytes?: number | null;
    memory_usage_percent?: number | null;
    disk_total_bytes?: number | null;
    disk_used_bytes?: number | null;
    disk_free_bytes?: number | null;
    disk_usage_percent?: number | null;
    load_average?: number[];
    captured_at?: string | null;
  };

  const { t } = useI18n({ useScope: "global" });
  const appCore = useAppCore();

  const current = ref<MonitorSnapshot>({});
  const history = ref<MonitorSnapshot[]>([]);
  const generatedAt = ref<string | null>(null);
  const isLoading = ref(false);
  const errorMessage = ref("");
  const range = ref("24h");
  let pollTimer: ReturnType<typeof window.setInterval> | null = null;

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const rangeOptions = computed(() => [
    { label: resolveText("admin.settings.monitoring.ranges.1h", "1 час"), value: "1h" },
    { label: resolveText("admin.settings.monitoring.ranges.6h", "6 часов"), value: "6h" },
    { label: resolveText("admin.settings.monitoring.ranges.12h", "12 часов"), value: "12h" },
    { label: resolveText("admin.settings.monitoring.ranges.24h", "24 часа"), value: "24h" },
    { label: resolveText("admin.settings.monitoring.ranges.7d", "7 дней"), value: "7d" },
  ]);

  const metricCards = computed(() => [
    {
      id: "cpu",
      label: resolveText("admin.settings.monitoring.cpu", "CPU"),
      value: formatPercent(current.value.cpu_load_percent),
      percent: normalizePercent(current.value.cpu_load_percent),
      note: `${resolveText("admin.settings.monitoring.loadAverage", "Load average")}: ${
        current.value.load_average?.join(" / ") || "-"
      }`,
    },
    {
      id: "memory",
      label: resolveText("admin.settings.monitoring.memory", "Оперативная память"),
      value: formatPercent(current.value.memory_usage_percent),
      percent: normalizePercent(current.value.memory_usage_percent),
      note: `${formatBytes(current.value.memory_used_bytes)} / ${formatBytes(current.value.memory_total_bytes)}`,
    },
    {
      id: "disk",
      label: resolveText("admin.settings.monitoring.disk", "Диск"),
      value: formatPercent(current.value.disk_usage_percent),
      percent: normalizePercent(current.value.disk_usage_percent),
      note: `${formatBytes(current.value.disk_used_bytes)} / ${formatBytes(current.value.disk_total_bytes)}`,
    },
  ]);

  const chartPoints = computed(() => {
    const pointsByTime = new Map<string, MonitorSnapshot>();

    for (const point of history.value) {
      if (point?.captured_at) {
        pointsByTime.set(point.captured_at, point);
      }
    }

    if (current.value?.captured_at) {
      pointsByTime.set(current.value.captured_at, current.value);
    }

    return Array.from(pointsByTime.values()).sort((first, second) => {
      const firstTime = new Date(first.captured_at || "").getTime();
      const secondTime = new Date(second.captured_at || "").getTime();

      return firstTime - secondTime;
    });
  });

  const chartPointRadius = computed(() => {
    const pointCount = chartPoints.value.length;

    return pointCount <= 1 ? 4 : 2;
  });

  const chartData = computed(() => ({
    labels: chartPoints.value.map(point => formatTime(point.captured_at)),
    datasets: [
      {
        label: "CPU",
        data: chartPoints.value.map(point => roundValue(point.cpu_load_percent)),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.12)",
        tension: 0.35,
        pointRadius: chartPointRadius.value,
        pointHoverRadius: 5,
        spanGaps: true,
      },
      {
        label: "RAM",
        data: chartPoints.value.map(point => roundValue(point.memory_usage_percent)),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.12)",
        tension: 0.35,
        pointRadius: chartPointRadius.value,
        pointHoverRadius: 5,
        spanGaps: true,
      },
      {
        label: "Disk",
        data: chartPoints.value.map(point => roundValue(point.disk_usage_percent)),
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.12)",
        tension: 0.35,
        pointRadius: chartPointRadius.value,
        pointHoverRadius: 5,
        spanGaps: true,
      },
    ],
  }));

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: getCssVar("--ui-text-main", "#ffffff"),
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y ?? 0}%`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: getCssVar("--ui-text-secondary", "#9ca3af"), maxTicksLimit: 8 },
        grid: { color: getCssVar("--color-stroke-ui-light", "rgba(148, 163, 184, 0.18)") },
      },
      y: {
        min: 0,
        max: 100,
        ticks: { color: getCssVar("--ui-text-secondary", "#9ca3af"), callback: (value: number) => `${value}%` },
        grid: { color: getCssVar("--color-stroke-ui-light", "rgba(148, 163, 184, 0.18)") },
      },
    },
  }));

  async function loadMonitoring(silent = false): Promise<void> {
    if (!silent) isLoading.value = true;
    errorMessage.value = "";

    try {
      const response = await appCore.adminModules.system.getMonitoring({
        range: range.value,
        limit: range.value === "7d" ? 1000 : 360,
      });
      const payload = response?.data?.data ?? {};
      current.value = payload.current ?? {};
      history.value = Array.isArray(payload.history) ? payload.history : [];
      generatedAt.value = payload.generated_at ?? null;
    } catch (error: any) {
      errorMessage.value =
        error?.response?.data?.message ||
        resolveText("admin.settings.monitoring.loadError", "Не удалось загрузить системный мониторинг.");
    } finally {
      isLoading.value = false;
    }
  }

  function startPolling(): void {
    stopPolling();
    pollTimer = window.setInterval(() => {
      void loadMonitoring(true);
    }, 15000);
  }

  function stopPolling(): void {
    if (pollTimer !== null) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function normalizePercent(value?: number | null): number {
    const percent = Number(value ?? 0);
    if (!Number.isFinite(percent)) return 0;

    return Math.max(0, Math.min(100, Math.round(percent)));
  }

  function roundValue(value?: number | null): number | null {
    const number = Number(value ?? NaN);
    return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
  }

  function formatPercent(value?: number | null): string {
    const number = Number(value ?? NaN);
    return Number.isFinite(number) ? `${number.toFixed(1)}%` : "-";
  }

  function formatBytes(value?: number | null): string {
    const bytes = Number(value ?? 0);
    if (!Number.isFinite(bytes) || bytes <= 0) return "-";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);

    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }

  function formatDate(value?: string | null): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  }

  function formatTime(value?: string | null): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function getCssVar(name: string, fallback: string): string {
    if (typeof window === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    return value || fallback;
  }

  watch(range, () => {
    void loadMonitoring();
  });

  onMounted(() => {
    void loadMonitoring();
    startPolling();
  });

  onBeforeUnmount(() => {
    stopPolling();
  });
</script>

<style scoped lang="scss">
  .system-monitoring {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
  }

  .system-monitoring__toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .system-monitoring__toolbar h3,
  .system-monitoring__chart-header h4 {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 20px;
    font-weight: 840;
  }

  .system-monitoring__toolbar p,
  .system-monitoring__chart-header p {
    max-width: 720px;
    margin: 6px 0 0;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  .system-monitoring__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .system-monitoring__metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .system-monitoring__metric-card,
  .system-monitoring__chart-card {
    overflow: hidden;
    border-radius: 18px;
    border-color: color-mix(in srgb, var(--ui-primary-main) 15%, var(--color-stroke-ui-light));
  }

  .system-monitoring__metric-body {
    display: flex;
    min-height: 126px;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    padding: 14px;
  }

  .system-monitoring__metric-head,
  .system-monitoring__metric-foot,
  .system-monitoring__chart-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .system-monitoring__metric-head span,
  .system-monitoring__metric-foot span,
  .system-monitoring__updated {
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 720;
  }

  .system-monitoring__metric-head strong {
    color: var(--ui-text-main);
    font-size: 24px;
    font-weight: 880;
    line-height: 1;
  }

  .system-monitoring__progress {
    height: 8px;
  }

  .system-monitoring__chart-header {
    padding: 16px 16px 0;
  }

  .system-monitoring__chart {
    min-height: 360px;
    padding: 12px 14px 16px;
  }

  @media (max-width: 980px) {
    .system-monitoring__metrics {
      grid-template-columns: 1fr;
    }

    .system-monitoring__toolbar,
    .system-monitoring__chart-header {
      flex-direction: column;
    }
  }

  @media (max-width: 640px) {
    .system-monitoring__actions,
    .system-monitoring__actions :deep(.p-select),
    .system-monitoring__actions :deep(.p-button) {
      width: 100%;
    }
  }
</style>
