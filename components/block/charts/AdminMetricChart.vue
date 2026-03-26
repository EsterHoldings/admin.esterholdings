<template>
  <div class="admin-metric-chart">
    <div ref="chartRef" class="admin-metric-chart__canvas" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";

type ChartSeries = {
  name: string;
  data: number[];
  color?: string;
  type?: "line" | "bar";
  area?: boolean;
  yAxisIndex?: number;
  suffix?: string;
};

type ChartAxis = {
  name?: string;
  suffix?: string;
  position?: "left" | "right";
};

type TooltipPayload = {
  dataIndex: number;
  category: string;
  categoryKey: string;
  params: any[];
};

const props = withDefaults(
  defineProps<{
    categories: string[];
    categoryKeys?: string[];
    series: ChartSeries[];
    height?: number;
    suffix?: string;
    yAxes?: ChartAxis[];
    enableZoom?: boolean;
    tooltipFormatter?: (payload: TooltipPayload) => string;
  }>(),
  {
    height: 280,
    suffix: "",
    categoryKeys: () => [],
    yAxes: () => [],
    enableZoom: false,
    tooltipFormatter: undefined,
  }
);

const emit = defineEmits<{
  (event: "range-selected", payload: { startKey: string; endKey: string; startIndex: number; endIndex: number }): void;
}>();

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let zoomDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const chartHeight = `${props.height}px`;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const resolveCategoryKey = (index: number) => props.categoryKeys[index] ?? props.categories[index] ?? "";

const buildTooltip = (params: any[]) => {
  const normalized = Array.isArray(params) ? params : [params];
  const dataIndex = Number(normalized[0]?.dataIndex ?? 0);
  const category = String(normalized[0]?.axisValueLabel ?? props.categories[dataIndex] ?? "");
  const categoryKey = resolveCategoryKey(dataIndex);

  if (typeof props.tooltipFormatter === "function") {
    return props.tooltipFormatter({
      dataIndex,
      category,
      categoryKey,
      params: normalized,
    });
  }

  const rows = normalized.map((item: any) => {
    const suffix = props.series[item.seriesIndex]?.suffix ?? props.suffix ?? "";
    const value = Number(item.value ?? 0);
    const marker = item.marker ?? "";

    return `
      <div class="admin-chart-tooltip__row">
        <span class="admin-chart-tooltip__name">${marker}${escapeHtml(String(item.seriesName ?? ""))}</span>
        <strong>${escapeHtml(String(value))}${escapeHtml(String(suffix))}</strong>
      </div>
    `;
  }).join("");

  return `
    <div class="admin-chart-tooltip">
      <div class="admin-chart-tooltip__title">${escapeHtml(category)}</div>
      ${rows}
    </div>
  `;
};

const buildYAxis = () => {
  if (props.yAxes.length === 0) {
    return [{
      type: "value",
      axisLine: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.08)",
        },
      },
      axisLabel: {
        color: "#93a0c8",
        fontSize: 11,
        formatter: (value: number) => `${value}${props.suffix}`,
      },
    }];
  }

  return props.yAxes.map((axis, index) => ({
    type: "value",
    position: axis.position ?? (index === 0 ? "left" : "right"),
    name: axis.name,
    nameTextStyle: {
      color: "#93a0c8",
      fontSize: 11,
    },
    axisLine: {
      show: false,
    },
    splitLine: {
      show: index === 0,
      lineStyle: {
        color: "rgba(255,255,255,0.08)",
      },
    },
    axisLabel: {
      color: "#93a0c8",
      fontSize: 11,
      formatter: (value: number) => `${value}${axis.suffix ?? ""}`,
    },
  }));
};

