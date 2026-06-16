<template>
  <div class="relative flex w-full max-w-none flex-col gap-3 p-[clamp(12px,1.35vw,22px)] text-[var(--ui-text-main)]">
    <div
      v-if="isRefreshing"
      class="pointer-events-none absolute inset-0 z-[2] rounded-3xl bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--ui-primary-main)_7%,transparent),transparent)] opacity-40" />

    <DashboardHeader
      :title="resolveText('admin.dashboard.title', 'Admin dashboard')"
      :subtitle="
        resolveText(
          'admin.dashboard.subtitle',
          'Live overview of registrations, moderation queues, transactions, and online activity.'
        )
      "
      :auto-refresh-label="resolveText('admin.dashboard.autoRefresh', 'Live updates every 30 seconds')"
      :updated-at="lastUpdatedText"
      :advanced-filters-label="resolveText('admin.dashboard.filters.advanced', 'Расширеная фильтрация')"
      :advanced-filters-visible="advancedFiltersVisible"
      :refresh-label="resolveText('admin.dashboard.actions.refresh', 'Refresh dashboard')"
      :is-loading="isLoading"
      @refresh="handleManualRefresh"
      @toggle-advanced="toggleAdvancedFilters" />

    <DashboardSkeleton
      v-if="isInitialLoading"
      :summary-cards="summarySkeletonCards"
      :chart-cards="chartSkeletonCards"
      :rows="listSkeletonRows"
      :presets="metricRangePresets"
      :advanced-filters-visible="advancedFiltersVisible" />

    <template v-else>
      <DashboardSummaryGrid
        :cards="summaryCards"
        :online-clients="currentOnlineClients"
        :online-count="currentOnlineCount"
        :formatted-online-count="formatNumber(currentOnlineCount)"
        :online-title="resolveText('admin.dashboard.onlinePopover.title', 'Online now')"
        :online-clients-label="resolveText('admin.dashboard.onlinePopover.clientsLabel', 'Online clients')"
        :online-empty-text="resolveText('admin.dashboard.onlinePopover.empty', 'No clients are online right now.')"
        :online-loading-text="
          resolveText(
            'admin.dashboard.onlinePopover.loadingClients',
            'Client list is not available yet. Click the card to open online clients.'
          )
        "
        :online-client-name="onlineClientName"
        :online-client-email="onlineClientEmail"
        :get-initials="getInitials"
        @navigate="handleNavigate" />

      <div class="grid grid-cols-1 items-stretch gap-3">
        <DashboardChartPanel
          name="online"
          :title="resolveText('admin.dashboard.charts.onlineTitle', 'Online activity')"
          :subtitle="
            resolveText(
              'admin.dashboard.charts.onlineSubtitle',
              'Current online users, accumulated online hours, and active sessions.'
            )
          "
          :presets="metricRangePresets"
          :active-preset="onlineFilters.preset"
          @select-preset="presetId => applyDashboardPreset('online', presetId)">
          <template #filters>
            <DashboardChartFilters
              v-if="advancedFiltersVisible"
              mode="online"
              :date-from="onlineFilters.date_from"
              :date-to="onlineFilters.date_to"
              :bucket="onlineFilters.bucket"
              :device-type="onlineFilters.device_type"
              :browser="onlineFilters.browser"
              :os="onlineFilters.os"
              :bucket-options="bucketSelectOptions"
              :device-options="deviceSelectOptions"
              :browser-options="browserSelectOptions"
              :os-options="osSelectOptions"
              :from-label="resolveText('admin.dashboard.filters.from', 'From')"
              :to-label="resolveText('admin.dashboard.filters.to', 'To')"
              :step-label="resolveText('admin.dashboard.filters.step', 'Step')"
              :device-label="resolveText('admin.dashboard.filters.device', 'Device')"
              :browser-label="resolveText('admin.dashboard.filters.browser', 'Browser')"
              :os-label="resolveText('admin.dashboard.filters.os', 'OS')"
              :all-devices-label="resolveText('admin.dashboard.filters.allDevices', 'All devices')"
              :all-browsers-label="resolveText('admin.dashboard.filters.allBrowsers', 'All browsers')"
              :all-os-label="resolveText('admin.dashboard.filters.allOs', 'All OS')"
              :to-date-picker-value="toDatePickerValue"
              @update-date="(key, value) => updateDateFilter('online', key, value)"
              @update-filter="(key, value) => updateDashboardFilter('online', key, value)" />
          </template>

          <AdminMetricChart
            :categories="onlineLabels"
            :category-keys="onlineCategoryKeys"
            :series="onlineSeries"
            :y-axes="onlineAxes"
            :height="360"
            enable-zoom
            :tooltip-formatter="formatOnlineTooltip"
            @range-selected="handleOnlineRangeSelected" />
        </DashboardChartPanel>

        <DashboardChartPanel
          name="registrations"
          :title="resolveText('admin.dashboard.charts.registrationsTitle', 'Client registrations')"
          :subtitle="resolveText('admin.dashboard.charts.registrationsSubtitle', 'New clients for the selected range.')"
          :presets="metricRangePresets"
          :active-preset="registrationsFilters.preset"
          @select-preset="presetId => applyDashboardPreset('registrations', presetId)">
          <template #filters>
            <DashboardChartFilters
              v-if="advancedFiltersVisible"
              mode="registrations"
              :date-from="registrationsFilters.date_from"
              :date-to="registrationsFilters.date_to"
              :bucket="registrationsFilters.bucket"
              :bucket-options="bucketSelectOptions"
              :from-label="resolveText('admin.dashboard.filters.from', 'From')"
              :to-label="resolveText('admin.dashboard.filters.to', 'To')"
              :step-label="resolveText('admin.dashboard.filters.step', 'Step')"
              :device-label="resolveText('admin.dashboard.filters.device', 'Device')"
              :browser-label="resolveText('admin.dashboard.filters.browser', 'Browser')"
              :os-label="resolveText('admin.dashboard.filters.os', 'OS')"
              :all-devices-label="resolveText('admin.dashboard.filters.allDevices', 'All devices')"
              :all-browsers-label="resolveText('admin.dashboard.filters.allBrowsers', 'All browsers')"
              :all-os-label="resolveText('admin.dashboard.filters.allOs', 'All OS')"
              :to-date-picker-value="toDatePickerValue"
              @update-date="(key, value) => updateDateFilter('registrations', key, value)"
              @update-filter="(key, value) => updateDashboardFilter('registrations', key, value)" />
          </template>

          <AdminMetricChart
            :categories="registrationLabels"
            :series="registrationSeries"
            :height="320" />
        </DashboardChartPanel>
      </div>

      <div class="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
        <DashboardListPanel
          :title="resolveText('admin.dashboard.panels.topOnline', 'Top online clients')"
          :subtitle="
            resolveText(
              'admin.dashboard.panels.topOnlineSubtitle',
              'Who spent the most time online in the selected period.'
            )
          "
          :count="formatNumber(topOnlineClients.length)"
          :empty="topOnlineClients.length === 0"
          :empty-text="resolveText('admin.dashboard.empty.topOnline', 'No online session data yet.')">
          <DashboardUserRow
            v-for="user in topOnlineClients"
            :key="user.user_id"
            :initials="getInitials(user.name || user.email)"
            :name="user.name || user.email || '—'"
            :meta="formatTopOnlineClientMeta(user)"
            :status-label="resolveOnlineStatusLabel(Boolean(user.is_online))"
            :status-tone="resolveOnlineStatusTone(Boolean(user.is_online))"
            @open="handleNavigate(`/clients/${user.user_id}`)" />
        </DashboardListPanel>

        <DashboardListPanel
          :title="resolveText('admin.dashboard.recentUsers', 'Recent users')"
          :subtitle="
            resolveText(
              'admin.dashboard.panels.recentUsersSubtitle',
              'Newly registered clients with their current account status.'
            )
          "
          :count="formatNumber(recentUsers.length)"
          :empty="recentUsers.length === 0"
          :empty-text="resolveText('admin.dashboard.empty.recentUsers', 'No recent users yet.')">
          <DashboardUserRow
            v-for="user in recentUsers"
            :key="user.id"
            :initials="getInitials(user.name || user.email)"
            :name="user.name || user.email || '—'"
            :meta="formatRecentUserMeta(user)"
            :status-label="resolveUserStatusText(user.status)"
            :status-tone="resolveUserStatusTone(user.status)"
            @open="handleNavigate(`/clients/${user.id}`)" />
        </DashboardListPanel>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";
  import AdminMetricChart from "~/components/block/charts/AdminMetricChart.vue";

  import DashboardChartFilters from "./components/DashboardChartFilters.vue";
  import DashboardChartPanel from "./components/DashboardChartPanel.vue";
  import DashboardHeader from "./components/DashboardHeader.vue";
  import DashboardListPanel from "./components/DashboardListPanel.vue";
  import DashboardSkeleton from "./components/DashboardSkeleton.vue";
  import DashboardSummaryGrid from "./components/DashboardSummaryGrid.vue";
  import DashboardUserRow from "./components/DashboardUserRow.vue";
  import { useAdminDashboardPage } from "~/composables/admin/dashboard/useAdminDashboardPage";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const {
    advancedFiltersVisible,
    applyDashboardPreset,
    browserSelectOptions,
    bucketSelectOptions,
    chartSkeletonCards,
    currentOnlineClients,
    currentOnlineCount,
    deviceSelectOptions,
    formatNumber,
    formatOnlineTooltip,
    formatRecentUserMeta,
    formatTopOnlineClientMeta,
    getInitials,
    handleManualRefresh,
    handleNavigate,
    handleOnlineRangeSelected,
    isInitialLoading,
    isLoading,
    isRefreshing,
    lastUpdatedText,
    listSkeletonRows,
    metricRangePresets,
    onlineAxes,
    onlineCategoryKeys,
    onlineClientEmail,
    onlineClientName,
    onlineFilters,
    onlineLabels,
    onlineSeries,
    osSelectOptions,
    recentUsers,
    registrationLabels,
    registrationSeries,
    registrationsFilters,
    resolveOnlineStatusLabel,
    resolveOnlineStatusTone,
    resolveText,
    resolveUserStatusText,
    resolveUserStatusTone,
    summaryCards,
    summarySkeletonCards,
    toDatePickerValue,
    toggleAdvancedFilters,
    topOnlineClients,
    updateDashboardFilter,
    updateDateFilter,
  } = useAdminDashboardPage();
</script>
