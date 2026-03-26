<template>
  <div class="admin-dashboard">
    <div class="admin-dashboard__header">
      <div class="admin-dashboard__header-row">
        <div>
          <UiTextH4 class="admin-dashboard__title text-[var(--ui-text-main)]">{{ t("admin.dashboard.title") }}</UiTextH4>
          <UiTextParagraph class="text-[var(--ui-text-secondary)]">
            Реальные метрики клиентов, регистраций и online-активности.
          </UiTextParagraph>
        </div>

        <UiButtonDefault state="info" :is-loading="isLoading" @click="loadDashboard">
          Обновить
        </UiButtonDefault>
      </div>
    </div>

    <div class="admin-dashboard__grid admin-dashboard__grid--priority">
      <button
        v-for="card in priorityCards"
        :key="card.id"
        type="button"
        class="stat-card-link"
        @click="handleNavigate(card.to)"
      >
        <PanelDefault class="stat-card stat-card--priority">
          <div class="flex items-center justify-between">
            <div>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ card.label }}</UiTextSmall>
              <UiTextH5 class="text-[var(--ui-text-main)]">{{ card.value }}</UiTextH5>
            </div>
            <div class="rounded-full bg-[var(--ui-primary-main)]/20 p-2 text-[var(--ui-primary-accent)]">
              <component :is="card.icon" class="!h-5 !w-5" />
            </div>
          </div>
        </PanelDefault>
      </button>
    </div>

    <div class="admin-dashboard__grid">
      <button
        v-for="card in statCards"
        :key="card.id"
        type="button"
        class="stat-card-link"
        @click="handleNavigate(card.to)"
      >
        <PanelDefault class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ card.label }}</UiTextSmall>
              <UiTextH5 class="text-[var(--ui-text-main)]">{{ card.value }}</UiTextH5>
            </div>
            <div class="rounded-full bg-[var(--color-stroke-ui-dark)] p-2 text-[var(--ui-text-main)]">
              <component :is="card.icon" class="!h-5 !w-5" />
            </div>
          </div>
          <UiTextSmall class="mt-2 text-[var(--ui-text-secondary)]">{{ card.delta }}</UiTextSmall>
        </PanelDefault>
      </button>
    </div>

    <div class="admin-dashboard__charts">
      <PanelDefault class="dashboard-panel-card min-w-0">
        <div class="dashboard-chart-card">
          <div class="dashboard-chart-card__header">
            <div>
              <UiTextH5 class="text-[var(--ui-text-main)]">Регистрации клиентов</UiTextH5>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">Новые пользователи по выбранному периоду</UiTextSmall>
            </div>
            <div class="dashboard-chart-card__presets">
              <button
                v-for="preset in metricRangePresets"
                :key="`registrations-${preset.id}`"
                type="button"
                class="dashboard-preset-button"
                :class="{ 'dashboard-preset-button--active': registrationsFilters.preset === preset.id }"
                @click="applyDashboardPreset('registrations', preset.id)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <div class="dashboard-chart-card__filters">
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">От</span>
              <UiInput type="date" :value="toDateInputValue(registrationsFilters.date_from)" @input="value => updateDashboardFilter('registrations', 'date_from', value)" />
            </div>
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">До</span>
              <UiInput type="date" :value="toDateInputValue(registrationsFilters.date_to)" @input="value => updateDashboardFilter('registrations', 'date_to', value)" />
            </div>
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">Шаг</span>
              <UiSelect :data="bucketOptions" :value="registrationsFilters.bucket" without-no-select @change="value => updateDashboardFilter('registrations', 'bucket', value || 'day')" />
            </div>
          </div>

          <AdminMetricChart :categories="registrationLabels" :series="registrationSeries" :height="320" />
        </div>
      </PanelDefault>

      <PanelDefault class="dashboard-panel-card min-w-0">
        <div class="dashboard-chart-card">
          <div class="dashboard-chart-card__header">
            <div>
              <UiTextH5 class="text-[var(--ui-text-main)]">Клиенты онлайн</UiTextH5>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                Сейчас онлайн: {{ onlineSummary.currently_online_users ?? 0 }} · всего часов: {{ formatHours(onlineSummary.total_online_hours ?? 0) }}
              </UiTextSmall>
            </div>
            <div class="dashboard-chart-card__presets">
              <button
                v-for="preset in metricRangePresets"
                :key="`online-${preset.id}`"
                type="button"
                class="dashboard-preset-button"
                :class="{ 'dashboard-preset-button--active': onlineFilters.preset === preset.id }"
                @click="applyDashboardPreset('online', preset.id)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <div class="dashboard-chart-card__filters dashboard-chart-card__filters--online">
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">От</span>
              <UiInput type="date" :value="toDateInputValue(onlineFilters.date_from)" @input="value => updateDashboardFilter('online', 'date_from', value)" />
            </div>
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">До</span>
              <UiInput type="date" :value="toDateInputValue(onlineFilters.date_to)" @input="value => updateDashboardFilter('online', 'date_to', value)" />
            </div>
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">Шаг</span>
              <UiSelect :data="bucketOptions" :value="onlineFilters.bucket" without-no-select @change="value => updateDashboardFilter('online', 'bucket', value || 'day')" />
            </div>
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">Устройство</span>
              <UiSelect :data="deviceOptions" :value="onlineFilters.device_type" @change="value => updateDashboardFilter('online', 'device_type', value || '')" />
            </div>
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">Браузер</span>
              <UiSelect :data="browserOptions" :value="onlineFilters.browser" @change="value => updateDashboardFilter('online', 'browser', value || '')" />
            </div>
            <div class="admin-dashboard__filter">
              <span class="admin-dashboard__filter-label">OS</span>
              <UiSelect :data="osOptions" :value="onlineFilters.os" @change="value => updateDashboardFilter('online', 'os', value || '')" />
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
            @range-selected="handleOnlineRangeSelected"
          />
        </div>
      </PanelDefault>
    </div>

    <div class="admin-dashboard__panels">
      <PanelDefault class="dashboard-panel-card min-w-0">
        <div class="flex flex-col gap-3 p-4">
          <UiTextH5 class="text-[var(--ui-text-main)]">Кто сколько был онлайн</UiTextH5>
          <div v-if="topOnlineClients.length === 0" class="dashboard-empty-state">Нет данных по online-сессиям</div>
          <div v-else class="space-y-2">
            <div
              v-for="user in topOnlineClients"
              :key="user.user_id"
              class="dashboard-row-link flex items-center justify-between rounded-xl bg-[var(--color-stroke-ui-dark)] px-3 py-2"
              @click="handleNavigate(`/clients/${user.user_id}`)"
            >
              <div>
                <UiTextSmall class="text-[var(--ui-text-main)]">{{ user.name }}</UiTextSmall>
                <UiTextSmall class="text-[var(--ui-text-secondary)]">
                  {{ user.email || "Без email" }} · {{ formatHours(user.total_online_hours) }} · {{ user.sessions_count }} сесс.
                </UiTextSmall>
              </div>
              <UiBadge :state="user.is_online ? 'success' : 'warning'" outline class="!px-3">
                {{ user.is_online ? "online" : "offline" }}
              </UiBadge>
            </div>
          </div>
        </div>
      </PanelDefault>

      <PanelDefault class="dashboard-panel-card min-w-0">
        <div class="flex flex-col gap-3 p-4">
          <UiTextH5 class="text-[var(--ui-text-main)]">{{ t("admin.dashboard.recentUsers") }}</UiTextH5>
          <div class="space-y-2">
            <div
              v-for="user in recentUsers"
              :key="user.id"
              class="dashboard-row-link flex items-center justify-between rounded-xl bg-[var(--color-stroke-ui-dark)] px-3 py-2"
              @click="handleNavigate(`/clients/${user.id}`)"
            >
              <div>
                <UiTextSmall class="text-[var(--ui-text-main)]">{{ user.name }}</UiTextSmall>
                <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ user.email }}</UiTextSmall>
              </div>
              <UiBadge :state="user.status === 'active' ? 'success' : 'warning'" outline class="!px-3">
                {{ user.status }}
              </UiBadge>
            </div>
          </div>
        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { navigateTo } from "nuxt/app";
