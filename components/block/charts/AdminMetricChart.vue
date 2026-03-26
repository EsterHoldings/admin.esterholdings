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
};

const props = withDefaults(
  defineProps<{
    categories: string[];
    series: ChartSeries[];
    height?: number;
    suffix?: string;
  }>(),
  {
    height: 280,
    suffix: "",
  }
);

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
const chartHeight = `${props.height}px`;

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
    valueFormatter: (value: number) => `${value}${props.suffix}`,
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
    bottom: 12,
    containLabel: true,
  },
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
  yAxis: {
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
  },
  series: props.series.map((series) => ({
    name: series.name,
    type: series.type ?? "line",
    smooth: true,
    data: series.data,
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

const renderChart = () => {
  if (!chartRef.value) return;

  if (!chart) {
    chart = echarts.init(chartRef.value);
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
  chart?.dispose();
  chart = null;
});

watch(
  () => [props.categories, props.series, props.suffix],
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