const buildOption = () => ({
  backgroundColor: "transparent",
  animation: true,
  tooltip: {
    trigger: "axis",
    backgroundColor: "rgba(6, 18, 56, 0.96)",
    borderColor: "rgba(113, 158, 223, 0.35)",
    textStyle: {
      color: "#fff",
    },
    confine: true,
    appendToBody: true,
    extraCssText: "max-width: 420px; white-space: normal;",
    formatter: (params: any) => buildTooltip(params),
  },
  legend: {
    top: 0,
    textStyle: {
      color: "#b9c1d9",
    },
  },
  grid: {
    left: 12,
    right: 12,
    top: 44,
    bottom: props.enableZoom ? 56 : 12,
    containLabel: true,
  },
  dataZoom: props.enableZoom ? [
    {
      type: "inside",
      xAxisIndex: 0,
      filterMode: "none",
    },
    {
      type: "slider",
      xAxisIndex: 0,
      filterMode: "none",
      height: 24,
      bottom: 8,
      borderColor: "rgba(255,255,255,0.08)",
      backgroundColor: "rgba(255,255,255,0.04)",
      fillerColor: "rgba(113, 158, 223, 0.22)",
      handleStyle: {
        color: "#719edf",
      },
      textStyle: {
        color: "#93a0c8",
      },
    },
  ] : [],
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: props.categories,
    axisLine: {
      lineStyle: {
        color: "rgba(255,255,255,0.08)",
      },
    },
    axisLabel: {
      color: "#93a0c8",
      fontSize: 11,
    },
  },
  yAxis: buildYAxis(),
  series: props.series.map((series) => ({
    name: series.name,
    type: series.type ?? "line",
    smooth: series.type === "bar" ? false : true,
    data: series.data,
    yAxisIndex: series.yAxisIndex ?? 0,
    showSymbol: false,
    barMaxWidth: 24,
    itemStyle: {
      color: series.color ?? "#719edf",
    },
    lineStyle: {
      width: 3,
      color: series.color ?? "#719edf",
    },
    areaStyle: series.area
      ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${series.color ?? "#719edf"}99` },
            { offset: 1, color: `${series.color ?? "#719edf"}08` },
          ]),
        }
      : undefined,
  })),
});

const emitZoomRange = () => {
  if (!chart || props.categories.length === 0) {
    return;
  }

  const option = chart.getOption() as any;
  const zoom = option?.dataZoom?.[0];
  if (!zoom) {
    return;
  }

  const maxIndex = Math.max(props.categories.length - 1, 0);
  let startIndex = 0;
  let endIndex = maxIndex;

  if (typeof zoom.startValue === "number") {
    startIndex = zoom.startValue;
  } else if (typeof zoom.start === "number") {
    startIndex = Math.round((zoom.start / 100) * maxIndex);
  }

  if (typeof zoom.endValue === "number") {
    endIndex = zoom.endValue;
  } else if (typeof zoom.end === "number") {
    endIndex = Math.round((zoom.end / 100) * maxIndex);
  }

  startIndex = Math.max(0, Math.min(startIndex, maxIndex));
  endIndex = Math.max(startIndex, Math.min(endIndex, maxIndex));

  emit("range-selected", {
    startKey: resolveCategoryKey(startIndex),
    endKey: resolveCategoryKey(endIndex),
    startIndex,
    endIndex,
  });
};

const handleDataZoom = () => {
  if (!props.enableZoom) {
    return;
  }

  if (zoomDebounceTimer) {
    clearTimeout(zoomDebounceTimer);
  }

  zoomDebounceTimer = setTimeout(() => {
    emitZoomRange();
  }, 300);
};

const renderChart = () => {
  if (!chartRef.value) return;

  if (!chart) {
    chart = echarts.init(chartRef.value);
    chart.on("datazoom", handleDataZoom);
  }

  chart.setOption(buildOption(), true);
  chart.resize();
};

const handleResize = () => {
  chart?.resize();
};

onMounted(() => {
  renderChart();
  window.addEventListener("resize", handleResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (zoomDebounceTimer) {
    clearTimeout(zoomDebounceTimer);
  }
  chart?.dispose();
  chart = null;
});

watch(
  () => [props.categories, props.categoryKeys, props.series, props.suffix, props.yAxes, props.enableZoom],
  () => {
    renderChart();
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.admin-metric-chart {
  width: 100%;
}

.admin-metric-chart__canvas {
  width: 100%;
  min-height: v-bind(chartHeight);
}
</style>

<style lang="scss">
.admin-chart-tooltip {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 220px;
}

.admin-chart-tooltip__title {
  font-weight: 700;
  color: #fff;
}

.admin-chart-tooltip__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #d8dff4;
}

.admin-chart-tooltip__name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
