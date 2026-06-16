<template>
  <div :class="gridClass">
    <DashboardFilterField :label="fromLabel">
      <PrimeDatePicker
        :model-value="toDatePickerValue(dateFrom)"
        date-format="yy-mm-dd"
        show-icon
        fluid
        @update:model-value="handleDateFromUpdate" />
    </DashboardFilterField>

    <DashboardFilterField :label="toLabel">
      <PrimeDatePicker
        :model-value="toDatePickerValue(dateTo)"
        date-format="yy-mm-dd"
        show-icon
        fluid
        @update:model-value="handleDateToUpdate" />
    </DashboardFilterField>

    <DashboardFilterField :label="stepLabel">
      <PrimeSelect
        :model-value="bucket"
        :options="bucketOptions"
        option-label="label"
        option-value="value"
        fluid
        @update:model-value="handleBucketUpdate" />
    </DashboardFilterField>

    <template v-if="mode === 'online'">
      <DashboardFilterField :label="deviceLabel">
        <PrimeSelect
          :model-value="deviceType"
          :options="deviceOptions"
          option-label="label"
          option-value="value"
          show-clear
          fluid
          :placeholder="allDevicesLabel"
          @update:model-value="handleDeviceUpdate" />
      </DashboardFilterField>

      <DashboardFilterField :label="browserLabel">
        <PrimeSelect
          :model-value="browser"
          :options="browserOptions"
          option-label="label"
          option-value="value"
          show-clear
          fluid
          :placeholder="allBrowsersLabel"
          @update:model-value="handleBrowserUpdate" />
      </DashboardFilterField>

      <DashboardFilterField :label="osLabel">
        <PrimeSelect
          :model-value="os"
          :options="osOptions"
          option-label="label"
          option-value="value"
          show-clear
          fluid
          :placeholder="allOsLabel"
          @update:model-value="handleOsUpdate" />
      </DashboardFilterField>
    </template>
  </div>
</template>

<script setup lang="ts">
  import DashboardFilterField from "./DashboardFilterField.vue";
  import {
    DASHBOARD_CHART_FILTER_DEFAULTS,
    type DashboardChartFiltersEmits,
    type DashboardChartFiltersProps,
  } from "~/composables/admin/dashboard/components/DashboardChartFilters";
  import { useDashboardChartFiltersSetup } from "~/composables/admin/dashboard/components/DashboardChartFilters/setup";

  const props = withDefaults(defineProps<DashboardChartFiltersProps>(), DASHBOARD_CHART_FILTER_DEFAULTS);
  const emit = defineEmits<DashboardChartFiltersEmits>();

  const {
    gridClass,
    handleBrowserUpdate,
    handleBucketUpdate,
    handleDateFromUpdate,
    handleDateToUpdate,
    handleDeviceUpdate,
    handleOsUpdate,
  } = useDashboardChartFiltersSetup(props, emit);
</script>
