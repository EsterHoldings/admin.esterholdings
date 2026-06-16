<template>
  <div :class="gridClass">
    <DashboardFilterField :label="fromLabel">
      <PrimeDatePicker
        :model-value="toDatePickerValue(dateFrom)"
        date-format="yy-mm-dd"
        show-icon
        fluid
        @update:model-value="value => $emit('update-date', 'date_from', value)" />
    </DashboardFilterField>

    <DashboardFilterField :label="toLabel">
      <PrimeDatePicker
        :model-value="toDatePickerValue(dateTo)"
        date-format="yy-mm-dd"
        show-icon
        fluid
        @update:model-value="value => $emit('update-date', 'date_to', value)" />
    </DashboardFilterField>

    <DashboardFilterField :label="stepLabel">
      <PrimeSelect
        :model-value="bucket"
        :options="bucketOptions"
        option-label="label"
        option-value="value"
        fluid
        @update:model-value="value => $emit('update-filter', 'bucket', value || 'day')" />
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
          @update:model-value="value => $emit('update-filter', 'device_type', value || '')" />
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
          @update:model-value="value => $emit('update-filter', 'browser', value || '')" />
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
          @update:model-value="value => $emit('update-filter', 'os', value || '')" />
      </DashboardFilterField>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import DashboardFilterField from "./DashboardFilterField.vue";
  import type { DashboardBucket, DashboardSelectOption } from "../types";

  const props = withDefaults(
    defineProps<{
      mode: "online" | "registrations";
      dateFrom: string;
      dateTo: string;
      bucket: DashboardBucket;
      bucketOptions: DashboardSelectOption[];
      deviceOptions?: DashboardSelectOption[];
      browserOptions?: DashboardSelectOption[];
      osOptions?: DashboardSelectOption[];
      deviceType?: string;
      browser?: string;
      os?: string;
      fromLabel: string;
      toLabel: string;
      stepLabel: string;
      deviceLabel: string;
      browserLabel: string;
      osLabel: string;
      allDevicesLabel: string;
      allBrowsersLabel: string;
      allOsLabel: string;
      toDatePickerValue: (value?: string | null) => Date | null;
    }>(),
    {
      deviceOptions: () => [],
      browserOptions: () => [],
      osOptions: () => [],
      deviceType: "",
      browser: "",
      os: "",
    }
  );

  defineEmits<{
    "update-date": [key: "date_from" | "date_to", value: Date | string | null];
    "update-filter": [key: string, value: string];
  }>();

  const gridClass = computed(() => [
    "grid items-end gap-2 max-[640px]:grid-cols-1",
    props.mode === "online" ? "grid-cols-6 max-[1180px]:grid-cols-3" : "grid-cols-3",
  ]);
</script>