import { definePageMeta } from "~/.nuxt/imports";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import AdminMetricChart from "~/components/block/charts/AdminMetricChart.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
import useAppCore from "~/composables/useAppCore";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { canAccessAdminPath } from "~/constants/adminPagePermissions";

definePageMeta({
  middleware: ["admin-middleware"],
});

type Bucket = "day" | "hour";
type MetricPreset = {
  id: string;
  label: string;
  amount: number;
  unit: "hours" | "days" | "weeks" | "months" | "years";
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

const { t } = useI18n({ useScope: "global" });
const adminAuthStore = useAdminAuthStore();
const appCore = useAppCore();

const canAccessPath = (path: string) =>
  canAccessAdminPath(path, {
    hasPermission: permission => adminAuthStore.hasPermission(permission),
    hasRole: role => adminAuthStore.hasRole(role),
  });

const bucketOptions = [
  { id: "day", value: "day", text: "По дням" },
  { id: "hour", value: "hour", text: "По часам" },
];

const resolvePreset = (presetId: string) => metricRangePresets.find(preset => preset.id === presetId) ?? metricRangePresets[16];

const shiftDate = (date: Date, preset: MetricPreset) => {
  const shifted = new Date(date);

  if (preset.unit === "hours") shifted.setHours(shifted.getHours() - preset.amount);
  if (preset.unit === "days") shifted.setDate(shifted.getDate() - preset.amount);
  if (preset.unit === "weeks") shifted.setDate(shifted.getDate() - preset.amount * 7);
  if (preset.unit === "months") shifted.setMonth(shifted.getMonth() - preset.amount);
  if (preset.unit === "years") shifted.setFullYear(shifted.getFullYear() - preset.amount);

  return shifted;
};

const toIsoRange = (presetId: string) => {
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

const createChartFilters = (presetId: string): ChartFilters => ({
  ...toIsoRange(presetId),
});

const createOnlineChartFilters = (presetId: string): OnlineChartFilters => ({
  ...toIsoRange(presetId),
  device_type: "",
  browser: "",
  os: "",
});

const registrationsFilters = reactive<ChartFilters>(createChartFilters("1m"));
const onlineFilters = reactive<OnlineChartFilters>(createOnlineChartFilters("1w"));

const isLoading = ref(false);
const dashboard = ref<any>(null);

const loadDashboard = async () => {
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
  } finally {
    isLoading.value = false;
  }
};

const setPresetFilters = (target: ChartFilters | OnlineChartFilters, presetId: string) => {
  Object.assign(target, toIsoRange(presetId));
};

const applyDashboardPreset = async (section: "registrations" | "online", presetId: string) => {
  if (section === "registrations") setPresetFilters(registrationsFilters, presetId);
  if (section === "online") setPresetFilters(onlineFilters, presetId);

  await loadDashboard();
};

const updateDashboardFilter = (
  section: "registrations" | "online",
  key: string,
  value: string
) => {
  const target = section === "registrations" ? registrationsFilters : onlineFilters;
  (target as Record<string, string>)[key] = value;
  target.preset = "custom";
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

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(Number(value ?? 0));
const formatPercent = (value: number) => `${value > 0 ? "+" : ""}${Number(value ?? 0).toFixed(2)}% vs prev period`;
const formatHours = (value: number) => `${Number(value ?? 0).toFixed(2)} ч`;
const registrationsTotal = computed(() =>
  (dashboard.value?.charts?.registrations?.points ?? []).reduce(
    (sum: number, point: any) => sum + Number(point?.value ?? 0),
    0
  )
);

const priorityCards = computed(
  () =>
    [
      {
        id: "online_now",
        label: "Online now",
        value: formatNumber(dashboard.value?.online?.summary?.currently_online_users ?? 0),
        icon: UiIconClients,
        to: "/clients",
      },
      {
        id: "registrations_range",
        label: "Registrations in range",
        value: formatNumber(registrationsTotal.value),
        icon: UiIconClients,
        to: "/clients",
      },
      {
        id: "processing_verifications",
        label: "Verifications in processing",
        value: formatNumber(dashboard.value?.priority?.processing_verifications ?? 0),
        icon: UiIconWarningFull,
        to: "/verifications",
      },
    ].filter(card => canAccessPath(card.to))
);

const statCards = computed(
  () =>
    [
      {
        id: "users",
        label: t("admin.dashboard.users"),
        value: formatNumber(dashboard.value?.overview?.users?.value ?? 0),
        delta: formatPercent(dashboard.value?.overview?.users?.delta_percent ?? 0),
        icon: UiIconClients,
        to: "/clients",
      },
    ].filter(card => canAccessPath(card.to))
);

const registrationLabels = computed(() => (dashboard.value?.charts?.registrations?.points ?? []).map((point: any) => point.label));
const registrationSeries = computed(() => [
  {
    name: "Registrations",
    data: (dashboard.value?.charts?.registrations?.points ?? []).map((point: any) => Number(point.value ?? 0)),
    color: "#719edf",
    area: true,
    type: "line" as const,
  },
]);

const onlineLabels = computed(() => (dashboard.value?.charts?.online?.points ?? []).map((point: any) => point.label));
const onlineCategoryKeys = computed(() => (dashboard.value?.charts?.online?.points ?? []).map((point: any) => point.key));
const onlineSeries = computed(() => [
  {
    name: "Online hours",
    data: (dashboard.value?.charts?.online?.points ?? []).map((point: any) => Number(((point.value ?? 0) / 3600).toFixed(2))),
    color: "#8d7cf2",
    area: true,
    type: "line" as const,
    yAxisIndex: 0,
    suffix: " ч",
  },
  {
    name: "Clients online",
    data: (dashboard.value?.charts?.online?.points ?? []).map((point: any) => Number(point.users_count ?? 0)),
    color: "#719edf",
    type: "bar" as const,
    yAxisIndex: 1,
    suffix: " чел.",
  },
]);
const onlineAxes = [
  { name: "Часы", suffix: " ч", position: "left" as const },
  { name: "Клиенты", suffix: " чел.", position: "right" as const },
];

const formatOnlineTooltip = ({ dataIndex, category }: { dataIndex: number; category: string }) => {
  const point = (dashboard.value?.charts?.online?.points ?? [])[dataIndex];
  if (!point) {
    return category;
  }

  const users = Array.isArray(point.users) ? point.users : [];
  const usersHtml = users.length > 0
    ? users
        .map((user: any) => {
          const hours = Number(user.total_online_hours ?? 0).toFixed(2);
          const label = user.name || user.email || user.user_id;

          return `
            <div class="admin-chart-tooltip__user-row">
              <a class="admin-chart-tooltip__user-link" href="/admin/clients/${user.user_id}">
                ${label}
              </a>
              <span>${hours} ч · ${Number(user.sessions_count ?? 0)} сесс.</span>
            </div>
          `;
        })
        .join("")
    : '<div class="admin-chart-tooltip__empty">Нет клиентов в этом bucket</div>';

  return `
    <div class="admin-chart-tooltip admin-chart-tooltip--online">
      <div class="admin-chart-tooltip__title">${category}</div>
      <div class="admin-chart-tooltip__row">
        <span>Всего часов</span>
        <strong>${Number(((point.value ?? 0) / 3600)).toFixed(2)} ч</strong>
      </div>
      <div class="admin-chart-tooltip__row">
        <span>Уникальные клиенты</span>
        <strong>${Number(point.users_count ?? 0)}</strong>
      </div>
      <div class="admin-chart-tooltip__row">
        <span>Сессии</span>
        <strong>${Number(point.sessions_count ?? 0)}</strong>
      </div>
      <div class="admin-chart-tooltip__users">${usersHtml}</div>
    </div>
  `;
};

const handleOnlineRangeSelected = async ({ startKey, endKey }: { startKey: string; endKey: string }) => {
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
  await loadDashboard();
};

const onlineSummary = computed(() => dashboard.value?.online?.summary ?? {});
const topOnlineClients = computed(() => dashboard.value?.online?.top_clients ?? []);
const recentUsers = computed(() => dashboard.value?.recent?.users ?? []);

const handleNavigate = (to?: string) => {
  if (!to) return;
  navigateTo(to);
};

onMounted(async () => {
  await loadDashboard();
});
</script>

<style lang="scss" scoped>
.admin-dashboard {
  padding: 20px;
  color: var(--ui-text-main);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-dashboard__header {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.admin-dashboard__header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 0;
  gap: 12px;
}

.admin-dashboard__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-dashboard__filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-dashboard__filter-label {
  font-size: 12px;
  color: var(--ui-text-secondary);
}

.admin-dashboard__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.admin-dashboard__grid--priority {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.admin-dashboard__charts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-dashboard__panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.dashboard-chart-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.dashboard-chart-card__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard-chart-card__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dashboard-chart-card__filters {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.dashboard-preset-button {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--color-stroke-ui-dark);
  color: var(--ui-text-secondary);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.dashboard-preset-button:hover {
  border-color: rgba(113, 158, 223, 0.45);
  color: var(--ui-text-main);
}

.dashboard-preset-button--active {
  background: rgba(113, 158, 223, 0.16);
  border-color: rgba(113, 158, 223, 0.65);
  color: #fff;
}

.stat-card-link {
  min-width: 0;
}

.stat-card {
  padding: 16px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.stat-card:hover,
.dashboard-row-link:hover {
  transform: translateY(-1px);
}

.dashboard-empty-state {
  color: var(--ui-text-secondary);
}

:deep(.admin-chart-tooltip--online) {
  min-width: 280px;
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
  color: #d8dff4;
}

:deep(.admin-chart-tooltip__user-link) {
  color: #9ec1ff;
  text-decoration: none;
}

:deep(.admin-chart-tooltip__user-link:hover) {
  text-decoration: underline;
}

:deep(.admin-chart-tooltip__empty) {
  color: #93a0c8;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .admin-dashboard {
    padding: 16px;
  }

  .admin-dashboard__header-row {
    flex-direction: column;
  }
}
</style>
